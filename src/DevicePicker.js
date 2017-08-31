import React, { Component } from 'react';
import PropTypes from 'prop-types';
import glamorous from 'glamorous';

// polyfills
import 'whatwg-fetch';
import smoothscroll from 'smoothscroll-polyfill';

import List from './List';
import PreviewContainer from './PreviewContainer';
// TODO: add toolbox

smoothscroll.polyfill();

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

const Container = glamorous.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

const SearchInput = glamorous('input', {
  displayName: 'SearchInput',
})({
  flex: '0 0 auto',
  width: '100%',
  padding: '1rem',
  fontFamily: 'inherit',
  fontSize: '1.5rem',
  backgroundColor: 'transparent',
  border: 'none',
  outline: 0,
});

const ListsContainer = glamorous('div', { displayName: 'ListsContainer' })({
  flex: '1 1 auto',
  display: 'flex',
  borderTop: '1px solid rgba(0, 3, 6, 0.12)',
  borderBottom: '1px solid rgba(0, 3, 6, 0.12)',
  overflowX: 'auto',
  WebkitOverflowScrolling: 'touch',
});

const Item = glamorous('div', {
  displayName: 'Item',
  withProps: { role: 'button' },
})(
  {
    padding: '0.5rem 1rem',
    lineHeight: 1.5,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    cursor: 'pointer',
    userSelect: 'none',
  },
  ({ isHighlighted }) => isHighlighted && { backgroundColor: 'lightgray' },
  ({ isSelected }) =>
    isSelected && { color: 'white', backgroundColor: 'royalblue' },
);

const Toolbar = glamorous('div', { displayName: 'Toolbar' })({
  flex: '0 0 auto',
  display: 'flex',
  padding: '1rem',
});

const ToolbarRight = glamorous('div', { displayName: 'ToolbarRight' })({
  marginLeft: 'auto',
});

class DevicePicker extends Component {
  state = {
    searchValue: '',
    tree: null,
    path: [],
  };

  componentDidMount() {
    // get iFixit's category hierarchy
    fetch('https://www.ifixit.com/api/2.0/wikis/CATEGORY?display=hierarchy')
      .then(response => response.json())
      .then(data => {
        this.setState({ tree: data.hierarchy });
      });

    // TODO: investigate caching
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.path !== this.state.path) {
      // if path changed,
      // scroll to right edge
      this.listsContainerRef.scroll({
        top: 0,
        left: this.listsContainerRef.scrollWidth,
        behavior: 'smooth',
      });
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
    this.setState({ searchValue: event.target.value });
  };

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
            {this.removeParentFromTitle({
              title: item,
              parentTitle: title,
            })}
          </Item>
        )}
      />
    ) : (
      <PreviewContainer key={title} title={title} />
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
    const { searchValue, tree, path } = this.state;
    const { onSubmit } = this.props;

    return (
      <Container>
        <SearchInput
          placeholder="Search"
          value={searchValue}
          onChange={this.handleSearchChange}
        />
        <ListsContainer
          innerRef={this.setListsContainerRef}
          onKeyDown={this.handleListsContainerKeyDown}
        >
          {tree && this.renderLists({ tree, leadingPath: path })}
        </ListsContainer>
        <Toolbar>
          <ToolbarRight>
            <button
              disabled={path.length === 0}
              onClick={() => onSubmit(path[path.length - 1])}
            >
              Choose device
            </button>
          </ToolbarRight>
        </Toolbar>
      </Container>
    );
  }
}

DevicePicker.propTypes = propTypes;

export default DevicePicker;
