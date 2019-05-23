import React from 'react';
import DevicePicker from './DevicePicker';

function App() {
   return (
      <div data-reactroot style={{ width: '100vw', height: '100vh' }}>
         <DevicePicker
            initialDevice="Foth-Flex TLR"
            fetchHierarchy={() =>
               fetch(
                  'https://www.ifixit.com/api/2.0/wikis/CATEGORY?display=hierarchy',
               ).then(response => response.json())
            }
            onSubmit={title => alert(`Selected "${title}"`)}
            onCancel={() => alert(`Cancelled`)}
         />
      </div>
   );
}

export default App;
