import { color, fontSize, lineHeight, space } from '@core-ds/primitives';
import { truncate } from 'lodash';
import React from 'react';
import styled from 'styled-components';
import { Wiki } from './types';

const Container = styled.div`
   flex: 1 0 auto;
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: flex-start;
   width: 16rem;
   padding: ${space[5]};
   text-align: center;
   overflow-y: auto;
`;

interface ImageProps {
   url: string;
}

const Image = styled.div<ImageProps>`
   width: 100%;
   height: 14rem;
   min-height: 3rem;
   background-size: contain;
   background-position: center center;
   background-repeat: no-repeat;
   background-image: url(${props => props.url});
`;

const Title = styled.span`
   margin: ${space[5]} 0 ${space[1]};
   font-size: ${fontSize[3]};
   line-height: ${lineHeight.normal};
   font-weight: 700;
`;

const Summary = styled.span`
   max-width: 30em;
   font-size: ${fontSize[2]};
   line-height: ${lineHeight.normal};
   color: ${color.gray6};
`;

interface PreviewProps {
   wiki: Wiki;
   translate: (...strings: string[]) => string;
}

function Preview({ wiki, translate }: PreviewProps) {
   return (
      <Container>
         <Image url={wiki.image} />
         <Title>{translate(wiki.display_title)}</Title>
         <Summary>{truncate(translate(wiki.summary), { length: 80 })}</Summary>
      </Container>
   );
}

export default Preview;
