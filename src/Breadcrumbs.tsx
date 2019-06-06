import { ChevronRight } from '@core-ds/icons/16';
import { borderRadius, color, fontSize, space } from '@core-ds/primitives';
import React from 'react';
import styled from 'styled-components';
import stringDifference from './utils/stringDifference';

interface BreadcrumbItemProps {
   isSelected?: boolean;
}

const Container = styled.div`
   flex-shrink: 0;
   display: flex;
   align-items: center;
   padding: ${space[3]} ${space[4]};
   overflow: auto;
   border-bottom: 1px solid ${color.gray2};
   -webkit-overflow-scrolling: touch;
`;

const BreadcrumbItem = styled.button<BreadcrumbItemProps>`
   display: flex;
   flex-shrink: 0;
   align-items: center;
   justify-content: space-between;
   padding: 0;
   font-family: inherit;
   font-size: ${fontSize[1]};
   color: ${props => (props.isSelected ? color.black : color.gray6)};
   border: 0;
   appearance: none;
   outline: 0;
   border-radius: ${borderRadius.sm};
   background: transparent;
   cursor: pointer;

   &:focus {
      box-shadow: 0 0 0 3px ${color.blue};
   }
`;

const ChevronRightIcon = styled(ChevronRight)`
   margin: 0 ${space[1]};
   flex-shrink: 0;
   color: ${color.gray4};
`;

interface BreadcrumbsProps {
   path: string[];
   onChange: (path: string[]) => void;
}

function Breadcrumbs({ path, onChange }: BreadcrumbsProps) {
   return (
      <Container>
         <BreadcrumbItem onClick={() => onChange([])}>Home</BreadcrumbItem>
         {path.map((title, index) => (
            <React.Fragment key={title}>
               <ChevronRightIcon />
               <BreadcrumbItem
                  isSelected={index + 1 === path.length}
                  onClick={() => onChange(path.slice(0, index + 1))}
               >
                  {index > 0
                     ? stringDifference(title, path[index - 1]) || title
                     : title}
               </BreadcrumbItem>
            </React.Fragment>
         ))}
      </Container>
   );
}

export default Breadcrumbs;
