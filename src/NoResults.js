import React, { Component } from 'react';
import PropTypes from 'prop-types';
import glamorous from 'glamorous';

import { Button, constants } from 'toolbox';

const propTypes = {
  itemName: PropTypes.string.isRequired,
  selectItem: PropTypes.func.isRequired,
};

const Container = glamorous('div', {
  withProps: { role: 'presentation', tabIndex: 0 },
})({
  flex: '0 0 100%',
  padding: constants.spacing[3],
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  maxWidth: '100%',
});

class NoResults extends Component {
  render() {
    const { itemName, selectItem, ...props } = this.props;

    // _js is used as a translation function
    // If no translation function is defined, _js becomes a noop
    if (typeof _js === 'undefined') {
      var _js = s => s;
    }

    return (
      <Container {...props}>
        <p>{_js('No matches found. Did you spell it correctly?')}</p>
        <Button
          style={{ maxWidth: '100%' }}
          onClick={() => selectItem(itemName)}
        >
          {_js('Choose %1', itemName)}
        </Button>
      </Container>
    );
  }
}

NoResults.propTypes = propTypes;

export default NoResults;
