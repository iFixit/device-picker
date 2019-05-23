export type Hierarchy = { [title: string]: Hierarchy } | null;

export interface Wiki {
   title: string;
   display_title: string;
   summary: string;
   image: string;
}
