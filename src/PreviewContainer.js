import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Preview from './Preview';

const propTypes = {
   translate: PropTypes.func.isRequired,
};

class PreviewContainer extends Component {
   state = {
      data: null,
   };

   static getDerivedStateFromProps(nextProps) {
      return {
         data: nextProps.data,
      };
   }

   render() {
      return <Preview translate={this.props.translate} {...this.state.data} />;
   }
}

PreviewContainer.propTypes = propTypes;

export default PreviewContainer;
