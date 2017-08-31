import React from 'react';
import DevicePicker from './DevicePicker';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <DevicePicker
        onSubmit={deviceTitle => alert(`You chose ${deviceTitle}.`)}
      />
    </div>
  );
}

export default App;
