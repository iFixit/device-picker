import { above } from '../mediaQuery';

describe('above', () => {
   test('returns a media query that takes effect at the given breakpoint and above', () => {
      expect(above('300px')).toBe('@media screen and (min-width: 300px)');
   });
});
