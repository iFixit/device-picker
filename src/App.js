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
});

const Row = glamorous('div', {
  displayName: 'Row',
  withProps: { role: 'button' },
})();

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

              this.setState({
                searchValue: newRow.name,
                path: [...trailingPath, newRow.name],
              });
            }
          }}
          onClick={() =>
            this.setState({
              searchValue: tree.name,
              path: trailingPath,
            })}
        >
          {tree.children.map((child, index) => (
            <Row
              key={child.name}
              role="button"
              style={{
                backgroundColor:
                  index === highlightedIndex ? 'lightgray' : 'transparent',
                fontWeight:
                  index === highlightedIndex && leadingPath.length === 1
                    ? 'bold'
                    : 'normal',
              }}
              onClick={event => {
                this.setState({
                  searchValue: child.name,
                  path: [...trailingPath, child.name],
                });
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
        <Div display="flex" overflowX="auto">
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
