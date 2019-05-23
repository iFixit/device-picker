import { Dictionary } from 'lodash';

/** Returns a list indexed by the given key. */
function indexBy<T>(key: keyof T, list: Array<T>): Dictionary<T> {
   return list.reduce((acc: any, item) => {
      acc[item[key]] = item;
      return acc;
   }, {});
}

export default indexBy;
