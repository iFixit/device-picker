import * as React from 'react';

import { Dictionary } from 'lodash';
import HierarchicalDevicePicker, { View } from "./HierarchicalDevicePicker"
import { AlgoliaDevicePicker, AlgoliaConfig } from "./AlgoliaDevicePicker"
import { Hierarchy, Wiki } from './types';

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

export function DevicePicker(props: DevicePickerProps) {
   const algoliaConfig = props.algoliaConfig;
   if (algoliaConfig !== undefined) {
      return <AlgoliaDevicePicker algoliaConfig={algoliaConfig} {...props} />
   } else {
      return <HierarchicalDevicePicker {...props} />
   }
}
