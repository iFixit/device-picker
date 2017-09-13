import React from 'react';
import DevicePickerModal from './DevicePickerModal';

function App() {
  return (
    <div>
      <DevicePickerModal
        isOpen
        getHierarchy={() =>
          fetch(
            'https://www.ifixit.com/api/2.0/wikis/CATEGORY?display=hierarchy',
          ).then(response => response.json())}
        getDevice={encodedTitle =>
          fetch(
            `https://www.ifixit.com/api/2.0/wikis/CATEGORY/${encodedTitle}`,
          ).then(response => response.json())}
        onSubmit={deviceTitle => alert(`You chose ${deviceTitle}.`)}
        onCancel={() => alert('Cancelled!')}
      />
    </div>
  );
}

export default App;
