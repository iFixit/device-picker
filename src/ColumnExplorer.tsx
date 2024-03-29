import { Dictionary } from 'lodash';
import React from 'react';
import styled from 'styled-components';
import Columns from './Columns';
import { Hierarchy, Wiki } from './types';
import { moveDown, moveLeft, moveRight, moveUp } from './utils/move';
import useEventListener from './utils/useEventListener';

const Container = styled.div`
   display: flex;
   min-width: 100%;
   height: 100%;
   overflow-x: auto;
   -webkit-overflow-scrolling: touch;
`;

interface ColumnExplorerProps {
   hierarchy: Dictionary<Hierarchy>;
   displayTitles: Dictionary<string>;
   fetchChildren: (title: string) => Promise<Array<Wiki>>;
   path: string[];
   onChange: (path: string[]) => void;
   onSubmit: (title: string) => void;
}

function ColumnExplorer({
   hierarchy,
   displayTitles,
   fetchChildren,
   path,
   onChange,
   onSubmit,
}: ColumnExplorerProps) {
   const containerRef = React.useRef<HTMLDivElement>(null);

   React.useEffect(() => {
      if (containerRef.current) {
         // When the path changes, scroll all the way to the right.
         containerRef.current.scroll({
            top: 0,
            left: containerRef.current.scrollWidth,
            behavior: 'smooth',
         });
      }
   }, [path]);

   function handleKeyDown(event: KeyboardEvent) {
      switch (event.key) {
         case 'ArrowLeft':
            event.preventDefault();
            onChange(moveLeft(hierarchy, path));
            break;

         case 'ArrowRight':
            event.preventDefault();
            onChange(moveRight(hierarchy, path));
            break;

         case 'ArrowDown':
            event.preventDefault();
            onChange(moveDown(hierarchy, path));
            break;

         case 'ArrowUp':
            event.preventDefault();
            onChange(moveUp(hierarchy, path));
            break;
      }
   }

   useEventListener(window, 'keydown', handleKeyDown);

   return (
      <Container ref={containerRef}>
         <Columns
            hierarchy={hierarchy}
            displayTitles={displayTitles}
            fetchChildren={fetchChildren}
            path={path}
            onChange={onChange}
            onSubmit={onSubmit}
         />
      </Container>
   );
}

export default ColumnExplorer;
