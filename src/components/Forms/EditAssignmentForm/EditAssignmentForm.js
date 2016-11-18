import React, { PropTypes } from 'react';
import { canUseDOM } from 'exenv';
import { reduxForm, Field, FieldArray } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Alert, HelpBlock } from 'react-bootstrap';
import isNumeric from 'validator/lib/isNumeric';

import FormBox from '../../AdminLTE/FormBox';
import { DatetimeField, TextField, CheckboxField, SourceCodeField } from '../Fields';
import LocalizedAssignmentsFormField from '../LocalizedAssignmentsFormField';
import SubmitButton from '../SubmitButton';

if (canUseDOM) {
  require('codemirror/mode/yaml/yaml');
}

const EditAssignmentForm = ({
  initialValues: assignment,
  submitting,
  handleSubmit,
  submitFailed: hasFailed,
  submitSucceeded: hasSucceeded,
  invalid,
  formValues: {
    firstDeadline,
    allowSecondDeadline,
    localizedAssignments
  } = {}
}) => (
  <div>
    <FieldArray
      name='localizedAssignments'
      localizedAssignments={localizedAssignments}
      component={LocalizedAssignmentsFormField} />

    <FormBox
      title={<FormattedMessage id='app.editAssignmentForm.title' defaultMessage='Edit assignment {name}' values={{ name: assignment.name }} />}
      type={hasSucceeded ? 'success' : undefined}
      footer={
        <div className='text-center'>
          <SubmitButton
            invalid={invalid}
            submitting={submitting}
            hasSucceeded={hasSucceeded}
            hasFailed={hasFailed}
            handleSubmit={handleSubmit}
            messages={{
              submit: <FormattedMessage id='app.editAssignmentForm.submit' defaultMessage='Edit settings' />,
              submitting: <FormattedMessage id='app.editAssignmentForm.submitting' defaultMessage='Saving changes ...' />,
              success: <FormattedMessage id='app.editAssignmentForm.success' defaultMessage='Settings were saved.' />
            }} />
        </div>
      }>

      {hasFailed && (
        <Alert bsStyle='danger'>
          <FormattedMessage id='app.editAssignmentForm.failed' defaultMessage='Saving failed. Please try again later.' />
        </Alert>)}

      <Field
        name='name'
        component={TextField}
        label={<FormattedMessage id='app.editAssignmentForm.name' defaultMessage='Assignment default name:' />} />

      <Field
        name='isPublic'
        component={CheckboxField}
        onOff
        colored
        label={<FormattedMessage id='app.editAssignmentForm.isPublic' defaultMessage='Visible to students' />} />

      <Field
        name='scoreConfig'
        component={SourceCodeField}
        mode='yaml'
        label={<FormattedMessage id='app.editAssignmentForm.scoreConfig' defaultMessage='Score configuration:' />} />
      <HelpBlock>Read more about <a href='/@todo'>score configuration</a> syntax.</HelpBlock>

      <Field
        name='firstDeadline'
        component={DatetimeField}
        label={<FormattedMessage id='app.editAssignmentForm.firstDeadline' defaultMessage='First deadline:' />} />

      <Field
        name="maxPointsBeforeFirstDeadline"
        component={TextField}
        label={<FormattedMessage id='app.editAssignmentForm.maxPointsBeforeFirstDeadline' defaultMessage='Maximum amount of points received when submitted before the deadline:' />} />

      <Field
        name="allowSecondDeadline"
        component={CheckboxField}
        onOff
        label={<FormattedMessage id='app.editAssignmentForm.allowSecondDeadline' defaultMessage='Allow second deadline.' />} />

      {allowSecondDeadline && (
        <Field
          name='secondDeadline'
          disabled={!firstDeadline || allowSecondDeadline !== true}
          isValidDate={(date) => date.isSameOrAfter(firstDeadline)}
          component={DatetimeField}
          label={<FormattedMessage id='app.editAssignmentForm.secondDeadline' defaultMessage='Second deadline:' />} />
      )}
      {allowSecondDeadline && !firstDeadline && (
        <HelpBlock>
          <FormattedMessage id='app.editAssignmentForm.chooseFirstDeadlineBeforeSecondDeadline' defaultMessage='You must select the date of the first deadline before selecting the date of the second deadline.' />
        </HelpBlock>
      )}
      {allowSecondDeadline && (
        <Field
          name="maxPointsBeforeSecondDeadline"
          disabled={allowSecondDeadline !== true}
          component={TextField}
          label={<FormattedMessage id='app.editAssignmentForm.maxPointsBeforeSecondDeadline' defaultMessage='Maximum amount of points received when submitted before the second deadline:' />} />
      )}

      <Field
        name="submissionsCountLimit"
        component={TextField}
        label={<FormattedMessage id='app.editAssignmentForm.submissionsCountLimit' defaultMessage='Submissions count limit:' />} />

      <Field
        name='canViewLimitRatios'
        component={CheckboxField}
        onOff
        colored
        label={<FormattedMessage id='app.editAssignmentForm.canViewLimitRatios' defaultMessage='Visibility of memory and time ratios' />} />

    </FormBox>
  </div>
);

EditAssignmentForm.propTypes = {
  initialValues: PropTypes.object.isRequired,
  values: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  formValues: PropTypes.shape({
    firstDeadline: PropTypes.oneOfType([ PropTypes.number, PropTypes.object ]), // object == moment.js instance
    allowSecondDeadline: PropTypes.bool,
    localizedAssignments: PropTypes.array
  })
};

const isNonNegativeInteger = (n) =>
  typeof n !== 'undefined' && (typeof n === 'number' || isNumeric(n)) && parseInt(n) >= 0;

const isPositiveInteger = (n) =>
  typeof n !== 'undefined' && (typeof n === 'number' || isNumeric(n)) && parseInt(n) > 0;

const validate = ({
  name,
  submissionsCountLimit,
  firstDeadline,
  secondDeadline,
  allowSecondDeadline,
  maxPointsBeforeFirstDeadline,
  maxPointsBeforeSecondDeadline
}) => {
  const errors = {};

  if (!name) {
    errors['name'] = <FormattedMessage id='app.editAssignmentForm.validation.emptyName' defaultMessage='Please fill the name of the assignment.' />;
  }

  if (!firstDeadline) {
    errors['firstDeadline'] = <FormattedMessage id='app.editAssignmentForm.validation.emptyDeadline' defaultMessage='Please fill the date and time of the deadline.' />;
  }

  if (!isPositiveInteger(submissionsCountLimit)) {
    errors['submissionsCountLimit'] = <FormattedMessage id='app.editAssignmentForm.validation.submissionsCountLimit' defaultMessage='Please fill the submissions count limit field with a positive integer.' />;
  }

  if (!isNonNegativeInteger(maxPointsBeforeFirstDeadline)) {
    errors['maxPointsBeforeFirstDeadline'] = <FormattedMessage id='app.editAssignmentForm.validation.maxPointsBeforeFirstDeadline' defaultMessage='Please fill the maximum number of points received when submitted before the deadline with a nonnegative integer.' />;
  }

  if (allowSecondDeadline && !secondDeadline) {
    errors['secondDeadline'] = <FormattedMessage id='app.editAssignmentForm.validation.secondDeadline' defaultMessage='Please fill the date and time of the second deadline.' />;
  }

  if (allowSecondDeadline && firstDeadline && secondDeadline && !firstDeadline.isSameOrBefore(secondDeadline) && !firstDeadline.isSameOrBefore(secondDeadline, 'hour')) {
    errors['secondDeadline'] = <FormattedMessage id='app.editAssignmentForm.validation.secondDeadlineBeforeFirstDeadline' defaultMessage='Please fill the date and time of the second deadline with a value which is after {firstDeadline, date} {firstDeadline, time, short}.' values={{ firstDeadline }} />;
  }

  if (allowSecondDeadline && !isNonNegativeInteger(maxPointsBeforeSecondDeadline)) {
    errors['maxPointsBeforeSecondDeadline'] = <FormattedMessage id='app.editAssignmentForm.validation.maxPointsBeforeSecondDeadline' defaultMessage='Please fill the number of maximu points received after the first and before the second deadline with a nonnegative integer or remove the second deadline.' />;
  }

  return errors;
};

export default reduxForm({
  form: 'editAssignment',
  validate
})(EditAssignmentForm);