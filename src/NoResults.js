import React, { Component } from 'react';
import PropTypes from 'prop-types';
import glamorous from 'glamorous';

import { Button, constants } from 'toolbox';

const propTypes = {
  itemName: PropTypes.string.isRequired,
  selectItem: PropTypes.func.isRequired,
  translate: PropTypes.func,
  allowOrphan: PropTypes.bool,
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
    const { itemName, selectItem, allowOrphan, translate, ...props } = this.props;

    return (
      <Container {...props}>
        <p>{translate('No matches found. Did you spell it correctly?')}</p>
        {allowOrphan && (
         <Button
           style={{ maxWidth: '100%' }}
           onClick={() => selectItem(itemName)}
         >
           {translate('Choose %1', `"${itemName}"`)}
         </Button>)}
      </Container>
    );
  }
}

NoResults.propTypes = propTypes;

export default NoResults;
