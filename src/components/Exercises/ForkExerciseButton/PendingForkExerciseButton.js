import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../../AdminLTE/FlatButton';
import { LoadingIcon } from '../../Icons';

const PendingForkExerciseButton = props => (
  <Button
    bsStyle="default"
    bsSize="sm"
    className="btn-flat"
    disabled
    {...props}
  >
    <LoadingIcon />
    {' '}
    <FormattedMessage
      id="app.forkExerciseButton.loading"
      defaultMessage="Forking ..."
    />
  </Button>
);

export default PendingForkExerciseButton;
