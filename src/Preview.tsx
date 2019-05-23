import { constants } from '@ifixit/toolbox';
import glamorous from 'glamorous';
import React from 'react';

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

/**
 * Truncate string to given length.
 * @param {string} string
 * @param {number} length
 * @param {string} - Truncated string.
 */
function truncate(string: string, length: number) {
   if (!string || string.length <= length) {
      return string;
   }

   const ellipses = '...';

   return string.slice(0, length - ellipses.length) + ellipses;
}

interface PreviewProps {
   image: string;
   translate: any;
   title: string;
   summary: string;
}

function Preview({ translate, image, title, summary }: PreviewProps) {
   return (
      <Container>
         <Image url={image} />
         <Title>{translate(title)}</Title>
         <Summary>{truncate(translate(summary), 80)}</Summary>
      </Container>
   );
}

export default Preview;
