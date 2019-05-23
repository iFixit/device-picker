import {
   breakpoint,
   color,
   fontSize,
   lineHeight,
   space,
} from '@core-ds/primitives';
import { Button } from '@ifixit/toolbox';
import glamorous from 'glamorous';
import React from 'react';
import { above } from './utils/mediaQuery';

const Container = glamorous.div({
   display: 'flex',
   flex: '0 0 auto',
   flexDirection: 'column',
   alignItems: 'stretch',
   background: color.gray1,
   padding: space[4],

   [above(breakpoint.sm)]: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${space[2]} ${space[4]}`,
   },
});

const Text = glamorous.span({
   fontSize: fontSize[1],
   color: color.gray6,
   lineHeight: lineHeight.tight,
   textAlign: 'center',
   marginBottom: space[3],

   [above(breakpoint.sm)]: {
      marginBottom: 0,
      marginRight: space[2],
      textAlign: 'left',
   },
});

interface BannerProps {
   className?: string;
   children: string;
   callToAction: string;
   onClick: () => void;
}

function Banner({ className, children, callToAction, onClick }: BannerProps) {
   return (
      <Container className={className}>
         <Text>{children}</Text>
         <Button size="small" onClick={onClick}>
            {callToAction}
         </Button>
      </Container>
   );
}

export default Banner;
