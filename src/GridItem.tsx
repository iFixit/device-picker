import {
   borderRadius,
   breakpoint,
   color,
   fontSize,
   lineHeight,
   shadow,
   space,
} from '@core-ds/primitives';
import React from 'react';
import styled from 'styled-components';
import { above } from './utils/mediaQuery';

interface ImageProps {
   src: string | null;
   ratio: number;
}

const Image = styled.div<ImageProps>`
   width: 100%;
   height: 0;
   padding-bottom: ${props => 100 / props.ratio + '%'};
   background-size: contain;
   background-position: center;
   background-color: white;
   background-repeat: no-repeat;
   border-radius: ${borderRadius.md};
   box-shadow: ${shadow[1]};
   ${props => (props.src ? `background-image: url(${props.src});` : null)}
`;

const Title = styled.span`
   display: inline-block;
   margin-top: ${space[2]};
   font-size: ${fontSize[1]};
   line-height: ${lineHeight.tight};

   ${above(breakpoint.lg)} {
      font-size: ${fontSize[2]};
   }
`;

const Container = styled.button`
   display: flex;
   flex-direction: column;
   align-items: stretch;
   padding: 0px;
   font-family: inherit;
   font-size: inherit;
   background-color: transparent;
   border: 0px;
   appearance: none;
   outline: 0;
   cursor: pointer;

   &:focus {
      ${Image} {
         box-shadow: 0 0 0 3px ${color.blue};
      }
   }
`;

interface GridItemProps {
   title: string;
   image: string | null;
   onClick: (event: React.SyntheticEvent) => void;
}

function GridItem({ title, image, onClick }: GridItemProps) {
   return (
      <Container onClick={onClick}>
         <Image src={image} ratio={4 / 3} style={{}} />
         <Title>{title}</Title>
      </Container>
   );
}

export default GridItem;
