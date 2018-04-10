import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import { constants } from 'toolbox';
import DevicePicker from './DevicePicker';
import * as glamor from 'glamor';

const { color } = constants;
const duration = '0.3s';

const fadeScaleIn = glamor.css.keyframes({
   '0%': {
      opacity: '0',
      transform: 'translateY(5%)',
   }
});

const fadeScaleOut = glamor.css.keyframes({
   '100%': {
      opacity: '0',
      transform: 'translateY(-5%)',
   }
});

const fadeIn = glamor.css.keyframes({
   '0%': {
      opacity: '0',
   }
});

const fadeOut = glamor.css.keyframes({
   '100%': {
      opacity: '0',
   }
});

class DevicePickerModal extends Component {
   static propTypes = {
      getHierarchy: PropTypes.func.isRequired,
      getDevice: PropTypes.func.isRequired,
      initialDevice: PropTypes.string,
      onSubmit: PropTypes.func,
      onCancel: PropTypes.func,
      translate: PropTypes.func,
      allowOrphan: PropTypes.bool,
   };

   static defaultProps = {
      initialDevice: '',
      onSubmit: () => {},
      onCancel: () => {},
      translate: s => s,
      allowOrphan: false,
   };

   state = {
      isClosing: false,
   }

   componentDidUpdate(prevProps, prevState) {
      const closeRequested = prevProps.isOpen && !this.props.isOpen;
      if (closeRequested) {
         this.animateClosed();
      }
   }

   animateClosed() {
      this.setState({
         isClosing: true,
      });

      setTimeout(() => {
         this.setState({
            isClosing: false,
         });
      }, 300);
   }

   render() {
      return (
         <Modal
            isOpen={this.props.isOpen || this.state.isClosing}
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
                  animation: `${this.state.isClosing ? fadeOut : fadeIn} ${duration}`,
               },
               content: {
                  position: 'static',
                  width: '85vw',
                  height: '85vh',
                  padding: 0,
                  border: 'none',
                  animation: `${this.state.isClosing ? fadeScaleOut : fadeScaleIn} ${duration}`,
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
               allowOrphan={this.props.allowOrphan}
               translate={this.props.translate}
            />
         </Modal>
      );
   }
}

export default DevicePickerModal;
