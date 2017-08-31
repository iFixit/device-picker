import React, { Component } from 'react';
import PropTypes from 'prop-types';
import glamorous from 'glamorous';

const Container = glamorous('div', {
  withProps: { role: 'presentation', tabIndex: 0 },
})({
  flex: '0 0 auto',
  width: '16rem',
  boxShadow: '1px 0 0 rgba(0, 3, 6, 0.12)',
  overflowY: 'auto',
  outline: 0,
});

class List extends Component {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.any).isRequired,
    highlightedIndex: PropTypes.number.isRequired,
    renderItem: PropTypes.func.isRequired,
  };

  componentDidUpdate(prevProps) {
    const { highlightedIndex } = this.props;

    if (
      prevProps.highlightedIndex !== highlightedIndex &&
      highlightedIndex > -1
    ) {
      this.scrollToItem({
        itemNode: this.listRef.children[highlightedIndex],
        listNode: this.listRef,
      });
    }
  }

  setListRef = node => {
    this.listRef = node;
  };

  scrollToItem = ({ itemNode, listNode }) => {
    const itemRect = itemNode.getBoundingClientRect();
    const listRect = listNode.getBoundingClientRect();

    if (itemRect.top < listRect.top) {
      listNode.scrollTop += itemRect.top - listRect.top;
    }

    if (itemRect.bottom > listRect.bottom) {
      listNode.scrollTop += itemRect.bottom - listRect.bottom;
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
