// TODO: move this component to toolbox
import { Button, constants } from '@ifixit/toolbox';
import glamorous from 'glamorous';
import React from 'react';

const { breakpoint, color, fontSize, lineHeight, spacing } = constants;

const Container = glamorous.div({
   display: 'flex',
   flex: '0 0 auto',
   flexDirection: 'column',
   alignItems: 'stretch',
   background: color.gray[2],
   padding: `${spacing[2]} ${spacing[3]}`,

   [breakpoint.sm]: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${spacing[1]} ${spacing[3]}`,
   },
});

const Text = glamorous.span({
   fontSize: fontSize[1],
   color: color.grayAlpha[6],
   lineHeight: lineHeight.title,
   textAlign: 'center',
   marginBottom: spacing[2],

   [breakpoint.sm]: {
      marginBottom: 0,
      marginRight: spacing[2],
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
