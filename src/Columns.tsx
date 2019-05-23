import { ChevronRight } from '@core-ds/icons/16';
import { color, fontSize, space } from '@core-ds/primitives';
import { Dictionary } from 'lodash';
import React from 'react';
import styled from 'styled-components';
import Preview from './Preview';
import { Hierarchy, Wiki } from './types';
import indexBy from './utils/indexBy';
import isLeaf from './utils/isLeaf';
import stringDifference from './utils/stringDifference';
import useAsync from './utils/useAsync';

interface ColumnItemProps {
   isInPath: boolean;
   isSelected: boolean;
}

const ColumnItem = styled.button<ColumnItemProps>`
   width: 100%;
   height: 40px;
   display: flex;
   align-items: center;
   justify-content: space-between;
   padding: 0 ${space[3]} 0 ${space[4]};
   font-family: inherit;
   font-size: ${fontSize[2]};
   text-align: left;
   color: ${props => (props.isSelected ? color.white : color.black)};
   background-color: ${props =>
      props.isSelected
         ? color.blue
         : props.isInPath
         ? color.gray2
         : 'transparent'};
   border: 0;
   appearance: none;

   :focus {
      outline: 0;
      box-shadow: inset 0 0 0 2px ${color.blue};
   }
`;

const ColumnItemText = styled.span`
   white-space: nowrap;
   overflow: hidden;
   text-overflow: ellipsis;
`;

const Column = styled.div`
   width: 16rem;
   flex: 0 0 auto;
   box-shadow: inset -1px 0 0 rgba(0, 0, 0, 0.1);
   overflow-y: auto;
`;

interface ColumnsProps {
   hierarchy: Dictionary<Hierarchy>;
   displayTitles: Dictionary<string>;
   fetchChildren: (title: string) => Promise<Array<Wiki>>;
   path: string[];
   previousPath: string[];
   onChange: (path: string[]) => void;
   translate: (...strings: string[]) => string;
}

function Columns({
   hierarchy,
   displayTitles,
   fetchChildren,
   path,
   previousPath,
   onChange,
   translate,
}: ColumnsProps) {
   const parentTitle =
      previousPath.length > 0 ? previousPath[previousPath.length - 1] : 'root';

   const { data: children, isLoading } = useAsync(
      () => fetchChildren(parentTitle),
      [parentTitle],
   );

   const childrenByTitle: Dictionary<Wiki> = React.useMemo(
      () => (children ? indexBy('title', children) : {}),
      [children],
   );

   const selectedRef = React.useRef<HTMLButtonElement>(null);

   React.useEffect(() => {
      if (selectedRef.current) {
         selectedRef.current.scrollIntoView({ block: 'nearest' });
      }
   }, [path[0]]);

   return (
      <>
         <Column onClick={() => onChange(previousPath)}>
            {Object.keys(hierarchy).map(title => {
               const isInPath = path[0] === title;
               const isSelected = isInPath && path.length === 1;
               return (
                  <ColumnItem
                     key={title}
                     innerRef={isSelected ? selectedRef : undefined}
                     onClick={event => {
                        event.stopPropagation();
                        onChange([...previousPath, title]);
                     }}
                     isInPath={isInPath}
                     isSelected={isSelected}
                  >
                     <ColumnItemText>
                        {stringDifference(
                           displayTitles[title] || title,
                           displayTitles[parentTitle] || parentTitle,
                        )}
                     </ColumnItemText>
                     {!isLeaf(hierarchy[title]) ? (
                        <ChevronRight
                           color={isSelected ? color.blueLight3 : color.gray5}
                        />
                     ) : null}
                  </ColumnItem>
               );
            })}
         </Column>
         {path.length > 0 ? (
            isLeaf(hierarchy[path[0]]) ? (
               isLoading || !childrenByTitle[path[0]] ? (
                  <p style={{ width: '100%', minWidth: '16rem' }}>
                     Loading "{path[0]}"...
                  </p>
               ) : (
                  <Preview
                     wiki={childrenByTitle[path[0]]}
                     translate={translate}
                  />
               )
            ) : (
               <Columns
                  hierarchy={hierarchy[path[0]] as Dictionary<Hierarchy>}
                  displayTitles={displayTitles}
                  fetchChildren={fetchChildren}
                  path={path.slice(1)}
                  previousPath={[...previousPath, ...path.slice(0, 1)]}
                  onChange={onChange}
                  translate={translate}
               />
            )
         ) : null}
      </>
   );
}

Columns.defaultProps = {
   previousPath: [],
};

export default Columns;
