import {
   breakpoint,
   color,
   fontSize,
   lineHeight,
   space,
} from '@core-ds/primitives';
import { Button } from '@ifixit/toolbox';
import React from 'react';
import styled from 'styled-components';
import { above } from './utils/mediaQuery';

const Container = styled.div`
   display: flex;
   flex: 0 0 auto;
   flex-direction: column;
   align-items: stretch;
   background: ${color.gray1};
   padding: ${space[4]};

   ${above(breakpoint.sm)} {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: ${space[2]} ${space[4]};
   }
`;

const Text = styled.span`
   font-size: ${fontSize[1]};
   color: ${color.gray6};
   line-height: ${lineHeight.tight};
   text-align: center;
   margin-bottom: ${space[3]};

   ${above(breakpoint.sm)} {
      margin-bottom: 0px;
      margin-right: ${space[2]};
      text-align: left;
   }
`;

interface BannerProps {
   children: string;
   callToAction: string;
   onClick: () => void;
}

function Banner({ children, callToAction, onClick }: BannerProps) {
   return (
      <Container>
         <Text>{children}</Text>
         <Button size="small" onClick={onClick}>
            {callToAction}
         </Button>
      </Container>
   );
}

export default Banner;
