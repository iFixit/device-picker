import React, { Component } from 'react';
import PropTypes from 'prop-types';
import glamorous from 'glamorous';

import { Button } from 'toolbox';

const propTypes = {
  itemName: PropTypes.string.isRequired,
  selectItem: PropTypes.func.isRequired,
};

const Container = glamorous('div', {
  withProps: { role: 'presentation', tabIndex: 0 },
})({
  flex: '0 0 100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
});

class NoResults extends Component {
  render() {
    const { itemName, selectItem, ...props } = this.props;

    return (
      <Container {...props}>
        <p>No matches found. Did you spell it correctly?</p>
        <Button onClick={() => selectItem(itemName)}>
          Create a {itemName} device page
        </Button>
      </Container>
    );
  }
}

NoResults.propTypes = propTypes;

export default NoResults;
