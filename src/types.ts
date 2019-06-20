export type HierarchyTop = { [title: string]: Hierarchy };
export type Hierarchy = HierarchyTop | null;

export interface Wiki {
   title: string;
   display_title: string;
   summary: string;
   image: string;
}
