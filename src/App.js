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
  withProps: { role: 'button', tabIndex: 0 },
})();

class App extends Component {
  state = {
    searchValue: '',
    tree: data,
    path: [],
  };

  handleSearchChange = event => {
    this.setState({ searchValue: event.target.value });
  };

  renderLists = ({ tree, leadingPath, trailingPath = [] } = {}) => {
    const list =
      tree.children.length > 0 ? (
        <List
          key={tree.name}
          onClick={() =>
            this.setState({
              searchValue: tree.name,
              path: trailingPath,
            })}
        >
          {tree.children.map(child => (
            <Row
              key={child.name}
              role="button"
              tabIndex="0"
              style={{
                backgroundColor:
                  leadingPath[0] && child.name === leadingPath[0]
                    ? 'lightgray'
                    : 'transparent',
                fontWeight:
                  leadingPath[0] &&
                  child.name === leadingPath[0] &&
                  leadingPath.length === 1
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
