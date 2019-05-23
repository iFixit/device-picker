import { constants } from '@ifixit/toolbox';
import glamorous from 'glamorous';
import { truncate } from 'lodash';
import React from 'react';
import { Wiki } from './types';

const { color, fontSize, lineHeight, spacing } = constants;

const Container = glamorous.div({
   flex: '1 0 auto',
   display: 'flex',
   flexDirection: 'column',
   justifyContent: 'flex-start',
   width: '16rem',
   padding: spacing[4],
   textAlign: 'center',
   overflowY: 'auto',
});

interface ImageProps {
   url: string;
}

const Image = glamorous.div<ImageProps>(
   {
      width: '100%',
      height: '14rem',
      minHeight: '3rem',
      backgroundSize: 'contain',
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
   },
   ({ url }) => ({
      backgroundImage: `url(${url})`,
   }),
);

const Title = glamorous.span({
   margin: `${spacing[3]} 0 ${spacing[1]}`,
   fontSize: fontSize[2],
   lineHeight: lineHeight.copy,
   fontWeight: 700,
});

const Summary = glamorous.span({
   fontSize: fontSize[2],
   lineHeight: lineHeight.copy,
   color: color.grayAlpha[6],
});

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
