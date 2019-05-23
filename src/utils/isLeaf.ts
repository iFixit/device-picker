import { Hierarchy } from '../types';

function isLeaf(node: Hierarchy) {
   return node === null;
}

export default isLeaf;
