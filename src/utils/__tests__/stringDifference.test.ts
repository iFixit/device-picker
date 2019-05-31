import stringDifference from '../stringDifference';

test('returns a string containing words from stringA that are not in stringB', () => {
   expect(stringDifference('MacBook Pro 13"', 'MacBook Pro')).toBe('13"');
});

test('ignores word order', () => {
   expect(stringDifference('This is a phrase', 'This phrase is red')).toBe('a');
});

test('ignores word count', () => {
   expect(
      stringDifference('This is is a phrase', 'This phrase phrase is red'),
   ).toBe('a');
});
