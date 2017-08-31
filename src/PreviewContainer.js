import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Preview from './Preview';

class PreviewContainer extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
  };

  state = { data: null };

  componentDidMount() {
    const encodedTitle = this.props.title.replace(/ /g, '_');

    // get device data
    fetch(`https://www.ifixit.com/api/2.0/wikis/CATEGORY/${encodedTitle}`)
      .then(response => response.json())
      .then(data => this.setState({ data }));
  }

  render() {
    return <Preview {...this.state.data} />;
  }
}

export default PreviewContainer;
