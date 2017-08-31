import React from 'react';
import PropTypes from 'prop-types';
import glamorous from 'glamorous';

const propTypes = {
  image: PropTypes.shape({
    standard: PropTypes.string.isRequired,
  }),
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
  padding: '2rem',
  textAlign: 'center',
  overflowY: 'auto',
});

const Image = glamorous.div(
  {
    width: '100%',
    height: '14rem',
    minHeight: '3rem',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
  },
  ({ url }) => ({
    backgroundImage: `url(${url})`,
  }),
);

const Title = glamorous.span({
  margin: '1rem 0 0.5rem',
  lineHeight: 1.5,
  fontWeight: 700,
});

const Description = glamorous.span({
  lineHeight: 1.5,
  color: 'rgba(0, 3, 6, 0.54)',
});

function truncate(string, length) {
  if (string.length <= length) {
    return string;
  }

  const ellipses = '...';

  return string.slice(0, length - ellipses.length) + ellipses;
}

function Preview({ image, title, description }) {
  return (
    <Container>
      <Image url={image.standard} />
      <Title>{title}</Title>
      <Description>{truncate(description, 80)}</Description>
    </Container>
  );
}

Preview.propTypes = propTypes;
Preview.defaultProps = defaultProps;

export default Preview;
