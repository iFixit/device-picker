import React from 'react';
import { View, DevicePicker } from './DevicePicker';
import { memoize } from 'lodash';
import algoliaConfig from './algoliaConfig.json'

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
   if (!algoliaConfig.API_KEY || !algoliaConfig.APP_ID || !algoliaConfig.hasOwnProperty('ALGOLIA_INDEX_PREFIX')) {
      throw new Error("Missing required Algolia config")
   }
   return (
      <div data-reactroot style={{ width: '100vw', height: '100vh' }}>
         <DevicePicker
            algoliaConfig={{
               apiKey: algoliaConfig.API_KEY,
               appId: algoliaConfig.APP_ID,
               indexPrefix: algoliaConfig.ALGOLIA_INDEX_PREFIX,
            }}
            allowOrphan={true}
            initialDevice={initialDevice}
            initialView={initialView}
            fetchHierarchy={() =>
               fetch(
                  'https://www.cominor.com/api/2.0/wikis/CATEGORY?display=hierarchy&includeStubs=true',
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
