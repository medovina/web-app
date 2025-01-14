import { createSelector } from 'reselect';
import { EMPTY_LIST, EMPTY_MAP } from '../../helpers/common';
import { getSolutions } from './solutions';
import { runtimeEnvironmentSelector } from './runtimeEnvironments';
import { isReady } from '../helpers/resourceManager';

export const getAssignments = state => state.assignments;

const getAssignmentResources = state => getAssignments(state).get('resources');
const getParam = (state, id) => id;
const getParams = (state, ...params) => params;

export const getAssignment = createSelector(
  getAssignmentResources,
  assignments => id => assignments.get(id)
);

export const getExerciseAssignments = createSelector(
  [getAssignmentResources, (state, exerciseId) => exerciseId],
  (assignments, exerciseId) =>
    assignments.filter(assignment => isReady(assignment) && assignment.getIn(['data', 'exerciseId']) === exerciseId)
);

export const assignmentEnvironmentsSelector = createSelector(
  [getAssignment, runtimeEnvironmentSelector],
  (assignmentSelector, envSelector) => id => {
    const assignment = assignmentSelector(id);
    const envIds = assignment && assignment.getIn(['data', 'runtimeEnvironmentIds']);
    const disabledEnvIds = assignment && assignment.getIn(['data', 'disabledRuntimeEnvironmentIds']);
    return envIds && disabledEnvIds && envSelector
      ? envIds
          .toArray()
          .filter(env => disabledEnvIds.toArray().indexOf(env) < 0)
          .map(envSelector)
      : null;
  }
);

export const getAssigmentSolutions = createSelector(
  [getSolutions, getAssignments, getParam],
  (solutions, assignments, assignmentId) =>
    assignments
      .getIn(['solutions', assignmentId], EMPTY_MAP)
      .toList()
      .flatten()
      .map(id => solutions.get(id))
      .filter(a => a)
);

export const getUserSolutions = createSelector(
  [getSolutions, getAssignments, getParams],
  (solutions, assignments, [userId, assignmentId]) =>
    assignments
      .getIn(['solutions', assignmentId, userId], EMPTY_LIST)
      .map(id => solutions.get(id))
      .filter(a => a)
);

export const isResubmitAllPending = assignmentId =>
  createSelector(
    getAssignment,
    assignmentSelector => {
      const assignment = assignmentSelector(assignmentId);
      return assignment.getIn(['data', 'resubmit-all-pending'], false);
    }
  );
