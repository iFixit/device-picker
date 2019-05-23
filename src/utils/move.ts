import { Dictionary, get } from 'lodash';
import { Hierarchy } from '../types';
import isLeaf from './isLeaf';

/** Returns a path to the parent. */
export function moveLeft(hierarchy: Dictionary<Hierarchy>, path: string[]) {
   return path.slice(0, path.length - 1);
}

/** Returns a path to the first child. */
export function moveRight(hierarchy: Dictionary<Hierarchy>, path: string[]) {
   const subHierarchy: Dictionary<Hierarchy> =
      path.length > 0 ? get(hierarchy, path) : hierarchy;

   if (isLeaf(subHierarchy)) {
      return path;
   }

   const children = Object.keys(subHierarchy);
   return [...path, children[0]];
}

/** Returns a path to the previous sibling. */
export function moveUp(hierarchy: Dictionary<Hierarchy>, path: string[]) {
   const parentHierarchy: Dictionary<Hierarchy> =
      path.length > 1
         ? get(hierarchy, path.slice(0, path.length - 1))
         : hierarchy;

   const siblings = Object.keys(parentHierarchy);

   if (path.length === 0) return [siblings[0]];

   const currentIndex = siblings.findIndex(
      key => key === path[path.length - 1],
   );
   const nextIndex = currentIndex > 0 ? currentIndex - 1 : siblings.length - 1;
   return [...path.slice(0, path.length - 1), siblings[nextIndex]];
}

/** Returns a path to the next sibling. */
export function moveDown(hierarchy: Dictionary<Hierarchy>, path: string[]) {
   const parentHierarchy: Dictionary<Hierarchy> =
      path.length > 1
         ? get(hierarchy, path.slice(0, path.length - 1))
         : hierarchy;

   const siblings = Object.keys(parentHierarchy);

   if (path.length === 0) return [siblings[0]];

   const currentIndex = siblings.findIndex(
      key => key === path[path.length - 1],
   );
   const nextIndex = (currentIndex + 1) % siblings.length;
   return [...path.slice(0, path.length - 1), siblings[nextIndex]];
}
