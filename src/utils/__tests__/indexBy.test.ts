import indexBy from '../indexBy';

test('returns a list indexed by the given key', () => {
   const list = [
      { title: 'Foo', summary: 'Lorem ipsum' },
      { title: 'Bar', summary: 'Lorem ipsum' },
   ];

   const listByTitle = {
      Foo: { title: 'Foo', summary: 'Lorem ipsum' },
      Bar: { title: 'Bar', summary: 'Lorem ipsum' },
   };

   expect(indexBy('title', list)).toEqual(listByTitle);
});
