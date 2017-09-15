import React, { Component } from 'react';
import PropTypes from 'prop-types';
import glamorous from 'glamorous';
import smoothscroll from 'smoothscroll-polyfill';
import Fuse from 'fuse.js';
import { debounce } from 'lodash';

import { Button, Icon, constants } from 'toolbox';
import List from './List';
import PreviewContainer from './PreviewContainer';

smoothscroll.polyfill();

const { breakpoint, color, fontSize, lineHeight, spacing } = constants;

const propTypes = {
  getHierarchy: PropTypes.func.isRequired,
  getDevice: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
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
  borderTop: `1px solid ${color.grayAlpha[3]}`,
  borderBottom: `1px solid ${color.grayAlpha[3]}`,
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
  },
});

const ToolbarRight = glamorous('div', { displayName: 'ToolbarRight' })({
  marginLeft: 'auto',
  display: 'flex',

  '& > :not(:first-child)': {
    marginLeft: spacing[2],
  },
});

class DevicePicker extends Component {
  state = {
    searchValue: '',
    isSearching: false,
    isSearchEmpty: false,
    tree: null,
    path: [],
  };

  componentDidMount() {
    // get iFixit's category hierarchy
    this.props.getHierarchy().then(data => {
      this.setState({ tree: data.hierarchy });
    });

    // TODO: investigate caching
  }

  componentWillUnmount() {
    // Cancel any trailing calls to this debounced function.
    this.applySearch.cancel();
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
      isSearching: false,
      path,
    });
  };

  /**
   * Store reference to the lists container DOM element.
   * @param {HTMLElement} element
   */
  setListsContainerRef = element => {
    this.listsContainerRef = element;
  };

  /**
   * Handle search input change event.
   * @param {InputEvent} event
   */
  handleSearchChange = event => {
    this.setState({
      searchValue: event.target.value,
      isSearching: !/^\s*$/.test(event.target.value),
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
    };

    if (!tree) {
      // This is a leaf.
      return item;
    }

    return [
      // Include this node in the list, unless it's the root node.
      ...(itemName ? [item] : []),
      // Recursively include all child nodes.
      ...[].concat(...Object.keys(tree).map(itemName => {
        return this.createItemList(tree[itemName], itemName, [...path, itemName]);
      })),
    ];
  };

  /**
   * Uses the current searchValue to set the selected path.
   */
  applySearch = () => {
    if (!this.state.isSearching) {
      return;
    }

    // Creating a flat list from the tree is expensive, so save the result.
    this.itemList = this.itemList || this.createItemList(this.state.tree);
    const fuse = new Fuse(this.itemList, { keys: ['itemName'] });
    const bestItem = fuse.search(this.state.searchValue)[0];

    if (bestItem) {
      this.setState({
        path: bestItem.path,
        isSearchEmpty: false,
      });
    } else {
      this.setState({
        isSearchEmpty: true,
      });
    }
  };

  /**
   * Debounced version of applySearch, so that the user can finish typing before
   * the UI jumps around.
   */
  debouncedApplySearch = debounce(this.applySearch, 500);

  /**
   * Handle lists container key down event.
   * @param {KeyboardEvent}
   */
  handleListsContainerKeyDown = event => {
    const { tree, path } = this.state;

    if (event.key === 'ArrowLeft') {
      if (path.length > 1) {
        // focus left list
        this.listsContainerRef.children[path.length - 2].focus();
        // remove last item from path
        this.setPath(path.slice(0, path.length - 1));
      }

      event.preventDefault();
    }

    if (event.key === 'ArrowRight') {
      const currentNode = this.getNode({ tree, path });

      if (currentNode && Object.keys(currentNode).length > 0) {
        // focus right list
        this.listsContainerRef.children[path.length].focus();
        // add first item in right list to path
        this.setPath([...path, Object.keys(currentNode)[0]]);
      }

      event.preventDefault();
    }
  };

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
     * Handle list key down event.
     * @param {KeyboardEvent} event
     */
    const handleListKeyDown = event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        // change selected item to previous or next item
        const newItem = this.getRelativeItem({
          list: Object.keys(tree),
          index: highlightedIndex,
          distance: event.key === 'ArrowDown' ? 1 : -1,
        });

        this.setPath([...trailingPath, newItem]);
        event.preventDefault();
      }
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
        onKeyDown={handleListKeyDown}
        renderItem={({ item, isHighlighted }) => (
          <Item
            key={item}
            isHighlighted={isHighlighted}
            isSelected={isHighlighted && leadingPath.length === 1}
            onClick={event => handleItemClick(event, item)}
          >
            <ItemText>
              {this.removeParentFromTitle({
                title: item,
                parentTitle: title,
              })}
            </ItemText>
            {tree[item] && <Icon name="chevron-right" size={20} />}
          </Item>
        )}
      />
    ) : (
      <PreviewContainer
        key={title}
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
    const { searchValue, tree, path, isSearching, isSearchEmpty } = this.state;
    const { onSubmit, onCancel } = this.props;

    return (
      <Container>
        <SearchInput
          placeholder="Search"
          value={searchValue}
          onChange={this.handleSearchChange}
          onKeyDown={event => event.key === 'Enter' && this.applySearch()}
        />
        {isSearching && isSearchEmpty ? (
          <p>No matches found.</p>
        ) : (
          <ListsContainer
            innerRef={this.setListsContainerRef}
            onKeyDown={this.handleListsContainerKeyDown}
          >
            {tree && this.renderLists({ tree, leadingPath: path })}
          </ListsContainer>
        )}
        <Toolbar>
          <ToolbarRight>
            <Button onClick={onCancel}>Cancel</Button>
            <Button
              design="primary"
              disabled={path.length === 0}
              onClick={() => onSubmit(path[path.length - 1])}
            >
              Choose device
            </Button>
          </ToolbarRight>
        </Toolbar>
      </Container>
    );
  }
}

DevicePicker.propTypes = propTypes;

export default DevicePicker;
