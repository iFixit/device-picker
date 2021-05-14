import * as React from 'react'

import { View } from "./HierarchicalDevicePicker"

interface AlgoliaDevicePickerProps {
   onSubmit: (title: string) => void;
   onCancel: () => void;
   allowOrphan?: boolean;
   initialDevice?: string;
   initialView?: View;
   objectName?: string;
   algoliaConfig: AlgoliaConfig;
}

export interface AlgoliaConfig {
   apiKey: string;
   appId: string;
}

export function AlgoliaDevicePicker(props: AlgoliaDevicePickerProps) {
   return <div></div>
}
