import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import { constants } from 'toolbox';
import DevicePicker from './DevicePicker';
import * as glamor from 'glamor';

const { color } = constants;

class DevicePickerModal extends Component {
  static propTypes = {
    getHierarchy: PropTypes.func.isRequired,
    getDevice: PropTypes.func.isRequired,
    initialDevice: PropTypes.string,
    isOpen: PropTypes.bool,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func,
    translate: PropTypes.func,
    allowOrphan: PropTypes.bool,
  };

  static defaultProps = {
    initialDevice: '',
    isOpen: false,
    onSubmit: () => {},
    onCancel: () => {},
    translate: s => s,
    allowOrphan: false,
  };

  render() {
    const duration = '0.5s';
    const fadeScale = glamor.css.keyframes({
       '0%': {
          opacity: '0',
          transform: 'translateY(5%)',
       }
    });

    const fadeIn = glamor.css.keyframes({
       '0%': {
          opacity: '0',
       }
    });

    return (
      <Modal
        isOpen={this.props.isOpen}
        contentLabel="Device Picker Modal"
        onRequestClose={this.props.onCancel}
        style={{
          overlay: {
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: color.grayAlpha[5],
            animation: `${fadeIn} ${duration}`,
          },
          content: {
            position: 'static',
            width: '85vw',
            height: '85vh',
            padding: 0,
            border: 'none',
            transform: 'translateZ(0)',
            animation: `${fadeScale} ${duration}`,
            // translateZ hack forces the browser to
            // create a new layer and send rendering to the GPU
          },
        }}
      >
        <DevicePicker
          initialDevice={this.props.initialDevice}
          getHierarchy={this.props.getHierarchy}
          getDevice={this.props.getDevice}
          onSubmit={this.props.onSubmit}
          onCancel={this.props.onCancel}
          allowOrphan={this.props.allowOrphan}
          translate={this.props.translate}
        />
      </Modal>
    );
  }
}

export default DevicePickerModal;
