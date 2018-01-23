import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Preview from './Preview';

const propTypes = {
  getDevice: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
};

class PreviewContainer extends Component {
  state = { data: null };

  componentDidMount() {
    // get device data
    this.props.getDevice()
      .then(data => this.setState({ data }))
      .catch(reason => { throw reason; });
  }

  render() {
    return <Preview translate={this.props.translate}
     {...this.state.data} />;
  }
}

PreviewContainer.propTypes = propTypes;

export default PreviewContainer;
