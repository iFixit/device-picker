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
   hierarchy: Dictionary<Hierarchy>;
   displayTitles: Dictionary<string>;
   fetchChildren: (title: string) => Promise<Array<Wiki>>;
   path: string[];
   previousPath: string[];
   onChange: (path: string[]) => void;
   translate: (...strings: string[]) => string;
}

function GridExplorer({
   hierarchy,
   displayTitles,
   fetchChildren,
   path,
   previousPath,
   onChange,
   translate,
}: GridExplorerProps) {
   const currentTitle = path[0];
   const parentTitle =
      previousPath.length > 0 ? previousPath[previousPath.length - 1] : 'root';

   const { data: children } = useAsync(() => fetchChildren(parentTitle), [
      parentTitle,
   ]);

   const childrenByTitle: Dictionary<Wiki> = React.useMemo(
      () => (children ? indexBy('title', children) : {}),
      [children],
   );

   if (path.length === 0) {
      return (
         <Container>
            <Grid>
               {Object.keys(hierarchy).map(title => (
                  <GridItem
                     key={title}
                     title={displayTitles[title] || title}
                     image={get(childrenByTitle[title], 'image')}
                     onClick={() => onChange([...previousPath, title])}
                  />
               ))}
            </Grid>
         </Container>
      );
   }

   if (isLeaf(hierarchy[currentTitle])) {
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
      <GridExplorer
         hierarchy={hierarchy[currentTitle] as Dictionary<Hierarchy>}
         displayTitles={displayTitles}
         path={path.slice(1)}
         previousPath={[...previousPath, currentTitle]}
         fetchChildren={fetchChildren}
         onChange={onChange}
         translate={translate}
      />
   );
}

GridExplorer.defaultProps = {
   previousPath: [],
};

export default GridExplorer;
