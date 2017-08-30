import React, { Component } from 'react';
import glamorous, { Div } from 'glamorous';
import data from './api';

const List = glamorous('div', {
  displayName: 'List',
  withProps: { role: 'presentation', tabIndex: 0 },
})({
  flex: '0 0 auto',
  width: '16rem',
  overflowY: 'auto',
  outline: 0,
  '&:focus': {
    backgroundColor: 'whitesmoke',
  },
});

const Row = glamorous('div', {
  displayName: 'Row',
  withProps: { role: 'button' },
})(
  {
    padding: '8px 16px',
    lineHeight: 1.5,
    cursor: 'pointer',
    userSelect: 'none',
  },
  ({ isHighlighted }) => isHighlighted && { backgroundColor: 'lightgray' },
  ({ isSelected }) =>
    isSelected && { color: 'white', backgroundColor: 'royalblue' },
);

class App extends Component {
  state = {
    searchValue: '',
    tree: data,
    path: [],
  };

  getRelativeRow = ({ list, currentIndex, step }) => {
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
          onKeyDown={event => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              const newRow = this.getRelativeRow({
                list: tree.children,
                currentIndex: highlightedIndex,
                step: event.key === 'ArrowDown' ? 1 : -1,
              });

              this.setPath([...trailingPath, newRow.name]);
            }
          }}
          onClick={() => this.setPath(trailingPath)}
        >
          {tree.children.map((child, index) => (
            <Row
              key={child.name}
              role="button"
              isHighlighted={index === highlightedIndex}
              isSelected={
                index === highlightedIndex && leadingPath.length === 1
              }
              onClick={event => {
                this.setPath([...trailingPath, child.name]);
                event.stopPropagation();
              }}
            >
              {child.name}
            </Row>
          ))}
        </List>
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
      <Div>
        <input
          type="search"
          value={searchValue}
          onChange={this.handleSearchChange}
        />
        <Div
          innerRef={this.setListsContainerRef}
          display="flex"
          overflowX="auto"
          onKeyDown={event => {
            if (event.key === 'ArrowLeft') {
              this.listsContainerRef.children[path.length - 2].focus();
              this.setPath(path.slice(0, path.length - 1));
            }

            if (event.key === 'ArrowRight') {
              const currentNode = this.getNode({ tree, path });

              if (currentNode.children.length > 0) {
                this.listsContainerRef.children[path.length].focus();
                this.setPath([...path, currentNode.children[0].name]);
              }
            }
          }}
        >
          {this.renderLists({ tree, leadingPath: path })}
        </Div>
        <button
          disabled={path.length === 0}
          onClick={() => alert(`You chose ${path[path.length - 1]}.`)}
        >
          Choose device
        </button>
      </Div>
    );
  }
}

export default App;
