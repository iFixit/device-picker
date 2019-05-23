import isLeaf from '../isLeaf';

test('returns true when input is a leaf', () => {
   expect(isLeaf(null)).toBe(true);
});

test('returns false when input is not a leaf', () => {
   expect(isLeaf({ Camera: null })).toBe(false);
});
