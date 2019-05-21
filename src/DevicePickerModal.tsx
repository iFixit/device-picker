import { constants } from '@ifixit/toolbox';
import { keyframes } from 'glamor';
import React, { Component } from 'react';
import Modal from 'react-modal';
import DevicePicker from './DevicePicker';
export { default as DevicePicker } from './DevicePicker';

Modal.setAppElement('body');

const { color } = constants;
const duration = '0.3s';

const fadeScaleIn = keyframes({
   '0%': {
      opacity: '0',
      transform: 'translateY(5%)',
   },
});

const fadeScaleOut = keyframes({
   '100%': {
      opacity: '0',
      transform: 'translateY(-5%)',
   },
});

const fadeIn = keyframes({
   '0%': {
      opacity: '0',
   },
});

const fadeOut = keyframes({
   '100%': {
      opacity: '0',
   },
});

interface DevicePickerModalProps {
   isOpen: boolean;
   getHierarchy: () => Promise<{ hierarchy: any; display_titles: any }>;
   onSubmit: (title: string) => void;
   onCancel: () => void;
   translate: any;
   allowOrphan: boolean;
   initialDevice: string;
}

class DevicePickerModal extends Component<DevicePickerModalProps> {
   static defaultProps = {
      initialDevice: '',
      onSubmit: () => {},
      onCancel: () => {},
      translate: (s: string) => s,
      allowOrphan: false,
   };

   state = {
      isClosing: false,
   };

   componentDidUpdate(prevProps: DevicePickerModalProps) {
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
                  animation: `${
                     this.state.isClosing ? fadeOut : fadeIn
                  } ${duration}`,
               },
               content: {
                  position: 'static',
                  width: '85vw',
                  height: '85vh',
                  padding: 0,
                  border: 'none',
                  animation: `${
                     this.state.isClosing ? fadeScaleOut : fadeScaleIn
                  } ${duration}`,
                  transform: 'translateZ(0)',
                  // translateZ hack forces the browser to
                  // create a new layer and send rendering to the GPU
               },
            }}
         >
            <DevicePicker
               initialDevice={this.props.initialDevice}
               getHierarchy={this.props.getHierarchy}
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
