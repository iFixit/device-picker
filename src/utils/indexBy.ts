import { Dictionary } from 'lodash';

function indexBy<T>(key: keyof T, list: Array<T>): Dictionary<T> {
   return list.reduce(
      (acc, item) => ({ ...acc, [item[key] as any]: item }),
      {},
   );
}

export default indexBy;
