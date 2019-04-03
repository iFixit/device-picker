import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import Preview from './Preview';

const propTypes = {
   getDevice: PropTypes.func.isRequired,
   translate: PropTypes.func.isRequired,
};

class PreviewContainer extends Component {
   state = {
      data: null,
   };

   static getDerivedStateFromProps(nextProps) {
      const dataArr = get(nextProps.tree, nextProps.path);

      return {
         data: dataArr ? dataArr[0] : null,
      };
   }

   render() {
      return <Preview translate={this.props.translate} {...this.state.data} />;
   }
}

PreviewContainer.propTypes = propTypes;

export default PreviewContainer;
