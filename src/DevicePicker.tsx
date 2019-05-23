import { Button, constants, Icon } from '@ifixit/toolbox';
import Fuse from 'fuse.js';
import glamorous from 'glamorous';
import { debounce, Dictionary, inRange, minBy } from 'lodash';
import React, { Component } from 'react';
import smoothscroll from 'smoothscroll-polyfill';
import Banner from './Banner';
import ColumnExplorer from './ColumnExplorer';
import NoResults from './NoResults';
import { Hierarchy } from './types';

smoothscroll.polyfill();

const { breakpoint, color, fontSize, spacing } = constants;

interface DevicePickerProps {
   getHierarchy: () => Promise<{
      hierarchy: Hierarchy;
      display_titles: Dictionary<string>;
   }>;
   onSubmit: (title: string) => void;
   onCancel: () => void;
   translate: (...strings: string[]) => string;
   allowOrphan: boolean;
   initialDevice: string;
}

interface DevicePickerState {
   searchValue: string;
   search: string;
   tree: Hierarchy;
   displayTitles: Dictionary<string>;
   path: string[];
}

const Container = glamorous.div({
   display: 'flex',
   flexDirection: 'column',
   height: '100%',
   color: color.grayAlpha[9],
});

const SearchContainer = glamorous('div', { displayName: 'SearchContainer' })({
   display: 'flex',
   flex: '0 0 auto',
   alignItems: 'center',
   paddingLeft: '15px',
   borderBottom: `1px solid ${color.grayAlpha[3]}`,
});

const SearchInput = glamorous('input', {
   displayName: 'SearchInput',
})({
   flex: '1 1 auto',
   marginBottom: 0,
   padding: spacing[3],
   fontFamily: 'inherit',
   fontSize: fontSize[3],
   color: 'inherit',
   backgroundColor: 'transparent',
   border: 'none',
   outline: 0,

   '&::placeholder': {
      color: color.grayAlpha[5],
   },

   [breakpoint.sm]: {
      fontSize: fontSize[4],
   },
});

const ListsContainer = glamorous('div', { displayName: 'ListsContainer' })({
   flex: '1 1 auto',
   display: 'flex',
   overflowX: 'auto',
   WebkitOverflowScrolling: 'touch',
});

const BannerContainer = glamorous.div({
   flex: '0 0 auto',
   order: 1,

   [breakpoint.sm]: {
      order: 0,
   },
});

const Toolbar = glamorous('div', { displayName: 'Toolbar' })({
   flex: '0 0 auto',
   order: -1,
   display: 'flex',
   padding: spacing[2],
   backgroundColor: color.grayAlpha[2],

   [breakpoint.sm]: {
      order: 1,
      padding: spacing[3],
      backgroundColor: 'transparent',
      borderTop: `1px solid ${color.grayAlpha[3]}`,
   },
});

const ToolbarRight = glamorous('div', { displayName: 'ToolbarRight' })({
   marginLeft: 'auto',
   display: 'flex',

   '& > :not(:first-child)': {
      marginLeft: spacing[2],
   },
});

// enum for the state of the user's search
// INACTIVE is before searching, or after a successful search.
const SEARCH_INACTIVE = 'inactive';
// PENDING is during the 500ms debounce before actually performing a search.
const SEARCH_PENDING = 'pending';
// NO_RESULTS is when the search is completed, but didn't find a result.
const SEARCH_NO_RESULTS = 'no_results';

class DevicePicker extends Component<DevicePickerProps, DevicePickerState> {
   translations: { [key: string]: string } = {};

   static defaultProps = {
      initialDevice: '',
      allowOrphan: false,
      translate: (s: string) => s,
   };

   constructor(props: DevicePickerProps) {
      super(props);

      this.state = {
         searchValue: this.props.initialDevice,
         search: this.props.initialDevice ? SEARCH_PENDING : SEARCH_INACTIVE,
         tree: null,
         displayTitles: {},
         path: [],
      };
   }

   componentDidMount() {
      // get iFixit's category hierarchy
      // TODO: investigate caching
      this.props
         .getHierarchy()
         .then(data => {
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
         })
         .catch(reason => {
            throw reason;
         });

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

   /**
    * Update path and searchValue state given a path.
    * @param {string[]} path
    */
   setPath = (path: string[]) => {
      this.setState({
         searchValue: path[path.length - 1] || '',
         search: SEARCH_INACTIVE,
         path,
      });
   };

   /**
    * Store reference to the search input DOM element.
    * @param {HTMLElement} element
    */
   searchInputRef: any = null;
   setSearchInputRef = (element: HTMLElement) => {
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
                  // if key is backspace, or ...
                  event.keyCode === 8 ||
                  // if key is space
                  event.keyCode === 32) &&
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

      this.setState({
         searchValue: event.target.value,
         search: isSearching ? SEARCH_PENDING : SEARCH_INACTIVE,
         path,
      });
      this.debouncedApplySearch();
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
      const item = {
         itemName,
         path,
         pathText: path.join(' '),
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
      const childItems = Object.keys(tree).map(itemName => {
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
         score: number;
         item: {
            itemName: string;
            path: string[];
            pathText: string;
         };
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
         ],
         includeScore: true,
         threshold: 0.4,
      });
      const results = fuse.search(this.state.searchValue.trim());

      if (results.length > 0) {
         const bestResult = minBy(
            results,
            result =>
               // Prefer more general categories (which have a smaller path length).
               result.score * (1 + 0.1 * result.item.path.length),
         );
         this.setState({
            path: bestResult ? bestResult.item.path : [],
            search: SEARCH_INACTIVE,
         });
      } else {
         this.setState({
            search: SEARCH_NO_RESULTS,
         });
      }
   };

   /**
    * Debounced version of applySearch, so that the user can finish typing before
    * the UI jumps around.
    */
   debouncedApplySearch = debounce(this.applySearch, 500);

   render() {
      const { searchValue, tree, displayTitles, path, search } = this.state;
      const { onSubmit, onCancel, allowOrphan, translate } = this.props;

      return (
         <Container data-reactroot id="devicePickerModal">
            <SearchContainer>
               <Icon name="search" size={25} color={color.gray[5]} />
               <SearchInput
                  innerRef={this.setSearchInputRef}
                  placeholder={translate('Search')}
                  value={searchValue}
                  onChange={this.handleSearchChange}
                  onKeyDown={event =>
                     event.key === 'Enter' && this.applySearch()
                  }
               />
            </SearchContainer>

            {searchValue &&
               path.length > 0 &&
               search === SEARCH_INACTIVE &&
               searchValue.trim().toLowerCase() !==
                  path[path.length - 1].toLowerCase() &&
               allowOrphan && (
                  <BannerContainer>
                     <Banner
                        callToAction={translate(
                           'Choose %1',
                           `"${searchValue}"`,
                        )}
                        onClick={() => onSubmit(searchValue)}
                     >
                        {translate("Don't see what you're looking for?")}
                     </Banner>
                  </BannerContainer>
               )}

            {search === SEARCH_NO_RESULTS ? (
               <NoResults
                  query={searchValue}
                  allowOrphan={allowOrphan}
                  selectItem={onSubmit}
                  translate={translate}
               />
            ) : (
               tree && (
                  <ColumnExplorer
                     hierarchy={tree}
                     displayTitles={displayTitles}
                     fetchChildren={title =>
                        fetch(
                           `https://cbemis.cominor.com/api/2.0/wikis/CATEGORY/${title}/children`,
                        ).then(response => response.json())
                     }
                     path={path}
                     onChange={this.setPath}
                     translate={this.props.translate}
                  />
               )
            )}

            <Toolbar>
               <ToolbarRight>
                  <Button onClick={onCancel}>{translate('Cancel')}</Button>
                  <Button
                     design="primary"
                     disabled={!this.allowSubmit()}
                     onClick={() => onSubmit(path[path.length - 1])}
                  >
                     {translate('Choose device')}
                  </Button>
               </ToolbarRight>
            </Toolbar>
         </Container>
      );
   }
}

export default DevicePicker;
