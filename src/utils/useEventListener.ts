import React from 'react';

export default function useEventListener(
 element: EventTarget,
 eventName: string,
 handler: (event: any) => void): void {
   React.useEffect(() => {
      element.addEventListener(eventName, handler);
      return function cleanup() {
         element.removeEventListener(eventName, handler);
      };
   }, [element, eventName, handler]);
}
