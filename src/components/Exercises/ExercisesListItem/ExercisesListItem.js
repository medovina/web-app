import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router-dom';

import DifficultyIcon from '../DifficultyIcon';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import GroupsNameContainer from '../../../containers/GroupsNameContainer';
import DeleteExerciseButtonContainer from '../../../containers/DeleteExerciseButtonContainer';

import { LocalizedExerciseName } from '../../helpers/LocalizedNames';
import EnvironmentsList from '../../helpers/EnvironmentsList';
import { ExercisePrefixIcons, EditIcon } from '../../icons';
import Button from '../../widgets/FlatButton';
import DateTime from '../../widgets/DateTime';
import AssignExerciseButton from '../../buttons/AssignExerciseButton';

import withLinks from '../../../helpers/withLinks';

const ExercisesListItem = ({
  id,
  name,
  difficulty,
  authorId,
  runtimeEnvironments,
  groupsIds = [],
  localizedTexts,
  createdAt,
  updatedAt,
  isLocked,
  isBroken,
  permissionHints,
  showGroups = false,
  showAssignButton = false,
  assignExercise = null,
  reload,
  links: {
    EXERCISE_URI_FACTORY,
    EXERCISE_EDIT_URI_FACTORY,
    EXERCISE_EDIT_CONFIG_URI_FACTORY,
    EXERCISE_EDIT_LIMITS_URI_FACTORY,
  },
}) => (
  <tr>
    <td className="shrink-col">
      <ExercisePrefixIcons id={id} isLocked={isLocked} isBroken={isBroken} />
    </td>
    <td>
      <strong>
        {permissionHints.viewDetail ? (
          <Link to={EXERCISE_URI_FACTORY(id)}>
            <LocalizedExerciseName entity={{ name, localizedTexts }} />
          </Link>
        ) : (
          <LocalizedExerciseName entity={{ name, localizedTexts }} />
        )}
      </strong>
    </td>
    <td>
      <UsersNameContainer userId={authorId} />
    </td>
    <td className="small">{runtimeEnvironments && <EnvironmentsList runtimeEnvironments={runtimeEnvironments} />}</td>
    {showGroups && (
      <td className="small">
        {groupsIds.length > 0 ? (
          groupsIds.map((groupId, i) => (
            <div key={i}>
              <GroupsNameContainer groupId={groupId} />
            </div>
          ))
        ) : (
          <i className="text-muted">
            <FormattedMessage id="app.exercisesListItem.noGroups" defaultMessage="no groups" />
          </i>
        )}
      </td>
    )}
    <td className="text-nowrap">
      <DifficultyIcon difficulty={difficulty} />
    </td>
    <td className="text-nowrap">
      <DateTime
        unixts={createdAt}
        showOverlay
        overlayTooltipId={`created-tooltip-${id}`}
        customTooltip={
          <span>
            <FormattedMessage id="generic.created" defaultMessage="Created" />
            : <DateTime unixts={createdAt} noWrap={false} />
            <br />
            <FormattedMessage id="generic.updated" defaultMessage="Updated" />
            : <DateTime unixts={updatedAt} noWrap={false} />
          </span>
        }
      />
    </td>

    <td className="text-right text-nowrap">
      {showAssignButton && assignExercise && (
        <AssignExerciseButton isLocked={isLocked} isBroken={isBroken} assignExercise={() => assignExercise(id)} />
      )}
      {permissionHints.update && (
        <LinkContainer to={EXERCISE_EDIT_URI_FACTORY(id)}>
          <Button bsSize="xs" bsStyle="warning">
            <EditIcon gapRight />
            <FormattedMessage id="app.exercises.listEdit" defaultMessage="Settings" />
          </Button>
        </LinkContainer>
      )}
      {permissionHints.viewPipelines && permissionHints.viewScoreConfig && (
        <LinkContainer to={EXERCISE_EDIT_CONFIG_URI_FACTORY(id)}>
          <Button bsSize="xs" bsStyle={permissionHints.setScoreConfig ? 'warning' : 'default'}>
            <EditIcon gapRight />
            <FormattedMessage id="app.exercises.listEditConfig" defaultMessage="Tests" />
          </Button>
        </LinkContainer>
      )}
      {permissionHints.viewLimits && (
        <LinkContainer to={EXERCISE_EDIT_LIMITS_URI_FACTORY(id)}>
          <Button bsSize="xs" bsStyle={permissionHints.setLimits ? 'warning' : 'default'}>
            <EditIcon gapRight />
            <FormattedMessage id="app.exercises.listEditLimits" defaultMessage="Limits" />
          </Button>
        </LinkContainer>
      )}
      {permissionHints.remove && (
        <DeleteExerciseButtonContainer id={id} bsSize="xs" resourceless={true} onDeleted={reload} />
      )}
    </td>
  </tr>
);

ExercisesListItem.propTypes = {
  id: PropTypes.string.isRequired,
  authorId: PropTypes.string.isRequired,
  runtimeEnvironments: PropTypes.array.isRequired,
  groupsIds: PropTypes.array,
  name: PropTypes.string.isRequired,
  difficulty: PropTypes.string.isRequired,
  createdAt: PropTypes.number.isRequired,
  updatedAt: PropTypes.number.isRequired,
  isLocked: PropTypes.bool.isRequired,
  isBroken: PropTypes.bool.isRequired,
  localizedTexts: PropTypes.array.isRequired,
  permissionHints: PropTypes.object.isRequired,
  showGroups: PropTypes.bool,
  showAssignButton: PropTypes.bool,
  assignExercise: PropTypes.func,
  reload: PropTypes.func,
  links: PropTypes.object,
};

export default withLinks(ExercisesListItem);
