import React, { Component } from 'react';
import DevicePickerModal from './DevicePickerModal';

class App extends Component {
   constructor() {
      super();
      this.state = {
         isOpen: true
      }
   }

   handleCancel = () => {
      alert("Cancelled!");
   }

   handleSubmit = (deviceTitle) => {
      alert(`You chose ${deviceTitle}.`)
   }

   render() {
      const {
         isOpen
      } = this.state;

      return (
         <div>
            <DevicePickerModal
               isOpen={isOpen}
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
