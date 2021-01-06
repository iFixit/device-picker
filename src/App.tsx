import React from 'react';
import { View, DevicePicker } from './DevicePicker';
import { memoize } from 'lodash';

const fetchChildren = memoize(title =>
   fetch(
      `https://www.cominor.com/api/2.0/wikis/CATEGORY/${title}/children`,
   ).then(response => response.json()),
);

let initialDevice = 'Foth-Flex TLR';
let initialView = View.Column
if (typeof URL === 'function') {
   const params = (new URL(document.location.toString())).searchParams;
   if (params.has('d')) {
      initialDevice = params.get('d') || '';
   }
   if (params.has('g')) {
      initialView = View.Grid;
   }
}

function App() {
   return (
      <div data-reactroot style={{ width: '100vw', height: '100vh' }}>
         <DevicePicker
            allowOrphan={true}
            initialDevice={initialDevice}
            initialView={initialView}
            fetchHierarchy={() =>
               fetch(
                  'https://www.cominor.com/api/2.0/wikis/CATEGORY?display=hierarchy',
               ).then(response => response.json())
            }
            fetchChildren={fetchChildren}
            onSubmit={title => alert(`Selected "${title}"`)}
            onCancel={() => alert(`Cancelled`)}
            objectName="device/category"
         />
      </div>
   );
}

export default App;
