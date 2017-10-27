import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Preview from './Preview';

const propTypes = {
  getDevice: PropTypes.func.isRequired,
};

class PreviewContainer extends Component {
  state = { data: null };

  componentDidMount() {
    // get device data
    this.props.getDevice()
      .then(data => this.setState({ data }))
      .catch(reason => console.error(reason));
  }

  render() {
    return <Preview {...this.state.data} />;
  }
}

PreviewContainer.propTypes = propTypes;

export default PreviewContainer;
