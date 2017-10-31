// TODO: move this component to toolbox
import React from 'react';
import PropTypes from 'prop-types';
import glamorous from 'glamorous';

import { Button, constants } from 'toolbox';

const { breakpoint, color, fontSize, lineHeight, spacing } = constants;

const propTypes = {
  children: PropTypes.string.isRequired,
  className: PropTypes.string,
  callToAction: PropTypes.string,
  onClick: PropTypes.func,
};

const defaultProps = {
  className: '',
  callToAction: '',
  onClick: () => {},
};

const Container = glamorous.div({
  display: 'flex',
  flex: '0 0 auto',
  flexDirection: 'column',
  alignItems: 'stretch',
  background: color.gray[2],
  padding: `${spacing[2]} ${spacing[3]}`,

  [breakpoint.sm]: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing[1]} ${spacing[3]}`,
  },
});

const Text = glamorous.span({
  fontSize: fontSize[1],
  color: color.grayAlpha[6],
  lineHeight: lineHeight.title,
  textAlign: 'center',
  marginBottom: spacing[2],

  [breakpoint.sm]: {
    marginBottom: 0,
    marginRight: spacing[2],
    textAlign: 'left',
  },
});

function Banner({ className, children, callToAction, onClick }) {
  return (
    <Container className={className}>
      <Text>{children}</Text>
      <Button size="small" onClick={onClick}>
        {callToAction}
      </Button>
    </Container>
  );
}

Banner.propTypes = propTypes;
Banner.defaultProps = defaultProps;

export default Banner;
