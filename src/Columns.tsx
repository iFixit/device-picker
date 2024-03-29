import { ChevronRight } from '@core-ds/icons/16';
import { color, fontSize, space } from '@core-ds/primitives';
import { Dictionary, get } from 'lodash';
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
   outline: 0;
   cursor: pointer;
`;

const ColumnItemText = styled.span`
   white-space: nowrap;
   overflow: hidden;
   text-overflow: ellipsis;
`;

const Column = styled.div`
   width: 256px;
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
   onSubmit: (title: string) => void;
}

function Columns({
   hierarchy,
   displayTitles,
   fetchChildren,
   path,
   previousPath,
   onChange,
   onSubmit,
}: ColumnsProps) {
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

   const selectedRef = React.useRef<HTMLButtonElement>(null);

   React.useEffect(() => {
      if (selectedRef.current) {
         selectedRef.current.scrollIntoView({ block: 'nearest' });
      }
   }, [currentTitle]);

   return (
      <>
         <Column onClick={() => onChange(previousPath)}>
            {Object.keys(hierarchy).map(title => {
               const isInPath = currentTitle === title;
               const isSelected = isInPath && path.length === 1;
               const displayTitle = displayTitles[title] || title;
               return (
                  <ColumnItem
                     key={title}
                     ref={isSelected ? selectedRef : undefined}
                     onClick={event => {
                        event.stopPropagation();
                        onChange([...previousPath, title]);
                     }}
                     isInPath={isInPath}
                     isSelected={isSelected}
                  >
                     <ColumnItemText>
                        {stringDifference(
                           displayTitle,
                           displayTitles[parentTitle] || parentTitle,
                        ) || displayTitle}
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
            isLeaf(hierarchy[currentTitle]) ? (
               <Preview
                  title={get(
                     childrenByTitle[currentTitle],
                     'display_title',
                     currentTitle,
                  )}
                  image={get(childrenByTitle[currentTitle], 'image')}
                  summary={get(childrenByTitle[currentTitle], 'summary')}
                  onSubmit={() => onSubmit(currentTitle)}
               />
            ) : (
               <Columns
                  hierarchy={hierarchy[currentTitle] as Dictionary<Hierarchy>}
                  displayTitles={displayTitles}
                  fetchChildren={fetchChildren}
                  path={path.slice(1)}
                  previousPath={[...previousPath, currentTitle]}
                  onChange={onChange}
                  onSubmit={onSubmit}
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
