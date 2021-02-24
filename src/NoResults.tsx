import { space } from '@core-ds/primitives';
import { _js } from '@ifixit/localize';
import { Button } from '@ifixit/toolbox';
import React from 'react';
import styled from 'styled-components';
import DevicePicker from './DevicePicker';

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
   allowOrphan?: boolean;
   selectItem: (title: string) => void;
}

function NoResults({
   query,
   allowOrphan = DevicePicker.defaultProps.allowOrphan,
   selectItem,
}: NoResultsProps) {
   return (
      <Container>
         <p>{_js('No matches found. Did you spell it correctly?')}</p>
         {allowOrphan ? (
            <Button
               style={{ maxWidth: '100%' }}
               onClick={() => selectItem(query)}
            >
               {_js('Choose %1', `"${query}"`)}
            </Button>
         ) : null}
      </Container>
   );
}

export default NoResults;
