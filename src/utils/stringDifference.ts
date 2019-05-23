/** Returns a string containing words from stringA that are not in stringB. */
function stringDifference(stringA: string, stringB: string) {
   const stringBWords = stringB.toLowerCase().split(' ');
   return (
      stringA
         .split(' ')
         .filter(word => !stringBWords.includes(word.toLowerCase()))
         .join(' ') || stringA
   );
}

export default stringDifference;
