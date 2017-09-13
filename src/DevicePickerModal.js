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
    isOpen: PropTypes.bool,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func,
  };

  static defaultProps = {
    isOpen: false,
    onSubmit: () => {},
    onCancel: () => {},
  };

  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        contentLabel="Device Picker Modal"
        style={{
          overlay: {
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
          },
        }}
      >
        <DevicePicker
          getHierarchy={this.props.getHierarchy}
          getDevice={this.props.getDevice}
          onSubmit={this.props.onSubmit}
          onCancel={this.props.onCancel}
        />
      </Modal>
    );
  }
}

export default DevicePickerModal;
