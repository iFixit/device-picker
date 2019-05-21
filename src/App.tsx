import { Button } from '@ifixit/toolbox';
import glamorous from 'glamorous';
import React, { Component } from 'react';
import DevicePickerModal from './DevicePickerModal';

const InfoContainer = glamorous.div({
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
   state = {
      isOpen: false,
      currentDevice: 'No Device Selected',
   };

   handleCancel = () => {
      this.setState({ isOpen: false });
   };

   handleSubmit = (deviceTitle: string) => {
      this.setState({
         currentDevice: deviceTitle,
         isOpen: false,
      });
   };

   openModal = () => {
      this.setState({ isOpen: true });
   };

   render() {
      return (
         <div data-reactroot>
            <InfoContainer>
               <h3>{this.state.currentDevice}</h3>
               <Button onClick={this.openModal}>Open Device Picker</Button>
            </InfoContainer>
            <DevicePickerModal
               isOpen={this.state.isOpen}
               initialDevice="Foth-Flex TLR"
               getHierarchy={() =>
                  fetch(
                     'https://www.ifixit.com/api/2.0/wikis/CATEGORY?display=hierarchy',
                  ).then(response => response.json())
               }
               onSubmit={this.handleSubmit}
               onCancel={this.handleCancel}
            />
         </div>
      );
   }
}

export default App;
