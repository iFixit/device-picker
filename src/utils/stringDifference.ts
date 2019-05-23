/** Returns a string containing words from stringA that are not in stringB. */
function stringDifference(stringA: string, stringB: string) {
   return (
      stringA
         .split(' ')
         .filter(
            word =>
               !stringB
                  .toLowerCase()
                  .split(' ')
                  .includes(word.toLowerCase()),
         )
         .join(' ') || stringA
   );
}

export default stringDifference;
