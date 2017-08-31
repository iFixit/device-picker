import React, { Component } from 'react';
import glamorous, { Div } from 'glamorous';
import smoothscroll from 'smoothscroll-polyfill';
import List from './List';

smoothscroll.polyfill();

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

const Footer = glamorous('div', { displayName: 'Footer' })({
  flex: '0 0 auto',
  display: 'flex',
  padding: '1rem',
});

const FooterRight = glamorous('div', { displayName: 'FooterRight' })({
  marginLeft: 'auto',
});

// TODO: rename this component DevicePicker
class App extends Component {
  state = {
    searchValue: '',
    tree: null,
    path: [],
  };

  componentDidMount() {
    // TODO: figure out how to minimize load time
    // TODO: include fetch polyfill
    fetch('https://www.ifixit.com/api/2.0/wikis/CATEGORY?display=hierarchy')
      .then(response => response.json())
      .then(data => {
        this.setState({ tree: data.hierarchy });
      });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.path !== this.state.path) {
      // scroll to right edge
      this.listsContainerRef.scroll({
        top: 0,
        left: this.listsContainerRef.scrollWidth,
        behavior: 'smooth',
      });
    }
  }

  getRelativeItem = ({ list, currentIndex, step }) => {
    let newIndex = (currentIndex + step) % list.length;

    if (newIndex < 0) {
      newIndex += list.length;
    }

    return list[newIndex];
  };

  getNode = ({ tree, path }) => {
    if (path.length === 0) {
      return tree;
    }

    return this.getNode({
      tree: tree[path[0]],
      path: path.slice(1),
    });
  };

  setPath = path => {
    this.setState({
      searchValue: path[path.length - 1] || '',
      path,
    });
  };

  setListsContainerRef = node => {
    this.listsContainerRef = node;
  };

  handleSearchChange = event => {
    this.setState({ searchValue: event.target.value });
  };

  removeParentFromTitle = ({ title, parentTitle }) =>
    title
      .split(' ')
      .filter(word => !parentTitle.split(' ').includes(word))
      .join(' ');

  renderLists = ({ tree, leadingPath, trailingPath = [] } = {}) => {
    const highlightedIndex =
      tree && Object.keys(tree).findIndex(key => key === leadingPath[0]);

    const list = tree ? (
      <List
        key={trailingPath[trailingPath.length - 1] || ''}
        data={Object.keys(tree)}
        highlightedIndex={highlightedIndex}
        onKeyDown={event => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            const newItem = this.getRelativeItem({
              list: Object.keys(tree),
              currentIndex: highlightedIndex,
              step: event.key === 'ArrowDown' ? 1 : -1,
            });

            this.setPath([...trailingPath, newItem]);
            event.preventDefault();
          }
        }}
        onClick={() => this.setPath(trailingPath)}
        renderItem={({ item, isHighlighted }) => (
          <Item
            key={item}
            isHighlighted={isHighlighted}
            isSelected={isHighlighted && leadingPath.length === 1}
            onClick={event => {
              this.setPath([...trailingPath, item]);
              event.stopPropagation();
            }}
          >
            {this.removeParentFromTitle({
              title: item,
              parentTitle: trailingPath[trailingPath.length - 1] || '',
            })}
          </Item>
        )}
      />
    ) : (
      <div>
        {/* TODO: create a Preview component */}
        {/* TODO: get leaf node data */}
        End!
      </div>
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

    return (
      <Div display="flex" flexDirection="column" height="100vh">
        <SearchInput
          placeholder="Search"
          value={searchValue}
          onChange={this.handleSearchChange}
        />
        <ListsContainer
          innerRef={this.setListsContainerRef}
          onKeyDown={event => {
            if (event.key === 'ArrowLeft') {
              if (path.length > 1) {
                this.listsContainerRef.children[path.length - 2].focus();
                this.setPath(path.slice(0, path.length - 1));
              }

              event.preventDefault();
            }

            if (event.key === 'ArrowRight') {
              const currentNode = this.getNode({ tree, path });

              if (currentNode && Object.keys(currentNode).length > 0) {
                this.listsContainerRef.children[path.length].focus();
                this.setPath([...path, Object.keys(currentNode)[0]]);
              }

              event.preventDefault();
            }
          }}
        >
          {tree && this.renderLists({ tree, leadingPath: path })}
        </ListsContainer>
        <Footer>
          <FooterRight>
            <button
              disabled={path.length === 0}
              onClick={() => alert(`You chose ${path[path.length - 1]}.`)}
            >
              Choose device
            </button>
          </FooterRight>
        </Footer>
      </Div>
    );
  }
}

export default App;
