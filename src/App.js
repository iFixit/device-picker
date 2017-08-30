import React, { Component } from 'react'
import tree from './tree'

class App extends Component {
  state = { tree, path: [] }

  renderLists = ({ tree, leadingPath, trailingPath = [] } = {}) => {
    const list =
      tree.children.length > 0 ? (
        <ul
          key={tree.name}
          onClick={() => this.setState({ path: trailingPath })}
        >
          {tree.children.map(child => (
            <li
              key={child.name}
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
                this.setState({ path: [...trailingPath, child.name] })
                event.stopPropagation()
              }}
            >
              {child.name}
            </li>
          ))}
        </ul>
      ) : (
        <div>{tree.name}</div>
      )

    if (leadingPath.length === 0) {
      return [list]
    }

    return [
      list,
      ...this.renderLists({
        tree: tree.children.find(child => child.name === leadingPath[0]),
        leadingPath: leadingPath.slice(1),
        trailingPath: [...trailingPath, ...leadingPath.slice(0, 1)],
      }),
    ]
  }

  render() {
    const { tree, path } = this.state

    return (
      <div>
        {this.renderLists({ tree, leadingPath: path })}
        <button
          disabled={path.length === 0}
          onClick={() => alert(`You chose ${path[path.length - 1]}.`)}
        >
          Choose device
        </button>
      </div>
    )
  }
}

export default App
