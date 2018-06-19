import React from 'react';
import PropTypes from 'prop-types';
import glamorous from 'glamorous';

import { constants } from '@ifixit/toolbox';

const { color, fontSize, lineHeight, spacing } = constants;

const propTypes = {
  image: PropTypes.shape({
    standard: PropTypes.string.isRequired,
  }),
  translate: PropTypes.func.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
};

const defaultProps = {
  image: { standard: '' },
  title: '',
  description: '',
};

const Container = glamorous.div({
  flex: '1 0 auto',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  width: '16rem',
  padding: spacing[4],
  textAlign: 'center',
  overflowY: 'auto',
});

const Image = glamorous.div(
  {
    width: '100%',
    height: '14rem',
    minHeight: '3rem',
    backgroundSize: 'contain',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
  },
  ({ url }) => ({
    backgroundImage: `url(${url})`,
  }),
);

const Title = glamorous.span({
  margin: `${spacing[3]} 0 ${spacing[1]}`,
  fontSize: fontSize[2],
  lineHeight: lineHeight.copy,
  fontWeight: 700,
});

const Description = glamorous.span({
  fontSize: fontSize[2],
  lineHeight: lineHeight.copy,
  color: color.grayAlpha[6],
});

/**
 * Truncate string to given length.
 * @param {string} string
 * @param {number} length
 * @param {string} - Truncated string.
 */
function truncate(string, length) {
  if (string.length <= length) {
    return string;
  }

  const ellipses = '...';

  return string.slice(0, length - ellipses.length) + ellipses;
}

function Preview({ translate, image, title, description }) {
  return (
    <Container>
      <Image url={image ? image.standard : ''} />
      <Title>{translate(title)}</Title>
      <Description>{truncate(translate(description), 80)}</Description>
    </Container>
  );
}

Preview.propTypes = propTypes;
Preview.defaultProps = defaultProps;

export default Preview;
