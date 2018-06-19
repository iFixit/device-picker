import React, { Component } from 'react';
import PropTypes from 'prop-types';
import glamorous from 'glamorous';

import { constants } from '@ifixit/toolbox';

const { color } = constants;

const propTypes = {
  data: PropTypes.arrayOf(PropTypes.any).isRequired,
  highlightedIndex: PropTypes.number.isRequired,
  renderItem: PropTypes.func.isRequired,
};

const Container = glamorous('div', {
  withProps: { role: 'presentation', tabIndex: 0 },
})({
  flex: '0 0 auto',
  width: '16rem',
  boxShadow: `1px 0 0 ${color.grayAlpha[3]}`,
  overflowY: 'auto',
  outline: 0,
});

class List extends Component {
  componentDidUpdate(prevProps) {
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
  setListRef = element => {
    this.listRef = element;
  };

  /**
   * Scroll item into view.
   * @param {Object} params
   * @param {HTMLElement} params.itemElement
   * @param {HTMLElement} params.listElement
   */
  scrollToItem = ({ itemElement, listElement }) => {
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

List.propTypes = propTypes;

export default List;
