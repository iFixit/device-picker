import React from 'react';
import DevicePicker from './DevicePicker';
import { memoize } from 'lodash';

const fetchChildren = memoize(title =>
   fetch(
      `https://www.cominor.com/api/2.0/wikis/CATEGORY/${title}/children`,
   ).then(response => response.json()),
);

function App() {
   return (
      <div data-reactroot style={{ width: '100vw', height: '100vh' }}>
         <DevicePicker
            initialDevice="Foth-Flex TLR"
            fetchHierarchy={() =>
               fetch(
                  'https://www.cominor.com/api/2.0/wikis/CATEGORY?display=hierarchy',
               ).then(response => response.json())
            }
            fetchChildren={fetchChildren}
            onSubmit={title => alert(`Selected "${title}"`)}
            onCancel={() => alert(`Cancelled`)}
         />
      </div>
   );
}

export default App;
