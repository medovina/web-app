import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import {
  FormattedMessage,
  defineMessages,
  intlShape,
  injectIntl
} from 'react-intl';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Row, Col, Button } from 'react-bootstrap';
import Page from '../../components/Page';
import Box from '../../components/AdminLTE/Box';
import ResourceRenderer from '../../components/ResourceRenderer';

import {
  fetchReferenceSolutionsIfNeeded
} from '../../redux/modules/referenceSolutions';
import {
  referenceSolutionsSelector
} from '../../redux/selectors/referenceSolutions';
import ReferenceSolutionDetail
  from '../../components/ReferenceSolutions/ReferenceSolutionDetail';
import ReferenceSolutionEvaluation
  from '../../components/ReferenceSolutions/ReferenceSolutionEvaluation';
import SourceCodeInfoBox from '../../components/SourceCodeInfoBox';
import SourceCodeViewerContainer
  from '../../containers/SourceCodeViewerContainer';
import { fetchLimits } from '../../redux/modules/limits';
import {
  downloadEvaluationArchive
} from '../../redux/modules/referenceSolutions';
import { getEnvironmentsLimits } from '../../redux/selectors/limits';
import { DownloadIcon } from '../../components/Icons';

const messages = defineMessages({
  title: {
    id: 'app.exercise.referenceSolutionTitle',
    defaultMessage: 'Reference solution overview'
  }
});

class ReferenceSolution extends Component {
  state = { openFileId: null };
  openFile = id => this.setState({ openFileId: id });
  hideFile = () => this.setState({ openFileId: null });

  static loadAsync = ({ exerciseId }, dispatch) =>
    Promise.all([
      dispatch(fetchReferenceSolutionsIfNeeded(exerciseId)),
      dispatch(fetchLimits(exerciseId))
    ]);

  componentWillMount() {
    this.props.loadAsync();
  }

  componentWillReceiveProps(newProps) {
    if (
      this.props.params.referenceSolutionId !==
      newProps.params.referenceSolutionId
    ) {
      newProps.loadAsync();
    }
  }

  render() {
    const {
      referenceSolutions,
      environments,
      params: { exerciseId, referenceSolutionId },
      downloadEvaluationArchive,
      intl: { formatMessage }
    } = this.props;
    const { openFileId } = this.state;

    const { links: { EXERCISES_URI, EXERCISE_URI_FACTORY } } = this.context;

    return (
      <Page
        title={formatMessage(messages.title)}
        resource={referenceSolutions}
        description={
          <FormattedMessage
            id="app.exercise.description"
            defaultMessage="Exercise overview"
          />
        }
        breadcrumbs={[
          {
            text: (
              <FormattedMessage
                id="app.exercises.title"
                defaultMessage="Exercises"
              />
            ),
            iconName: 'puzzle-piece',
            link: EXERCISES_URI
          },
          {
            text: (
              <FormattedMessage
                id="app.exercise.description"
                defaultMessage="Exercise overview"
              />
            ),
            iconName: 'lightbulb-o',
            link: EXERCISE_URI_FACTORY(exerciseId)
          },
          {
            text: (
              <FormattedMessage
                id="app.exercise.referenceSolutionDetail"
                defaultMessage="Reference solution detail"
              />
            ),
            iconName: 'diamond'
          }
        ]}
      >
        {referenceSolutions => {
          const referenceSolution = referenceSolutions.find(
            solution => solution.id === referenceSolutionId
          );
          return (
            <div>
              <Row>
                <Col lg={6}>
                  <ReferenceSolutionDetail {...referenceSolution} />
                  <Row>
                    {referenceSolution.solution.files.map(file => (
                      <Col lg={6} md={12} key={file.id}>
                        <a href="#" onClick={() => this.openFile(file.id)}>
                          <SourceCodeInfoBox {...file} />
                        </a>
                      </Col>
                    ))}
                  </Row>
                </Col>
                <Col lg={6}>
                  <ResourceRenderer resource={environments}>
                    {environments => (
                      <div>
                        {environments.environments.map(env => (
                          <ReferenceSolutionEvaluation
                            key={env.environment.id}
                            referenceSolutionId={referenceSolutionId}
                            environment={env.environment}
                            evaluations={env.referenceSolutionsEvaluations}
                            renderButtons={evaluationId => (
                              <Button
                                bsSize="xs"
                                className="btn-flat"
                                onClick={() =>
                                  downloadEvaluationArchive(evaluationId)}
                              >
                                <DownloadIcon />
                                {' '}
                                <FormattedMessage
                                  id="app.referenceSolutionEvaluation.downloadResults"
                                  defaultMessage="Download results"
                                />
                              </Button>
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </ResourceRenderer>
                </Col>
              </Row>

              <SourceCodeViewerContainer
                show={openFileId !== null}
                fileId={openFileId}
                onHide={() => this.hideFile()}
              />
            </div>
          );
        }}
      </Page>
    );
  }
}

ReferenceSolution.contextTypes = {
  router: PropTypes.object,
  links: PropTypes.object,
  intl: intlShape.isRequired
};

ReferenceSolution.propTypes = {
  params: PropTypes.shape({
    exerciseId: PropTypes.string.isRequired,
    referenceSolutionId: PropTypes.string.isRequired
  }).isRequired,
  referenceSolutions: ImmutablePropTypes.map,
  environments: ImmutablePropTypes.map,
  downloadEvaluationArchive: PropTypes.func.isRequired
};

export default injectIntl(
  connect(
    (state, { params: { exerciseId, referenceSolutionId } }) => ({
      referenceSolutions: referenceSolutionsSelector(exerciseId)(state),
      environments: getEnvironmentsLimits(exerciseId)(state)
    }),
    (dispatch, { params }) => ({
      loadAsync: () => ReferenceSolution.loadAsync(params, dispatch),
      downloadEvaluationArchive: evaluationId =>
        dispatch(downloadEvaluationArchive(evaluationId))
    })
  )(ReferenceSolution)
);
