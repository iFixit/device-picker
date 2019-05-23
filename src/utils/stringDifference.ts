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
