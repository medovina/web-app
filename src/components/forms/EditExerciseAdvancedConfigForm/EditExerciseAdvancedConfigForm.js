import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { Alert, Table } from 'react-bootstrap';
import classnames from 'classnames';

import FormBox from '../../widgets/FormBox';
import Button from '../../widgets/FlatButton';
import { RefreshIcon } from '../../icons';
import SubmitButton from '../SubmitButton';
import ResourceRenderer from '../../helpers/ResourceRenderer';

import EditExerciseAdvancedConfigTest from './EditExerciseAdvancedConfigTest';
import { getSupplementaryFilesForExercise } from '../../../redux/selectors/supplementaryFiles';
import { encodeNumId, createIndex, safeSet } from '../../../helpers/common';
import { SUBMIT_BUTTON_MESSAGES } from '../../../helpers/exercise/config';
import {
  exerciseConfigFormSmartFillAll,
  exerciseConfigFormSmartFillInput,
  exerciseConfigFormSmartFillArgs,
  exerciseConfigFormSmartFillOutput,
  exerciseConfigFormSmartFillJudge,
  exerciseConfigFormSmartFillCompilation
} from '../../../redux/modules/exerciseConfigs';
import { exerciseConfigFormErrors } from '../../../redux/selectors/exerciseConfigs';

import styles from './EditExerciseAdvancedConfig.less';

class EditExerciseAdvancedConfigForm extends Component {
  render() {
    const {
      pipelines,
      pipelinesVariables = null,
      reset,
      handleSubmit,
      submitting,
      submitFailed,
      submitSucceeded,
      invalid,
      dirty,
      formErrors,
      supplementaryFiles,
      exerciseTests,
      smartFill,
      intl: { locale }
    } = this.props;

    return (
      <FormBox
        title={
          <FormattedMessage
            id="app.editExercise.editConfig"
            defaultMessage="Edit Exercise Configuration"
          />
        }
        unlimitedHeight
        noPadding
        success={submitSucceeded}
        dirty={dirty}
        footer={
          <div className="text-center">
            {dirty &&
              <span>
                <Button type="reset" onClick={reset} bsStyle="danger">
                  <RefreshIcon gapRight />
                  <FormattedMessage id="generic.reset" defaultMessage="Reset" />
                </Button>
              </span>}

            <SubmitButton
              id="editExerciseAdvancedConfig"
              invalid={invalid}
              submitting={submitting}
              dirty={dirty}
              hasSucceeded={submitSucceeded}
              hasFailed={submitFailed}
              handleSubmit={handleSubmit}
              messages={SUBMIT_BUTTON_MESSAGES}
            />
          </div>
        }
      >
        {submitFailed &&
          <Alert bsStyle="danger">
            <FormattedMessage
              id="generic.savingFailed"
              defaultMessage="Saving failed. Please try again later."
            />
          </Alert>}

        {pipelinesVariables &&
          <ResourceRenderer resource={supplementaryFiles.toArray()}>
            {(...files) =>
              <Table
                className={classnames({
                  'no-margin': true,
                  [styles.configTable]: true
                })}
              >
                {exerciseTests
                  .sort((a, b) => a.name.localeCompare(b.name, locale))
                  .map((test, idx) =>
                    <EditExerciseAdvancedConfigTest
                      key={idx}
                      pipelines={pipelines}
                      pipelinesVariables={pipelinesVariables}
                      supplementaryFiles={files}
                      testName={test.name}
                      test={'config.' + encodeNumId(test.id)}
                      testErrors={
                        formErrors && formErrors[encodeNumId(test.id)]
                      }
                      smartFill={
                        idx === 0 && exerciseTests.length > 1
                          ? smartFill(test.id, exerciseTests, files)
                          : undefined
                      }
                    />
                  )}
              </Table>}
          </ResourceRenderer>}
      </FormBox>
    );
  }
}

EditExerciseAdvancedConfigForm.propTypes = {
  exerciseId: PropTypes.string.isRequired,
  exerciseTests: PropTypes.array,
  pipelines: PropTypes.array,
  pipelinesVariables: PropTypes.array,
  reset: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  hasFailed: PropTypes.bool,
  hasSucceeded: PropTypes.bool,
  dirty: PropTypes.bool,
  submitFailed: PropTypes.bool,
  submitSucceeded: PropTypes.bool,
  invalid: PropTypes.bool,
  formErrors: PropTypes.object,
  supplementaryFiles: ImmutablePropTypes.map,
  smartFill: PropTypes.func.isRequired,
  intl: intlShape.isRequired
};

const validate = (formData, { dataOnly }) => {
  const errors = {};

  return errors;
};

const warn = formData => {
  const warnings = {};

  return warnings;
};

const FORM_NAME = 'editExerciseAdvancedConfig';

export default connect(
  (state, { exerciseId }) => {
    return {
      supplementaryFiles: getSupplementaryFilesForExercise(exerciseId)(state),
      formErrors: exerciseConfigFormErrors(state, FORM_NAME)
    };
  },
  dispatch => ({
    // TODO -- fix smart fill for advanced form
    smartFill: (testId, tests, files) => ({
      all: () =>
        dispatch(
          exerciseConfigFormSmartFillAll(FORM_NAME, testId, tests, files)
        ),
      input: () =>
        dispatch(
          exerciseConfigFormSmartFillInput(FORM_NAME, testId, tests, files)
        ),
      args: () =>
        dispatch(
          exerciseConfigFormSmartFillArgs(FORM_NAME, testId, tests, files)
        ),
      output: () =>
        dispatch(
          exerciseConfigFormSmartFillOutput(FORM_NAME, testId, tests, files)
        ),
      judge: () =>
        dispatch(
          exerciseConfigFormSmartFillJudge(FORM_NAME, testId, tests, files)
        ),
      compilation: () =>
        dispatch(
          exerciseConfigFormSmartFillCompilation(
            FORM_NAME,
            testId,
            tests,
            files
          )
        )
    })
  })
)(
  reduxForm({
    form: FORM_NAME,
    enableReinitialize: true,
    keepDirtyOnReinitialize: false,
    immutableProps: [
      'formValues',
      'supplementaryFiles',
      'exerciseTests',
      'handleSubmit'
    ],
    validate,
    warn
  })(injectIntl(EditExerciseAdvancedConfigForm))
);
