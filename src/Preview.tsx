import { color, fontSize, lineHeight, space } from '@core-ds/primitives';
import { truncate } from 'lodash';
import { _js } from '@ifixit/localize';
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
   flex: 1 1 auto;
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: flex-start;
   min-width: 256px;
   padding: ${space[5]};
   text-align: center;
   overflow-y: auto;
`;

interface ImageProps {
   src: string;
}

const maxWidth = '30em';

const Image = styled.div<ImageProps>`
   width: 100%;
   max-width: ${maxWidth};
   height: 224px;
   min-height: 48px;
   background-size: contain;
   background-position: center center;
   background-repeat: no-repeat;
   mix-blend-mode: multiply;
   ${props => (props.src ? `background-image: url(${props.src});` : null)}
   cursor: pointer;
`;

const Title = styled.span`
   max-width: ${maxWidth};
   margin: ${space[5]} 0 ${space[1]};
   font-size: ${fontSize[3]};
   line-height: ${lineHeight.normal};
   font-weight: 700;
   cursor: pointer;
`;

const Summary = styled.span`
   max-width: ${maxWidth};
   font-size: ${fontSize[2]};
   line-height: ${lineHeight.normal};
   color: ${color.gray6};
   cursor: pointer;
`;

interface PreviewProps {
   image: string;
   title: string;
   summary: string;
   onSubmit: () => void;
}

function Preview({ image, title, summary, onSubmit}: PreviewProps) {
   return (
      <Container>
         <Image src={image} onClick={onSubmit} />
         <Title onClick={onSubmit}>{_js(title)}</Title>
         <Summary onClick={onSubmit}>
            {truncate(_js(summary), { length: 80 })}
         </Summary>
      </Container>
   );
}

export default Preview;
