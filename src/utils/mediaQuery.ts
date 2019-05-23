/** Returns a media query that takes effect at the given breakpoint and above. */
export function above(breakpoint: string) {
   return `@media screen and (min-width: ${breakpoint})`;
}
