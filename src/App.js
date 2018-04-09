import React, { Component } from 'react';
import DevicePickerModal from './DevicePickerModal';
import { Button } from 'toolbox';
import { css } from 'glamor';

const infoContainer = css({
   position: 'fixed',
   top: '0',
   bottom: '0',
   left: '0',
   right: '0',
   maxWidth: '400px',
   margin: 'auto',
   display: 'flex',
   flexDirection: 'column',
   justifyContent: 'center',
   textAlign: 'center',
});

class App extends Component {
   constructor() {
      super();
      this.state = {
         isOpen: false,
         currentDevice: 'No Device Selected',
      }
   }

   handleCancel = () => {
      this.setState({ isOpen: false });
   }

   handleSubmit = (deviceTitle) => {
      this.setState({
         currentDevice: deviceTitle,
         isOpen: false,
      });
   }

   openModal = () => {
      this.setState({ isOpen: true });
   }

   render() {
      return (
         <div>
            <div { ...css(infoContainer) }>
               <h3>{this.state.currentDevice}</h3>
               <Button onClick={this.openModal}>Open Device Picker</Button>
            </div>
            <DevicePickerModal
               isOpen={this.state.isOpen}
               initialDevice="Foth-Flex TLR"
               getHierarchy={() =>
                  fetch(
                     'https://www.ifixit.com/api/2.0/wikis/CATEGORY?display=hierarchy',
                  ).then(response => response.json())}
               getDevice={encodedTitle =>
                  fetch(
                     `https://www.ifixit.com/api/2.0/wikis/CATEGORY/${encodedTitle}`,
                  ).then(response => response.json())}
               onSubmit={(deviceTitle) => {this.handleSubmit(deviceTitle)}}
               onCancel={this.handleCancel}
            />
         </div>
      );
   }
}

export default App;
