import React, { Component } from 'react';
import glamorous, { Div } from 'glamorous';
import data from './api';
import List from './List';

const SearchInput = glamorous('input', {
  displayName: 'SearchInput',
  // withProps: { type: 'search' },
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
  overflowX: 'auto',
  borderTop: '1px solid rgba(0, 3, 6, 0.12)',
  borderBottom: '1px solid rgba(0, 3, 6, 0.12)',
});

const Item = glamorous('div', {
  displayName: 'Item',
  withProps: { role: 'button' },
})(
  {
    padding: '0.5rem 1rem',
    lineHeight: 1.5,
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

class App extends Component {
  state = {
    searchValue: '',
    tree: data,
    path: [],
  };

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
      tree: tree.children.find(child => child.name === path[0]),
      path: path.slice(1),
    });
  };

  setPath = path => {
    this.setState({
      searchValue: path[path.length - 1],
      path,
    });
  };

  setListsContainerRef = node => {
    this.listsContainerRef = node;
  };

  handleSearchChange = event => {
    this.setState({ searchValue: event.target.value });
  };

  renderLists = ({ tree, leadingPath, trailingPath = [] } = {}) => {
    const highlightedIndex = tree.children.findIndex(
      child => child.name === leadingPath[0],
    );

    const list =
      tree.children.length > 0 ? (
        <List
          key={tree.name}
          data={tree.children}
          highlightedIndex={highlightedIndex}
          renderItem={({ item, isHighlighted }) => (
            <Item
              key={item.name}
              role="button"
              isHighlighted={isHighlighted}
              isSelected={isHighlighted && leadingPath.length === 1}
              onClick={event => {
                this.setPath([...trailingPath, item.name]);
                event.stopPropagation();
              }}
            >
              {item.name}
            </Item>
          )}
          onKeyDown={event => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              const newItem = this.getRelativeItem({
                list: tree.children,
                currentIndex: highlightedIndex,
                step: event.key === 'ArrowDown' ? 1 : -1,
              });

              this.setPath([...trailingPath, newItem.name]);
              event.preventDefault();
            }
          }}
          onClick={() => this.setPath(trailingPath)}
        />
      ) : (
        <div key={tree.name}>{tree.name}</div>
      );

    if (leadingPath.length === 0) {
      return [list];
    }

    return [
      list,
      ...this.renderLists({
        tree: tree.children.find(child => child.name === leadingPath[0]),
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

              if (currentNode.children.length > 0) {
                this.listsContainerRef.children[path.length].focus();
                this.setPath([...path, currentNode.children[0].name]);
              }

              event.preventDefault();
            }
          }}
        >
          {this.renderLists({ tree, leadingPath: path })}
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
