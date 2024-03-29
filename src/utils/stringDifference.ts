/**
 * Returns a string containing words from stringA that are not in stringB
 * or all of stringA if no such words are present.
 */
function stringDifference(stringA: string, stringB: string) {
   const stringBWords = stringB.toLowerCase().split(' ');
   return (
      stringA
         .split(' ')
         .filter(word => !stringBWords.includes(word.toLowerCase()))
         .join(' ')
   );
}

export default stringDifference;
