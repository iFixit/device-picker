import React, { Component } from 'react';
import Preview from './Preview';

interface PreviewContainerProps {
   data: {
      image: string;
      title: string;
      summary: string;
   };
   translate: any;
}

class PreviewContainer extends Component<PreviewContainerProps> {
   render() {
      return <Preview translate={this.props.translate} {...this.props.data} />;
   }
}

export default PreviewContainer;
