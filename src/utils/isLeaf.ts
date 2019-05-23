import { Hierarchy } from '../types';

/** Returns true if the given node is a leaf. */
function isLeaf(node: Hierarchy) {
   return node === null;
}

export default isLeaf;
