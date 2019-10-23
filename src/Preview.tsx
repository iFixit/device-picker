import { color, fontSize, lineHeight, space } from '@core-ds/primitives';
import { truncate } from 'lodash';
import { _js } from '@ifixit/localize';
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
   display: flex;
   flex: 1 1 auto;
   flex-direction: column;
   align-items: center;
   justify-content: flex-start;
   min-width: 256px;
   padding: ${space[5]};
   text-align: center;
   overflow-y: auto;
`;

const ClickableContainer = styled.div`
   display: flex;
   flex-direction: column;
   max-width: 30em;
   cursor: pointer;
`;

interface ImageProps {
   src: string;
}

const Image = styled.div<ImageProps>`
   width: 100%;
   height: 224px;
   min-height: 48px;
   background-size: contain;
   background-position: center center;
   background-repeat: no-repeat;
   mix-blend-mode: multiply;
   ${props => (props.src ? `background-image: url(${props.src});` : null)}
`;

const Title = styled.span`
   margin: ${space[5]} 0 ${space[1]};
   font-size: ${fontSize[3]};
   line-height: ${lineHeight.normal};
   font-weight: 700;
`;

const Summary = styled.span`
   font-size: ${fontSize[2]};
   line-height: ${lineHeight.normal};
   color: ${color.gray6};
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
         <ClickableContainer onClick={onSubmit} >
            <Image src={image}  />
            <Title>{_js(title)}</Title>
            <Summary>{truncate(_js(summary), { length: 80 })}</Summary>
         </ClickableContainer>
      </Container>
   );
}

export default Preview;
