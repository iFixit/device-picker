import { Button, constants } from '@ifixit/toolbox';
import glamorous from 'glamorous';
import React, { Component } from 'react';

const Container = glamorous('div', {
   withProps: { role: 'presentation', tabIndex: 0 },
})({
   flex: '0 0 100%',
   padding: constants.spacing[3],
   textAlign: 'center',
   display: 'flex',
   flexDirection: 'column',
   justifyContent: 'center',
   alignItems: 'center',
   maxWidth: '100%',
});

interface NoResultsProps {
   itemName: string;
   selectItem: (title: string) => void;
   allowOrphan: boolean;
   translate: any;
}

class NoResults extends Component<NoResultsProps> {
   render() {
      const {
         itemName,
         selectItem,
         allowOrphan,
         translate,
         ...props
      } = this.props;

      return (
         <Container {...props}>
            <p>{translate('No matches found. Did you spell it correctly?')}</p>
            {allowOrphan && (
               <Button
                  style={{ maxWidth: '100%' }}
                  onClick={() => selectItem(itemName)}
               >
                  {translate('Choose %1', `"${itemName}"`)}
               </Button>
            )}
         </Container>
      );
   }
}

export default NoResults;
