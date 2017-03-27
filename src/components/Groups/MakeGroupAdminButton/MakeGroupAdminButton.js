import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import Icon from 'react-fontawesome';

const MakeGroupAdminButton = ({
  onClick,
  ...props
}) => (
  <Button {...props} onClick={onClick} bsStyle='success' className='btn-flat'>
    <Icon name='user-secret' /> <FormattedMessage id='app.groups.makeGroupAdminButton' defaultMessage='Make group admin' />
  </Button>
);

MakeGroupAdminButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default MakeGroupAdminButton;
