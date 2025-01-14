import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { reset } from 'redux-form';
import { defaultMemoize } from 'reselect';

import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';
import EditExerciseForm from '../../components/forms/EditExerciseForm';
import AttachmentFilesTableContainer from '../../containers/AttachmentFilesTableContainer';
import DeleteExerciseButtonContainer from '../../containers/DeleteExerciseButtonContainer';
import ExerciseButtons from '../../components/Exercises/ExerciseButtons';
import { NeedFixingIcon } from '../../components/icons';

import { fetchExerciseIfNeeded, editExercise } from '../../redux/modules/exercises';
import { getExercise } from '../../redux/selectors/exercises';
import { isSubmitting } from '../../redux/selectors/submission';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';

import withLinks from '../../helpers/withLinks';
import {
  getLocalizedName,
  getLocalizedTextsInitialValues,
  transformLocalizedTextsFormData,
} from '../../helpers/localizedData';

const localizedTextDefaults = {
  name: '',
  text: '',
  link: '',
  description: '',
};

const prepareInitialValues = defaultMemoize((id, version, localizedTexts, difficulty, isPublic, isLocked) => ({
  id,
  version,
  localizedTexts: getLocalizedTextsInitialValues(localizedTexts, localizedTextDefaults),
  difficulty,
  isPublic,
  isLocked,
}));

class EditExercise extends Component {
  componentDidMount = () => this.props.loadAsync();

  componentDidUpdate(prevProps) {
    if (this.props.match.params.exerciseId !== prevProps.match.params.exerciseId) {
      this.props.reset();
      this.props.loadAsync();
    }
  }

  static loadAsync = ({ exerciseId }, dispatch) => Promise.all([dispatch(fetchExerciseIfNeeded(exerciseId))]);

  editExerciseSubmitHandler = formData => {
    const { exercise, editExercise } = this.props;
    const { localizedTexts, ...data } = formData;
    return editExercise(exercise.getIn(['data', 'version']), {
      localizedTexts: transformLocalizedTextsFormData(localizedTexts),
      ...data,
    });
  };

  render() {
    const {
      links: { EXERCISES_URI, EXERCISE_URI_FACTORY },
      match: {
        params: { exerciseId },
      },
      history: { replace },
      exercise,
      intl: { locale },
    } = this.props;

    return (
      <Page
        resource={exercise}
        title={exercise => getLocalizedName(exercise, locale)}
        description={<FormattedMessage id="app.editExercise.description" defaultMessage="Change exercise settings" />}
        breadcrumbs={[
          {
            resource: exercise,
            breadcrumb: exercise => ({
              text: (
                <FormattedMessage
                  id="app.exercise.breadcrumbTitle"
                  defaultMessage="Exercise {name}"
                  values={{
                    name: exercise ? getLocalizedName(exercise, locale) : '',
                  }}
                />
              ),
              iconName: 'puzzle-piece',
              link: EXERCISE_URI_FACTORY(exerciseId),
            }),
          },
          {
            text: <FormattedMessage id="app.editExercise.title" defaultMessage="Edit exercise" />,
            iconName: ['far', 'edit'],
          },
        ]}>
        {exercise =>
          exercise && (
            <div>
              {exercise.isBroken && (
                <Row>
                  <Col sm={12}>
                    <div className="callout callout-warning">
                      <h4>
                        <NeedFixingIcon gapRight />
                        <FormattedMessage
                          id="app.exercise.isBroken"
                          defaultMessage="Exercise configuration is incorrect and needs fixing"
                        />
                      </h4>
                      {exercise.validationError}
                    </div>
                  </Col>
                </Row>
              )}
              <Row>
                <Col sm={12}>
                  <ExerciseButtons {...exercise} />
                </Col>
              </Row>
              <Row>
                <Col lg={6}>
                  <EditExerciseForm
                    initialValues={prepareInitialValues(
                      exercise.id,
                      exercise.version,
                      exercise.localizedTexts,
                      exercise.difficulty,
                      exercise.isPublic,
                      exercise.isLocked
                    )}
                    onSubmit={this.editExerciseSubmitHandler}
                  />
                </Col>
                <Col lg={6}>
                  <AttachmentFilesTableContainer exercise={exercise} />
                </Col>
              </Row>
              <br />
              {exercise.permissionHints.remove && (
                <Row>
                  <Col lg={12}>
                    <Box
                      type="danger"
                      title={
                        <FormattedMessage id="app.editExercise.deleteExercise" defaultMessage="Delete the exercise" />
                      }>
                      <div>
                        <p>
                          <FormattedMessage
                            id="app.editExercise.deleteExerciseWarning"
                            defaultMessage="Deleting an exercise will remove all the students submissions and all assignments."
                          />
                        </p>
                        <p className="text-center">
                          <DeleteExerciseButtonContainer id={exercise.id} onDeleted={() => replace(EXERCISES_URI)} />
                        </p>
                      </div>
                    </Box>
                  </Col>
                </Row>
              )}
            </div>
          )
        }
      </Page>
    );
  }
}

EditExercise.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }),
  exercise: ImmutablePropTypes.map,
  loadAsync: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  editExercise: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      exerciseId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  links: PropTypes.object.isRequired,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired,
};

export default withLinks(
  connect(
    (
      state,
      {
        match: {
          params: { exerciseId },
        },
      }
    ) => {
      return {
        exercise: getExercise(exerciseId)(state),
        submitting: isSubmitting(state),
        userId: loggedInUserIdSelector(state),
      };
    },
    (
      dispatch,
      {
        match: {
          params: { exerciseId },
        },
      }
    ) => ({
      reset: () => dispatch(reset('editExercise')),
      loadAsync: () => EditExercise.loadAsync({ exerciseId }, dispatch),
      editExercise: (version, data) => dispatch(editExercise(exerciseId, { ...data, version })),
    })
  )(injectIntl(EditExercise))
);
