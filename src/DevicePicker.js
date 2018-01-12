import React, { Component } from 'react';
import PropTypes from 'prop-types';
import glamorous from 'glamorous';
import smoothscroll from 'smoothscroll-polyfill';
import Fuse from 'fuse.js';
import { debounce, minBy, inRange } from 'lodash';

import { Button, Icon, constants } from 'toolbox';
import List from './List';
import Banner from './Banner';
import PreviewContainer from './PreviewContainer';
import NoResults from './NoResults';

smoothscroll.polyfill();

const { breakpoint, color, fontSize, lineHeight, spacing } = constants;

// window._js is used as a translation function
// If no translation function is defined, window._js becomes a noop
if (typeof window._js === 'undefined') {
  window._js = s => s;
}

const propTypes = {
  getHierarchy: PropTypes.func.isRequired,
  getDevice: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  initialDevice: PropTypes.string,
};

const defaultProps = {
  initialDevice: '',
};

const Container = glamorous.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  color: color.grayAlpha[9],
});

const SearchInput = glamorous('input', {
  displayName: 'SearchInput',
})({
  flex: '0 0 auto',
  width: '100%',
  marginBottom: 0,
  padding: spacing[3],
  fontFamily: 'inherit',
  fontSize: fontSize[3],
  color: 'inherit',
  backgroundColor: 'transparent',
  border: 'none',
  outline: 0,
  borderBottom: `1px solid ${color.grayAlpha[3]}`,

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

const Item = glamorous('div', {
  displayName: 'Item',
  withProps: { role: 'button' },
})(
  {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${spacing[1]} ${spacing[1]} ${spacing[1]} ${spacing[3]}`,
    fontSize: fontSize[2],
    lineHeight: lineHeight.copy,
    cursor: 'pointer',
    userSelect: 'none',

    '& svg': {
      opacity: 0.5,
    },
  },
  ({ isHighlighted }) =>
    isHighlighted && { backgroundColor: color.grayAlpha[3] },
  ({ isSelected }) =>
    isSelected && {
      color: color.white,
      backgroundColor: color.blue[4],
      '& svg': {
        opacity: 1,
      },
    },
);

const ItemText = glamorous.span({
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
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

class DevicePicker extends Component {
  state = {
    searchValue: this.props.initialDevice,
    search: this.props.initialDevice ? SEARCH_PENDING : SEARCH_INACTIVE,
    tree: null,
    path: [],
  };

  componentDidMount() {
    // get iFixit's category hierarchy
    // TODO: investigate caching
    this.props
      .getHierarchy()
      .then(data => {
        if (typeof data.hierarchy === 'undefined') {
          throw new Error('API response has no `hierarchy` property.');
        }

        this.setState({ tree: data.hierarchy });
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

  componentDidUpdate(prevProps, prevState) {
    if (prevState.path !== this.state.path && this.listsContainerRef) {
      // if path changed,
      // scroll to right edge
      this.listsContainerRef.scroll({
        top: 0,
        left: this.listsContainerRef.scrollWidth,
        behavior: 'smooth',
      });
    }

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
  getRelativeItem = ({ list, index, distance }) => {
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
  getNode = ({ tree, path }) => {
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
  setPath = path => {
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
  setSearchInputRef = element => {
    this.searchInputRef = element;
  };

  /**
   * Store reference to the lists container DOM element.
   * @param {HTMLElement} element
   */
  setListsContainerRef = element => {
    this.listsContainerRef = element;
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
  handleKeyDown = event => {
    switch (event.keyCode) {
      // Enter
      case 13:
        this.handleEnter(event);
        break;

      // Escape
      case 27:
        this.handleEscape();
        break;

      // ArrowLeft
      case 37:
        this.handleArrowLeft(event);
        break;

      // ArrowRight
      case 39:
        this.handleArrowRight(event);
        break;

      // ArrowUp
      case 38:
        this.handleArrowUpDown(event);
        break;

      // ArrowDown
      case 40:
        this.handleArrowUpDown(event);
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

  handleEnter = event => {
    if (this.allowSubmit()) {
      const { path } = this.state;
      this.props.onSubmit(path[path.length - 1]);
    }

    event.preventDefault();
  };

  handleEscape = () => {
    this.props.onCancel();
  };

  handleArrowLeft = event => {
    const { path } = this.state;

    // go back to the previously highlighted item
    this.setPath(path.slice(0, path.length - 1));

    event.preventDefault();
  };

  handleArrowRight = event => {
    const { tree, path } = this.state;

    const currentNode = this.getNode({ tree, path });

    if (currentNode && Object.keys(currentNode).length > 0) {
      // add first item in right list to path
      this.setPath([...path, Object.keys(currentNode)[0]]);
    }

    event.preventDefault();
  };

  handleArrowUpDown = event => {
    const { tree, path } = this.state;

    const currentParentNode = this.getNode({
      tree,
      path: path.slice(0, path.length - 1),
    });

    const highlightedIndex = Object.keys(currentParentNode).findIndex(
      key => key === path[path.length - 1],
    );

    const newItem = this.getRelativeItem({
      list: Object.keys(currentParentNode),
      index: highlightedIndex,
      distance: event.keyCode === 40 ? 1 : -1, // 40 is the keyCode for ArrowDown
    });

    // highlight the next/previous item in the current list
    this.setPath([...path.slice(0, path.length - 1), newItem]);

    event.preventDefault();
  };

  /**
   * Handle search input change event.
   * @param {InputEvent} event
   */
  handleSearchChange = event => {
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
  createItemList = (tree, itemName = null, path = []) => {
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
  applySearch = () => {
    if (this.state.search !== SEARCH_PENDING) {
      return;
    }

    // Creating a flat list from the tree is expensive, so save the result.
    this.itemList = this.itemList || this.createItemList(this.state.tree);

    const fuse = new Fuse(this.itemList, {
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
        path: bestResult.item.path,
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

  /**
   * Remove words in parent title from category title
   * because category titles are sometimes long and redundant.
   * @param {Object} params
   * @param {string} params.title
   * @param {string} params.parentTitle
   * @param {string} - Category title without words from parent title.
   */
  removeParentFromTitle = ({ title, parentTitle }) =>
    title
      .split(' ')
      .filter(
        word =>
          !parentTitle
            .toLowerCase()
            .split(' ')
            .includes(word.toLowerCase()),
      )
      .join(' ');

  /**
   * Render path along a tree.
   * @param {Object} params
   * @param {Object} params.tree
   * @param {string[]} params.leadingPath
   * @param {string[]} params.trailingPath
   * @param {ReactElement[]} - Array of React elements to render.
   */
  renderLists = ({ tree, leadingPath, trailingPath = [] } = {}) => {
    // use the last value of trailingPath as title of list
    const title = trailingPath[trailingPath.length - 1] || '';

    // index of highlighted item in list
    // index will be -1 if no item is highlighted
    const highlightedIndex =
      tree && Object.keys(tree).findIndex(key => key === leadingPath[0]);

    /**
     * Handle list click event.
     */
    const handleListClick = () => {
      // deselect all items in list
      this.setPath(trailingPath);
    };

    /**
     * Handle item click event.
     * @param {MouseEvent} event
     * @param {string} item
     */
    const handleItemClick = (event, item) => {
      // select item
      this.setPath([...trailingPath, item]);
      event.stopPropagation();
    };

    const list = tree ? (
      <List
        key={title}
        data={Object.keys(tree)}
        highlightedIndex={highlightedIndex}
        onClick={handleListClick}
        renderItem={({ item, isHighlighted }) => (
          <Item
            key={item}
            isHighlighted={isHighlighted}
            isSelected={isHighlighted && leadingPath.length === 1}
            onClick={event => handleItemClick(event, item)}
          >
            <ItemText>
              {window._js(this.removeParentFromTitle({
                title: item,
                parentTitle: title,
              }))}
            </ItemText>
            {tree[item] && <Icon name="chevron-right" size={20} />}
          </Item>
        )}
      />
    ) : (
      <PreviewContainer
        key={window._js(title)}
        getDevice={() => this.props.getDevice(title.replace(/ /g, '_'))}
      />
    );

    if (leadingPath.length === 0) {
      return [list];
    }

    return [
      list,
      ...this.renderLists({
        tree: tree[leadingPath[0]],
        leadingPath: leadingPath.slice(1),
        trailingPath: [...trailingPath, ...leadingPath.slice(0, 1)],
      }),
    ];
  };

  render() {
    const { searchValue, tree, path, search } = this.state;
    const { onSubmit, onCancel } = this.props;

    return (
      <Container>
        <SearchInput
          innerRef={this.setSearchInputRef}
          placeholder={window._js('Search')}
          value={window._js(searchValue)}
          onChange={this.handleSearchChange}
          onKeyDown={event => event.key === 'Enter' && this.applySearch()}
        />

        {searchValue &&
          path.length > 0 &&
          search === SEARCH_INACTIVE &&
          searchValue.trim().toLowerCase() !==
            path[path.length - 1].toLowerCase() && (
            <BannerContainer>
              <Banner
                callToAction={window._js('Choose %1', searchValue)}
                onClick={() => onSubmit(searchValue)}
              >
                window._js('Don\'t see what you\'re looking for?')
              </Banner>
            </BannerContainer>
          )}

        <ListsContainer innerRef={this.setListsContainerRef}>
          {search === SEARCH_NO_RESULTS ? (
            <NoResults itemName={searchValue} selectItem={onSubmit} />
          ) : (
            tree && this.renderLists({ tree, leadingPath: path })
          )}
        </ListsContainer>

        <Toolbar>
          <ToolbarRight>
            <Button onClick={onCancel}>{window._js('Cancel')}</Button>
            <Button
              design="primary"
              disabled={!this.allowSubmit()}
              onClick={() => onSubmit(path[path.length - 1])}
            >
              {window._js('Choose device')}
            </Button>
          </ToolbarRight>
        </Toolbar>
      </Container>
    );
  }
}

DevicePicker.propTypes = propTypes;
DevicePicker.defaultProps = defaultProps;

export default DevicePicker;
