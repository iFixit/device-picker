import { breakpoint, space } from '@core-ds/primitives';
import { Dictionary, get } from 'lodash';
import React from 'react';
import styled from 'styled-components';
import GridItem from './GridItem';
import Preview from './Preview';
import { Hierarchy, Wiki } from './types';
import indexBy from './utils/indexBy';
import isLeaf from './utils/isLeaf';
import { above } from './utils/mediaQuery';
import useAsync from './utils/useAsync';

const Container = styled.div`
   flex: 1 1 auto;
   overflow-y: auto;
   -webkit-overflow-scrolling: touch;
`;

const Grid = styled.div`
   padding: ${space[5]};
   display: grid;
   column-gap: ${space[4]};
   row-gap: ${space[5]};
   grid-template-columns: repeat(2, 1fr);

   ${above(breakpoint.md)} {
      grid-template-columns: repeat(4, 1fr);
   }

   ${above(breakpoint.xl)} {
      grid-template-columns: repeat(5, 1fr);
   }
`;

interface GridExplorerProps {
   hierarchy: Hierarchy;
   displayTitles: Dictionary<string>;
   fetchChildren: (title: string) => Promise<Array<Wiki>>;
   path: string[];
   onChange: (path: string[]) => void;
   translate: (...strings: string[]) => string;
}

const traverse = (tree: Hierarchy, path: string[]): Hierarchy => {
   return path.reduce(
    (tree, title) => tree && tree[title],
    tree);
};

function GridExplorer({
   hierarchy,
   displayTitles,
   fetchChildren,
   path,
   onChange,
   translate,
}: GridExplorerProps) {
   const currentHierarchy = traverse(hierarchy, path);
   const currentIsLeaf = isLeaf(currentHierarchy);

   // If path is empty, we're at the root and we'll need to ask the api
   // for the children of 'root' (the canonical name for the root category)
   const currentTitle = path[path.length - 1] || 'root';
   const parentTitle = path[path.length - 2] || 'root';
   // If not, we ask for current's children
   const titleToQuery = currentIsLeaf ? parentTitle : currentTitle

   const { data: children } = useAsync(() => fetchChildren(titleToQuery), [
      titleToQuery
   ]);

   const childrenByTitle: Dictionary<Wiki> = React.useMemo(
      () => (children ? indexBy('title', children) : {}),
      [children],
   );

   if (currentIsLeaf) {
      const wiki:Wiki = childrenByTitle[currentTitle] || {};
      return (
         <Preview
            title={displayTitles[currentTitle] || currentTitle}
            image={wiki.image}
            summary={wiki.summary}
            translate={translate}
         />
      );
   }

   return (
      <Container>
         <Grid>
            {Object.keys(currentHierarchy || {}).map(title => (
               <GridItem
                  key={title}
                  title={displayTitles[title] || title}
                  image={get(childrenByTitle[title], 'image')}
                  onClick={() => onChange([...path, title])}
               />
            ))}
         </Grid>
      </Container>
   );
}

export default GridExplorer;
