import { Columns, Grid } from '@core-ds/icons/16';
import { breakpoint, color, fontSize, space } from '@core-ds/primitives';
import { _js } from '@ifixit/localize';
import { Button, ButtonGroup, Icon } from '@ifixit/toolbox';
import Fuse from 'fuse.js';
import { debounce, Dictionary, inRange, minBy } from 'lodash';
import React, { Component } from 'react';
import smoothscroll from 'smoothscroll-polyfill';
import styled from 'styled-components';
import Banner from './Banner';
import Breadcrumbs from './Breadcrumbs';
import ColumnExplorer from './ColumnExplorer';
import GridExplorer from './GridExplorer';
import NoResults from './NoResults';
import Spinner from './Spinner';
import { Hierarchy, Wiki } from './types';
import { above } from './utils/mediaQuery';
import isIE from './utils/isIE';

smoothscroll.polyfill();

export enum View {
   Grid = 'GRID',
   Column = 'COLUMN',
}

interface AlgoliaConfig {
   apiKey: string;
   appId: string;
   indexPrefix: string;
}

interface DevicePickerProps {
   fetchHierarchy: () => Promise<{
      hierarchy: Hierarchy;
      display_titles: Dictionary<string>;
   }>;
   fetchChildren: (title: string) => Promise<Array<Wiki>>;
   onSubmit: (title: string) => void;
   onCancel: () => void;
   allowOrphan?: boolean;
   initialDevice?: string;
   initialView?: View;
   objectName?: string;
   algoliaConfig?: AlgoliaConfig;
   onSearch?: (value: string) => void;
   category: string;
}

interface DevicePickerState {
   searchValue: string;
   search: string;
   tree: Hierarchy;
   displayTitles: Dictionary<string>;
   path: string[];
   view: View;
}

const Container = styled.div`
   display: flex;
   flex-direction: column;
   height: 100%;
   color: ${color.gray8};
   background-color: ${color.gray1};
`;

export const SearchContainer = styled.div`
   display: flex;
   flex: 0 0 auto;
   align-items: center;
   padding-left: 15px;
   border-bottom: 1px solid ${color.gray2};
`;

export const SearchInput = styled.input`
   flex: 1 1 auto;
   margin-bottom: 0px;
   padding: ${space[4]};
   font-family: inherit;
   font-size: ${fontSize[3]};
   color: inherit;
   background-color: transparent;
   border: none;
   outline: 0px;

   &::placeholder {
      color: ${color.gray5};
   }

   ${above(breakpoint.sm)} {
      font-size: ${fontSize[4]};
   }
`;

const BannerContainer = styled.div`
   flex: 0 0 auto;
   order: 1;

   ${above(breakpoint.sm)} {
      order: 0;
   }
`;

const Toolbar = styled.div`
   flex: 0 0 auto;
   order: -1;
   display: flex;
   padding: ${space[3]};
   background-color: ${color.white};

   ${above(breakpoint.sm)} {
      order: 1;
      padding: ${space[4]};
      background-color: transparent;
      border-top: 1px solid ${color.gray2};
   }
`;

const ToolbarRight = styled.div`
   margin-left: auto;
   display: flex;

   & > :not(:first-child) {
      margin-left: ${space[3]};
   }
`;

const SpinnerContainer = styled.div`
   flex: 1 1 100%;
   padding: ${space[4]};
   display: flex;
   flex-direction: column;
   justify-content: center;
   align-items: center;
   max-width: 100%;
`;

// enum for the state of the user's search
// INACTIVE is before searching, or after a successful search.
const SEARCH_INACTIVE = 'inactive';
// PENDING is during the 500ms debounce before actually performing a search.
const SEARCH_PENDING = 'pending';
// NO_RESULTS is when the search is completed, but didn't find a result.
const SEARCH_NO_RESULTS = 'no_results';

const HIDE_GRID_VIEW = isIE();

export class HierarchicalDevicePicker extends Component<
   DevicePickerProps,
   DevicePickerState
> {
   translations: { [key: string]: string } = {};

   static defaultProps = {
      initialDevice: '',
      initialView: HIDE_GRID_VIEW ? View.Column : View.Grid,
      allowOrphan: false,
      objectName: 'device',
   };

   constructor(props: DevicePickerProps) {
      super(props);

      this.state = {
         searchValue:
            this.props.initialDevice ||
            HierarchicalDevicePicker.defaultProps.initialDevice,
         search: this.props.initialDevice ? SEARCH_PENDING : SEARCH_INACTIVE,
         tree: null,
         displayTitles: {},
         path: [],
         view:
            props.initialView ||
            HierarchicalDevicePicker.defaultProps.initialView,
      };
   }

   componentDidMount() {
      // get iFixit's category hierarchy
      // TODO: investigate caching
      this.props
         .fetchHierarchy()
         .then((data) => {
            if (typeof data.hierarchy === 'undefined') {
               throw new Error('API response has no `hierarchy` property.');
            }

            this.setState({
               tree: data.hierarchy,
               displayTitles: data.display_titles,
            });
         })
         .then(() => {
            if (this.state.searchValue) {
               this.debouncedApplySearch();
            }

            if (this.props.category) {
               const category = this.getTitle(this.props.category);
               const path = this.getPath(category);
               this.setPath(path);
               this.setState({ view: View.Grid });
            }
         })
         .catch((reason) => {
            throw reason;
         });

      // Start with the search input focused.
      this.searchInputRef.focus();

      window.addEventListener('keydown', this.handleKeyDown);
   }

   componentDidUpdate(
      prevProps: DevicePickerProps,
      prevState: DevicePickerState,
   ) {
      if (prevState.tree !== this.state.tree) {
         this.itemList = null;
      }
   }

   componentWillUnmount() {
      // Cancel any trailing calls to this debounced function.
      this.debouncedApplySearch.cancel();

      window.removeEventListener('keydown', this.handleKeyDown);
   }

   /**
    * Get item relative to an index given a distance.
    * @param {Object} params
    * @param {string[]} params.list
    * @param {number} params.index
    * @param {number} params.distance
    * @returns {string} - Item given distance away from given index.
    */
   getRelativeItem = ({
      list,
      index,
      distance,
   }: {
      list: string[];
      index: number;
      distance: number;
   }) => {
      let newIndex = (index + distance) % list.length;

      if (newIndex < 0) {
         newIndex += list.length;
      }

      return list[newIndex];
   };

   /**
    * Get a tree node given a path.
    * @param {Object} params
    * @param {Object} params.tree
    * @param {string[]} params.path
    * @returns {Object} - Tree node.
    */
   getNode = ({ tree, path }: { tree: any; path: string[] }): any => {
      if (path.length === 0) {
         return tree;
      }

      return this.getNode({
         tree: tree[path[0]],
         path: path.slice(1),
      });
   };

   getTitle(title: string): string {
      for (const key in this.state.displayTitles) {
         if (this.state.displayTitles[key] === title) {
            return key;
         }
      }
      return title;
   }

   getPath(key: string): string[] {
      function recurse(tree: any, key: string): string[] | null {
         for (const i in tree) {
            if (i === key) {
               return [key];
            } else if (typeof tree[i] === 'object') {
               const path = recurse(tree[i], key);
               if (path) {
                  return [i, ...path];
               }
            }
         }
         return null;
      }
      return recurse(this.state.tree, key) || [];
   }

   /**
    * Update path and searchValue state given a path.
    * @param {string[]} path
    */
   setPath = (path: string[]) => {
      this.setState({
         searchValue: this.getDisplayTitleFromItemName(
            path[path.length - 1] || '',
         ),
         search: SEARCH_INACTIVE,
         path,
      });
   };

   /**
    * Store reference to the search input DOM element.
    * @param {HTMLElement} element
    */
   searchInputRef: any = null;
   setSearchInputRef = (element: HTMLElement | null) => {
      this.searchInputRef = element;
   };

   /**
    * Determine whether or not a submit action should be allowed.
    * @returns {boolean}
    */
   allowSubmit = () =>
      this.state.path.length !== 0 && this.state.search !== SEARCH_NO_RESULTS;

   /**
    * Handle all KeyDown events.
    * Calls the appropriate event handler based on which key was pressed.
    * @param {KeyboardEvent} event
    */
   handleKeyDown = (event: KeyboardEvent) => {
      switch (event.keyCode) {
         // Enter
         case 13:
            this.handleEnter(event);
            break;

         // Escape
         case 27:
            this.handleEscape();
            break;

         default:
            if (
               // if key is a-z, or ...
               (inRange(event.keyCode, 65, 91) ||
                  // if key is A-Z, or ...
                  inRange(event.keyCode, 48, 58) ||
                  // if key is backspace
                  event.keyCode === 8) &&
               // and the search input is not focused
               this.searchInputRef !== document.activeElement
            ) {
               this.searchInputRef.focus();
            }
      }
   };

   handleEnter = (event: KeyboardEvent) => {
      if (this.allowSubmit()) {
         const { path } = this.state;
         this.props.onSubmit(path[path.length - 1]);
      }

      event.preventDefault();
   };

   handleEscape = () => {
      this.props.onCancel();
   };

   /**
    * Handle search input change event.
    * @param {InputEvent} event
    */
   handleSearchChange = (event: any) => {
      // Don't search if the string is all whitespace.
      const isSearching = !/^\s*$/.test(event.target.value);
      // Reset the device picker if the search text gets deleted.
      const path = isSearching ? this.state.path : [];

      if (event.target.value) {
         this.props.onSearch && this.props.onSearch(event.target.value);
      }

      this.setState({
         searchValue: event.target.value,
         search: isSearching ? SEARCH_PENDING : SEARCH_INACTIVE,
         path,
      });
      this.debouncedApplySearch();
   };

   getDisplayTitleFromItemName = (itemName: string): string => {
      return this.state.displayTitles[itemName] || itemName;
   };

   /**
    * Returns a flat list of [{
    *   itemName,
    *   path,
    * }, ...]
    */
   // from the default tree structure.
   createItemList = (
      tree: any,
      itemName: string | null = null,
      path: string[] = [],
   ): any => {
      const displayTitle = itemName
         ? this.getDisplayTitleFromItemName(itemName)
         : null;

      const item = {
         itemName,
         displayTitle,
         path,
         pathText: path.map(this.getDisplayTitleFromItemName).join(' '),
      };

      if (!tree) {
         // This is a leaf.
         return item;
      }

      const itemList = [];

      if (itemName) {
         // If this isn't the root node, include it in the list.
         itemList.push(item);
      }

      // Recursively create a list of items for each child.
      const childItems = Object.keys(tree).map((itemName) => {
         const childTree = tree[itemName];
         const childPath = [...path, itemName];
         return this.createItemList(childTree, itemName, childPath);
      });

      // Flatten the lists together.
      return itemList.concat(...childItems);
   };

   /**
    * Uses the current searchValue to set the selected path.
    */
   itemList: any;
   applySearch = () => {
      if (this.state.search !== SEARCH_PENDING) {
         return;
      }

      // Creating a flat list from the tree is expensive, so save the result.
      this.itemList = this.itemList || this.createItemList(this.state.tree);

      const fuse = new Fuse<{
         itemName: string;
         displayTitle: string;
         path: string[];
         pathText: string;
      }>(this.itemList, {
         keys: [
            {
               name: 'itemName',
               weight: 0.3,
            },
            {
               name: 'pathText',
               weight: 0.7,
            },
            {
               name: 'displayTitle',
               weight: 0.3,
            },
         ],
         includeScore: true,
         threshold: 0.4,
      });
      const results = fuse.search(this.state.searchValue.trim());

      if (results.length > 0) {
         const bestResult = minBy(results, (result) => {
            if (!result || result.score === undefined) {
               throw new Error('The fuse.js result was empty/wrong type.');
            }
            // Prefer more general categories (which have a smaller path length).
            return result.score * (1 + 0.1 * result.item.path.length);
         });
         this.setState({
            path: bestResult ? bestResult.item.path : [],
            search: SEARCH_INACTIVE,
         });
      } else {
         this.setState({
            search: SEARCH_NO_RESULTS,
            path: [],
         });
      }
   };

   /**
    * Debounced version of applySearch, so that the user can finish typing before
    * the UI jumps around.
    */
   debouncedApplySearch = debounce(this.applySearch, 500);

   render() {
      const { searchValue, tree, displayTitles, path, search, view } =
         this.state;
      const {
         fetchChildren,
         onSubmit,
         onCancel,
         allowOrphan = HierarchicalDevicePicker.defaultProps.allowOrphan,
         objectName = HierarchicalDevicePicker.defaultProps.objectName,
      } = this.props;

      return (
         <Container data-reactroot id="devicePickerModal">
            <SearchContainer>
               <Icon name="search" size={25} color={color.gray5} />
               <SearchInput
                  ref={this.setSearchInputRef}
                  placeholder={_js('Search')}
                  value={searchValue}
                  onChange={this.handleSearchChange}
                  onKeyDown={(event) =>
                     event.key === 'Enter' && this.applySearch()
                  }
               />
               {!HIDE_GRID_VIEW && (
                  <ButtonGroup css={{ marginRight: space[4] }}>
                     <Button
                        design={view === View.Grid ? 'secondary' : 'default'}
                        onClick={() => this.setState({ view: View.Grid })}
                        css={{ margin: 0, padding: space[2] }}
                     >
                        <Grid
                           color={
                              view === View.Grid ? color.gray8 : color.gray5
                           }
                        />
                     </Button>
                     <Button
                        design={view === View.Column ? 'secondary' : 'default'}
                        onClick={() => this.setState({ view: View.Column })}
                        css={{ margin: 0, padding: space[2] }}
                     >
                        <Columns
                           color={
                              view === View.Column ? color.gray8 : color.gray5
                           }
                        />
                     </Button>
                  </ButtonGroup>
               )}
            </SearchContainer>

            {searchValue &&
               path.length > 0 &&
               searchValue.trim().toLowerCase() !==
                  this.getDisplayTitleFromItemName(
                     path[path.length - 1],
                  ).toLowerCase() &&
               allowOrphan && (
                  <BannerContainer>
                     <Banner
                        callToAction={_js('Choose %1', `"${searchValue}"`)}
                        onClick={() => onSubmit(searchValue)}
                     >
                        {_js("Don't see what you're looking for?")}
                     </Banner>
                  </BannerContainer>
               )}

            {path.length > 0 ? (
               <Breadcrumbs
                  path={path}
                  getDisplayTitleFromItemName={this.getDisplayTitleFromItemName}
                  onChange={this.setPath}
               />
            ) : null}

            {search === SEARCH_NO_RESULTS ? (
               <NoResults
                  query={searchValue}
                  allowOrphan={allowOrphan}
                  selectItem={onSubmit}
               />
            ) : tree ? (
               view === View.Grid ? (
                  <GridExplorer
                     hierarchy={tree}
                     displayTitles={displayTitles}
                     fetchChildren={fetchChildren}
                     path={path}
                     onChange={this.setPath}
                     onSubmit={onSubmit}
                  />
               ) : (
                  <ColumnExplorer
                     hierarchy={tree}
                     displayTitles={displayTitles}
                     fetchChildren={fetchChildren}
                     path={path}
                     onChange={this.setPath}
                     onSubmit={onSubmit}
                  />
               )
            ) : (
               <SpinnerContainer>
                  <Spinner color={color.gray5} />
               </SpinnerContainer>
            )}

            <Toolbar>
               <ToolbarRight>
                  <Button onClick={onCancel}>{_js('Cancel')}</Button>
                  <Button
                     design="primary"
                     disabled={!this.allowSubmit()}
                     onClick={() => onSubmit(path[path.length - 1])}
                  >
                     {/* Translators: %1 -> the singular object name for objects; usually "Device" or "Category". */}
                     {_js('Choose %1', objectName)}
                  </Button>
               </ToolbarRight>
            </Toolbar>
         </Container>
      );
   }
}

export default HierarchicalDevicePicker;
