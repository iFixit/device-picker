import styled, { keyframes } from 'styled-components';
import React from 'react';

const spinnerSize = 20;

const spinnerKeyframes = keyframes`
  0% {
    transform: rotate(0deg);
    stroke-dashoffset: ${(Math.PI * spinnerSize) / 8};
  }

  50% {
    transform: rotate(720deg);
    stroke-dashoffset: ${Math.PI * spinnerSize};
  }

  100% {
    transform: rotate(1080deg);
    stroke-dashoffset: ${(Math.PI * spinnerSize) / 8};
  }
`;

const Circle = styled.circle`
   fill: none;
   stroke: currentColor;
   stroke-width: 2;
   stroke-linecap: round;
   stroke-dasharray: ${Math.PI * spinnerSize}; /* Circumference of spinner */
   transform-origin: center center;
   animation: ${spinnerKeyframes} 2s linear infinite;
`;

function Spinner(props: React.SVGProps<SVGSVGElement>) {
   return (
      <svg
         width={24}
         height={24}
         viewBox="0 0 24 24"
         aria-hidden={true}
         {...props}
      >
         <Circle cx={12} cy={12} r={spinnerSize / 2} />
      </svg>
   );
}

export default Spinner;
