import React, { Component } from 'react';
import PropTypes from 'prop-types';
import glamorous from 'glamorous';

import { Button, constants } from 'toolbox';

const propTypes = {
  itemName: PropTypes.string.isRequired,
  createItem: PropTypes.func.isRequired,
};

const Container = glamorous('div', {
  withProps: { role: 'presentation', tabIndex: 0 },
})({
});

class NoResults extends Component {
  render() {
    const { itemName, createItem, ...props } = this.props;

    return (
      <Container {...props}>
        <p>No matches found. Did you spell it correctly?</p>
        <Button onClick={createItem}>Create a {itemName} device page</Button>
      </Container>
    );
  }
}

NoResults.propTypes = propTypes;

export default NoResults;
