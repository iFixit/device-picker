import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import { constants } from 'toolbox';
import DevicePicker from './DevicePicker';

const { color } = constants;

class DevicePickerModal extends Component {
  static propTypes = {
    getHierarchy: PropTypes.func.isRequired,
    getDevice: PropTypes.func.isRequired,
    initialDevice: PropTypes.string,
    isOpen: PropTypes.bool,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func,
    isWorkbenchDevice: PropTypes.bool,
  };

  static defaultProps = {
    initialDevice: '',
    isOpen: false,
    onSubmit: () => {},
    onCancel: () => {},
    isWorkbenchDevice: false,
  };

  render() {
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
          },
          content: {
            position: 'static',
            width: '85vw',
            height: '85vh',
            padding: 0,
            border: 'none',
            transform: 'translateZ(0)',
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
          isWorkbenchDevice={this.props.isWorkbenchDevice}
        />
      </Modal>
    );
  }
}

export default DevicePickerModal;
