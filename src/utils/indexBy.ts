import { Dictionary } from 'lodash';

/** Returns a list indexed by the given key. */
function indexBy<T>(key: keyof T, list: Array<T>): Dictionary<T> {
   return list.reduce(
      (acc, item) => ({ ...acc, [item[key] as any]: item }),
      {},
   );
}

export default indexBy;
