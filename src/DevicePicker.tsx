import * as React from 'react';
import { Dictionary } from 'lodash';
import HierarchicalDevicePicker, { View } from './HierarchicalDevicePicker';
import { AlgoliaDevicePicker, AlgoliaConfig } from './AlgoliaDevicePicker';
import { Hierarchy, Wiki } from './types';
import { useState } from 'react';
import findAllLeaves from './utils/findAllLeaves';
export { View };

interface DevicePickerProps {
   fetchHierarchy: () => Promise<{
      hierarchy: Hierarchy;
      display_titles: Dictionary<string>;
   }>;
   fetchChildren: (title: string) => Promise<Array<Wiki>>;
   onSubmit: (title: string) => void;
   onCancel: () => void;
   allowOrphan?: boolean;
   initialDevice?: string;
   initialView?: View;
   objectName?: string;
   algoliaConfig?: AlgoliaConfig;
}

type Context = {
   type: 'category' | 'search';
   value: string;
};

export function DevicePicker(props: DevicePickerProps) {
   const algoliaConfig = props.algoliaConfig;
   const [leaves, setLeaves] = useState<object | null>(null);
   const [context, setContext] = useState<Context>({
      type: 'category',
      value: '',
   });

   React.useEffect(() => {
      props.fetchHierarchy().then((json) => {
         setLeaves(findAllLeaves(json.hierarchy, json.display_titles));
      });
   }, []);

   return (
      <div>
         {context.type === 'category' || algoliaConfig === undefined ? (
            <HierarchicalDevicePicker
               onSearch={(value) => setContext({ type: 'search', value })}
               category={context.value}
               {...props}
            />
         ) : (
               <AlgoliaDevicePicker
                  leaves={leaves}
                  onSelectCategory={(category) => {
                     setContext({ type: 'category', value: category });
                  }}
                  query={context.value}
                  algoliaConfig={algoliaConfig}
                  {...props}
               />
         )}
      </div>
   );
}
