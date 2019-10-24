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


   // Note that `dependencies` defaults to [], which means that our effect will
   // be run *only* on component mount unless the caller explicitly passes
   // `undefined` (run after each render) or an array of dependencies (run only
   // when a dependency has changed).
   React.useEffect(() => {
      let cancelFetch = false;
      fn()
         .then(data => {
            if (!cancelFetch) {
               setState({ isLoading: false, data });
            }
         })
         .catch(error => {
            if (!cancelFetch) {
               setState({ isLoading: false, error });
            }
         });

      return function dependenciesChanged() {
         cancelFetch = true;
      };

      // useAsync() is effectively an extension of `useEffect()`, and as such
      // it relies on the caller to appropriately specify dependencies. It
      // doesn't make sense to make `fn` a dependency (just like `useEffect()`
      // doesn't expect the function it's passed to be a dependency).
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, dependencies);

   return state;
}

export default useAsync;
