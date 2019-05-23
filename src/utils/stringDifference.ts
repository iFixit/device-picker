function stringDifference(string: string, otherString: string) {
   return (
      string
         .split(' ')
         .filter(
            word =>
               !otherString
                  .toLowerCase()
                  .split(' ')
                  .includes(word.toLowerCase()),
         )
         .join(' ') || string
   );
}

export default stringDifference;
