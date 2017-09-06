import React from 'react';
import DevicePicker from './DevicePicker';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <DevicePicker
        getHierarchy={() =>
          fetch(
            'https://www.ifixit.com/api/2.0/wikis/CATEGORY?display=hierarchy',
          ).then(response => response.json())}
        onSubmit={deviceTitle => alert(`You chose ${deviceTitle}.`)}
        onCancel={() => alert('Cancelled!')}
      />
    </div>
  );
}

export default App;
