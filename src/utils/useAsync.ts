import React from 'react';

type AsyncState<T> =
   | {
        isLoading: true;
        error?: undefined;
        data?: undefined;
     }
   | {
        isLoading: false;
        error: Error;
        data?: undefined;
     }
   | {
        isLoading: false;
        error?: undefined;
        data: T;
     };

function useAsync<T>(
   fn: () => Promise<T>,
   dependencies: any[] = [],
): AsyncState<T> {
   const [state, setState] = React.useState<AsyncState<T>>({ isLoading: true });

   React.useEffect(() => {
      let isFresh = true;
      fn()
         .then(data => {
            if (isFresh) {
               setState({ isLoading: false, data });
            }
         })
         .catch(error => {
            if (isFresh) {
               setState({ isLoading: false, error });
            }
         });

      return function cleanup() {
         isFresh = false;
      };
   }, [fn, ...dependencies]);

   return state;
}

export default useAsync;
