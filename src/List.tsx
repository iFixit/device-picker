import { constants } from '@ifixit/toolbox';
import glamorous from 'glamorous';
import React, { Component } from 'react';

const { color } = constants;

const Container = glamorous('div', {
   withProps: { role: 'presentation', tabIndex: 0 },
})({
   flex: '0 0 auto',
   width: '16rem',
   boxShadow: `1px 0 0 ${color.grayAlpha[3]}`,
   overflowY: 'auto',
   outline: 0,
});

interface ListProps {
   data: any[];
   highlightedIndex: number;
   renderItem: any;
   onClick: () => void;
}

class List extends Component<ListProps> {
   listRef: any;

   componentDidUpdate(prevProps: ListProps) {
      const { highlightedIndex } = this.props;

      if (
         prevProps.highlightedIndex !== highlightedIndex &&
         highlightedIndex > -1
      ) {
         // if highlightedIndex changed and it's not -1,
         // scroll to the highlighted item
         this.scrollToItem({
            itemElement: this.listRef.children[highlightedIndex],
            listElement: this.listRef,
         });
      }
   }

   componentDidMount() {
      const { highlightedIndex } = this.props;

      if (highlightedIndex > -1) {
         this.scrollToItem({
            itemElement: this.listRef.children[highlightedIndex],
            listElement: this.listRef,
         });
      }
   }

   /**
    * Store reference to the list DOM element.
    * @param {HTMLElement} element
    */
   setListRef = (element: HTMLElement) => {
      this.listRef = element;
   };

   /**
    * Scroll item into view.
    * @param {Object} params
    * @param {HTMLElement} params.itemElement
    * @param {HTMLElement} params.listElement
    */
   scrollToItem = ({ itemElement, listElement }: any) => {
      const itemRect = itemElement.getBoundingClientRect();
      const listRect = listElement.getBoundingClientRect();

      if (itemRect.top < listRect.top) {
         listElement.scrollTop += itemRect.top - listRect.top;
      }

      if (itemRect.bottom > listRect.bottom) {
         listElement.scrollTop += itemRect.bottom - listRect.bottom;
      }
   };

   render() {
      const { data, highlightedIndex, renderItem, ...props } = this.props;

      return (
         <Container {...props} innerRef={this.setListRef}>
            {data.map((item, index) =>
               renderItem({ item, isHighlighted: index === highlightedIndex }),
            )}
         </Container>
      );
   }
}

export default List;
