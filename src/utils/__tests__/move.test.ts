import { moveUp, moveLeft, moveRight, moveDown } from '../move';

const hierarchy = {
   Camera: {
      'Canon Camera': {
         'Canon AE-1': null,
         'Canon EOS 30': null,
      },
      'Casio Camera': null,
      'Fujifilm Camera': null,
   },
   Mac: null,
};

describe('moveUp', () => {
   test('returns a path to the previous sibling', () => {
      expect(moveUp(hierarchy, ['Camera', 'Fujifilm Camera'])).toEqual([
         'Camera',
         'Casio Camera',
      ]);

      expect(moveUp(hierarchy, ['Camera', 'Canon Camera'])).toEqual([
         'Camera',
         'Fujifilm Camera',
      ]);
   });
});

describe('moveDown', () => {
   test('returns a path to the next sibling', () => {
      expect(moveDown(hierarchy, ['Camera', 'Casio Camera'])).toEqual([
         'Camera',
         'Fujifilm Camera',
      ]);

      expect(moveDown(hierarchy, ['Camera', 'Fujifilm Camera'])).toEqual([
         'Camera',
         'Canon Camera',
      ]);
   });
});

describe('moveLeft', () => {
   test('returns a path to the parent', () => {
      expect(moveLeft(hierarchy, ['Camera', 'Casio Camera'])).toEqual([
         'Camera',
      ]);

      expect(moveLeft(hierarchy, [])).toEqual([]);
   });
});

describe('moveRight', () => {
   test('returns a path to the first child', () => {
      expect(moveRight(hierarchy, ['Camera'])).toEqual([
         'Camera',
         'Canon Camera',
      ]);

      expect(moveRight(hierarchy, ['Camera', 'Fujifilm Camera'])).toEqual([
         'Camera',
         'Fujifilm Camera',
      ]);
   });
});
