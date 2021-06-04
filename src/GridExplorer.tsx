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

export const Grid = styled.div`
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
   onSubmit: (title: string) => void;
}

function GridExplorer({
   hierarchy,
   displayTitles,
   fetchChildren,
   path,
   previousPath,
   onChange,
   onSubmit,
}: GridExplorerProps) {
   const currentTitle = path[0];
   const parentTitle =
      previousPath.length > 0 ? previousPath[previousPath.length - 1] : 'root';

   // At present, we don't expect fetchChildren to change. It's defined outside
   // a component at the top level and passed down unmodified, but since we
   // take it as a prop, we can't guarantee that.
   const { data: children } = useAsync(() => fetchChildren(parentTitle), [
      fetchChildren,
      parentTitle,
   ]);

   const childrenByTitle: Dictionary<Wiki> = React.useMemo(
      () => (children ? indexBy('title', children) : {}),
      [children],
   );

   if (path.length === 0) {
      const hits = Object.keys(hierarchy).map(title => 
         ({ 
            "key" : title,
            "title" : displayTitles[title] || title,
            "image" : get(childrenByTitle[title], 'image'),
            "onClick" : () => onChange([...previousPath, title])
         })
      );

      return (
            <Grid>
               {hits.map(hit => (
                  <GridItem
                     key={hit.key}
                     title={hit.title}
                     image={hit.image}
                     onClick={hit.onClick}
                  />)
               )}
            </Grid>
      );
   }

   if (isLeaf(hierarchy[currentTitle])) {
      return (
         <Preview
            title={displayTitles[currentTitle] || currentTitle}
            image={get(childrenByTitle[currentTitle], 'image')}
            summary={get(childrenByTitle[currentTitle], 'summary')}
            onSubmit={() => onSubmit(currentTitle)}
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
         onSubmit={onSubmit}
      />
   );
}

GridExplorer.defaultProps = {
   previousPath: [],
};

export default GridExplorer;
