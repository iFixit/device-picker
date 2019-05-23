import { Dictionary } from 'lodash';
import React from 'react';
import styled from 'styled-components';
import Columns from './Columns';
import { Hierarchy, Wiki } from './types';
import { moveDown, moveLeft, moveRight, moveUp } from './utils/move';

const Container = styled.div`
   display: flex;
   min-width: 100%;
   height: 100%;
   overflow-x: auto;
`;

interface ColumnExplorerProps {
   hierarchy: Dictionary<Hierarchy>;
   displayTitles: Dictionary<string>;
   fetchChildren: (title: string) => Promise<Array<Wiki>>;
   path: string[];
   onChange: (path: string[]) => void;
   translate: (...strings: string[]) => string;
   // TODO: Make translate() available using tne Context API.
}

function ColumnExplorer({
   hierarchy,
   displayTitles,
   fetchChildren,
   path,
   onChange,
   translate,
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
            onChange(moveLeft(hierarchy, path));
            break;

         case 'ArrowRight':
            onChange(moveRight(hierarchy, path));
            break;

         case 'ArrowDown':
            onChange(moveDown(hierarchy, path));
            break;

         case 'ArrowUp':
            onChange(moveUp(hierarchy, path));
            break;
      }
   }

   React.useEffect(() => {
      window.addEventListener('keydown', handleKeyDown);
      return function cleanup() {
         window.removeEventListener('keydown', handleKeyDown);
      };
   }, [handleKeyDown]);

   return (
      <Container innerRef={containerRef}>
         <Columns
            hierarchy={hierarchy}
            displayTitles={displayTitles}
            fetchChildren={fetchChildren}
            path={path}
            onChange={onChange}
            translate={translate}
         />
      </Container>
   );
}

export default ColumnExplorer;