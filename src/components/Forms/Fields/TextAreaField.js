import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import {
  FormGroup,
  FormControl,
  ControlLabel,
  HelpBlock
} from 'react-bootstrap';

const TextAreaField = ({
  input,
  meta: {
    touched,
    error
  },
  type = 'text',
  label,
  children,
  ...props
}) => (
  <FormGroup
    controlId={name}
    validationState={touched && error ? 'error' : undefined}>
    <ControlLabel>{label}</ControlLabel>
    <FormControl {...input} {...props} componentClass='textarea' rows={8} />
    {touched && error && <HelpBlock>{error}</HelpBlock>}
    {children}
  </FormGroup>
);

TextAreaField.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) })
  ]).isRequired
};

export default TextAreaField;
