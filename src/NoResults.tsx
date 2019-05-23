import { space } from '@core-ds/primitives';
import { Button } from '@ifixit/toolbox';
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
   flex: 1 1 100%;
   padding: ${space[4]};
   display: flex;
   flex-direction: column;
   justify-content: center;
   align-items: center;
   max-width: 100%;
   text-align: center;
`;

interface NoResultsProps {
   query: string;
   allowOrphan: boolean;
   selectItem: (title: string) => void;
   translate: (...strings: string[]) => string;
}

function NoResults({
   query,
   allowOrphan,
   selectItem,
   translate,
}: NoResultsProps) {
   return (
      <Container>
         <p>{translate('No matches found. Did you spell it correctly?')}</p>
         {allowOrphan ? (
            <Button
               style={{ maxWidth: '100%' }}
               onClick={() => selectItem(query)}
            >
               {translate('Choose %1', `"${query}"`)}
            </Button>
         ) : null}
      </Container>
   );
}

export default NoResults;
