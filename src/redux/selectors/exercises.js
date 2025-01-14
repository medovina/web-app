import { createSelector, defaultMemoize } from 'reselect';
import { EMPTY_ARRAY, EMPTY_LIST } from '../../helpers/common';
import { isReady } from '../helpers/resourceManager';
import { getAssignment } from './assignments';

const getParam = (state, id) => id;

const getExercises = state => state.exercises;
const getResources = exercises => exercises && exercises.get('resources');
const getGroupExercises = state => state.groupExercises;
const getRuntimeEnvironments = exercise => exercise && exercise.getIn(['data', 'runtimeEnvironments'], EMPTY_LIST);

export const exercisesSelector = createSelector(
  getExercises,
  getResources
);
export const exerciseSelector = exerciseId =>
  createSelector(
    exercisesSelector,
    exercises => exercises && exercises.get(exerciseId)
  );

export const exerciseForkedFromSelector = defaultMemoize(exerciseId =>
  createSelector(
    exercisesSelector,
    exercises => {
      const fokredId = exercises && exercises.getIn([exerciseId, 'data', 'forkedFrom']);
      return fokredId && exercises.get(fokredId);
    }
  )
);

export const getExercise = id =>
  createSelector(
    getExercises,
    exercises => exercises && exercises.getIn(['resources', id])
  );

export const getExerciseOfAssignmentJS = createSelector(
  [getExercises, getAssignment],
  (exercises, assignmentSelector) => assignmentId => {
    const assignment = assignmentSelector(assignmentId);
    const id = isReady(assignment) && assignment.getIn(['data', 'exerciseId']);
    const exercise = id && exercises.getIn(['resources', id]);
    return isReady(exercise) && exercise.get('data') ? exercise.get('data').toJS() : null;
  }
);

export const getExerciseSelector = createSelector(
  getExercises,
  exercises => id => exercises.getIn(['resources', id])
);

export const getExerciseRuntimeEnvironments = defaultMemoize(id =>
  createSelector(
    getExercise(id),
    getRuntimeEnvironments
  )
);

export const getExerciseRuntimeEnvironmentsSelector = createSelector(
  getExerciseSelector,
  exerciseSelector => id => getRuntimeEnvironments(exerciseSelector(id))
);

export const getFork = (id, forkId) =>
  createSelector(
    getExercise(id),
    exercise => exercise.getIn(['data', 'forks', forkId])
  );

export const getExercisesByIdsSelector = ids =>
  createSelector(
    exercisesSelector,
    exercises =>
      exercises && exercises.filter(isReady).filter(exercise => ids.indexOf(exercise.getIn(['data', 'id'])) >= 0)
  );

export const getExercisesForGroup = createSelector(
  [exercisesSelector, getGroupExercises, getParam],
  (exercises, groupExercises, groupId) => {
    const groupExIds = groupExercises[groupId] ? groupExercises[groupId] : EMPTY_ARRAY;
    return (
      exercises && exercises.filter(isReady).filter(exercise => groupExIds.indexOf(exercise.getIn(['data', 'id'])) >= 0)
    );
  }
);

export const getExerciseAttachingGroupId = defaultMemoize(id =>
  createSelector(
    getExercise(id),
    exercise => exercise && exercise.getIn(['data', 'attachingGroupId'], null)
  )
);

export const getExerciseDetachingGroupId = defaultMemoize(id =>
  createSelector(
    getExercise(id),
    exercise => exercise && exercise.getIn(['data', 'detachingGroupId'], null)
  )
);
