import yaml from 'js-yaml';
import {
  endpointDisguisedAsIdFactory,
  encodeTestId,
  encodeEnvironmentId
} from '../redux/modules/simpleLimits';

export const getEnvInitValues = environmentConfigs => {
  let res = {};
  for (const env of environmentConfigs) {
    res[env.runtimeEnvironmentId] = true;
  }
  return res;
};

export const transformAndSendEnvValues = (
  formData,
  environments,
  editEnvironmentConfigs,
  reloadConfigAndLimits
) => {
  let res = [];
  for (const env in formData) {
    if (formData[env] !== true && formData[env] !== 'true') {
      continue;
    }
    let envObj = { runtimeEnvironmentId: env };
    const currentFullEnv = environments.find(e => e.id === env);
    envObj.variablesTable = currentFullEnv.defaultVariables;
    res.push(envObj);
  }
  return editEnvironmentConfigs({ environmentConfigs: res }).then(
    reloadConfigAndLimits
  );
};

export const getTestsInitValues = (exerciseTests, scoreConfig, locale) => {
  const jsonScoreConfig = yaml.safeLoad(scoreConfig);
  const testWeights = jsonScoreConfig.testWeights || {};
  const sortedTests = exerciseTests.sort((a, b) =>
    a.name.localeCompare(b.name, locale)
  );

  let res = [];
  let allWeightsSame = true;
  let lastWeight = null;
  for (const test of sortedTests) {
    const testWeight = testWeights[test.name] || 100;
    if (lastWeight !== null && testWeight !== lastWeight) {
      allWeightsSame = false;
    }
    lastWeight = testWeight;
    res.push({ id: test.id, name: test.name, weight: String(testWeight) });
  }

  return { isUniform: allWeightsSame, tests: res };
};

export const transformAndSendTestsValues = (
  formData,
  editExerciseTests,
  editExerciseScoreConfig
) => {
  const uniformScore =
    formData.isUniform === true || formData.isUniform === 'true';
  let scoreConfigData = { testWeights: {} };
  let testsData = [];

  for (const test of formData.tests) {
    const testWeight = uniformScore ? 100 : Number(test.weight);
    scoreConfigData.testWeights[test.name] = testWeight;

    testsData.push(
      test.id ? { id: test.id, name: test.name } : { name: test.name }
    );
  }

  return Promise.all([
    editExerciseTests({ tests: testsData }),
    editExerciseScoreConfig({ scoreConfig: yaml.safeDump(scoreConfigData) })
  ]);
};

export const getSimpleConfigInitValues = (config, tests, locale) => {
  const confTests =
    tests && config[0] && config[0].tests
      ? config[0].tests.sort((a, b) => {
          const aName = tests.find(test => test.id === a.name).name;
          const bName = tests.find(test => test.id === b.name).name;
          return aName.localeCompare(bName, locale);
        })
      : [];

  let res = [];
  for (let test of confTests) {
    let testObj = { name: test.name };
    const variables = test.pipelines.reduce(
      (acc, pipeline) => acc.concat(pipeline.variables),
      []
    );

    const inputFiles = variables.find(
      variable => variable.name === 'input-files'
    );
    const actualInputs = variables.find(
      variable => variable.name === 'actual-inputs'
    );
    if (inputFiles) {
      testObj.inputFiles = inputFiles.value
        ? inputFiles.value.map((value, i) => ({
            first: value,
            second:
              actualInputs && actualInputs.value && actualInputs.value[i]
                ? actualInputs.value[i]
                : ''
          }))
        : [];
    }

    const expectedOutput = variables.find(
      variable => variable.name === 'expected-output'
    );
    if (expectedOutput) {
      testObj.expectedOutput = expectedOutput.value;
    }

    const runArgs = variables.find(variable => variable.name === 'run-args');
    if (runArgs) {
      testObj.runArgs = runArgs.value;
    }

    const actualOutput = variables.find(
      variable => variable.name === 'actual-output'
    );
    if (actualOutput) {
      testObj.useOutFile = true;
      testObj.outputFile = actualOutput.value;
    } else {
      testObj.outputFile = '';
    }

    const stdinFile = variables.find(
      variable => variable.name === 'stdin-file'
    );
    if (stdinFile) {
      testObj.inputStdin = stdinFile.value;
    }

    const standardJudge = variables.find(
      variable => variable.name === 'judge-type'
    );
    const customJudge = variables.find(
      variable => variable.name === 'custom-judge'
    );

    testObj.useCustomJudge = false;
    if (customJudge) {
      testObj.customJudgeBinary = customJudge.value;
      testObj.useCustomJudge = customJudge.value.trim() !== '';
    }
    if (!testObj.useCustomJudge) {
      testObj.judgeBinary =
        standardJudge && standardJudge.value
          ? standardJudge.value
          : 'recodex-judge-normal';
    }

    const judgeArgs = variables.find(
      variable => variable.name === 'judge-args'
    );
    if (judgeArgs) {
      testObj.judgeArgs = judgeArgs.value;
    }

    res.push(testObj);
  }

  // fill new tests with default judge
  for (let i = confTests.length; i < tests.length; ++i) {
    res.push({ judgeBinary: 'recodex-judge-normal' });
  }

  return { config: res };
};

export const transformAndSendConfigValues = (
  formData,
  pipelines,
  environments,
  sortedTests,
  setConfig
) => {
  let testVars = [];
  for (let testIndex = 0; testIndex < sortedTests.length; ++testIndex) {
    const test = formData.config[testIndex];
    const testName = sortedTests[testIndex].id;
    let variables = [];

    variables.push({
      name: 'custom-judge',
      type: 'remote-file',
      value: test.useCustomJudge ? test.customJudgeBinary : ''
    });
    variables.push({
      name: 'expected-output',
      type: 'remote-file',
      value: test.expectedOutput
    });
    variables.push({
      name: 'judge-type',
      type: 'string',
      value: test.judgeBinary
    });
    variables.push({
      name: 'stdin-file',
      type: 'remote-file',
      value: test.inputStdin
    });
    variables.push({
      name: 'judge-args',
      type: 'string[]',
      value: test.judgeArgs
    });
    variables.push({
      name: 'run-args',
      type: 'string[]',
      value: test.runArgs
    });
    if (test.useOutFile) {
      variables.push({
        name: 'actual-output',
        type: 'file[]',
        value: test.outputFile
      });
    }

    let inputFiles = [];
    let renamedNames = [];
    const inFilesArr =
      test.inputFiles && Array.isArray(test.inputFiles) ? test.inputFiles : [];
    for (const item of inFilesArr) {
      inputFiles.push(item.first);
      renamedNames.push(item.second);
    }
    variables.push({
      name: 'input-files',
      type: 'remote-file[]',
      value: inputFiles
    });
    variables.push({
      name: 'actual-inputs',
      type: 'file[]',
      value: renamedNames
    });

    testVars.push({
      name: testName,
      variables: variables,
      producesFiles: test.useOutFile
    });
  }

  let envs = [];
  for (const environment of environments) {
    const envId = environment.runtimeEnvironmentId;
    const envPipelines = pipelines.filter(
      pipeline => pipeline.runtimeEnvironmentIds.indexOf(envId) >= 0
    );

    let tests = [];
    for (const testVar of testVars) {
      const compilationPipelineId = envPipelines.filter(
        pipeline => pipeline.parameters.isCompilationPipeline
      )[0].id;
      const executionPipelineId = envPipelines.filter(
        pipeline =>
          pipeline.parameters.isExecutionPipeline &&
          (testVar.producesFiles
            ? pipeline.parameters.producesFiles
            : pipeline.parameters.producesStdout)
      )[0].id;
      tests.push({
        name: testVar.name,
        pipelines: [
          {
            name: compilationPipelineId,
            variables: []
          },
          {
            name: executionPipelineId,
            variables: testVar.variables
          }
        ]
      });
    }
    envs.push({
      name: envId,
      tests: tests
    });
  }

  return setConfig({ config: envs });
};

/**
 * Assemble data from all simpleLimits environments into one table.
 * Also ensures proper encoding for environment IDs and test names, which are used as keys.
 */
export const getLimitsInitValues = (
  limits,
  tests,
  environments,
  exerciseId
) => {
  let res = {};

  tests.forEach(test => {
    const testEnc = encodeTestId(test.id);
    res[testEnc] = {};
    environments.forEach(environment => {
      const envId = encodeEnvironmentId(environment.id);
      let lim = limits.getIn([
        endpointDisguisedAsIdFactory({
          exerciseId,
          runtimeEnvironmentId: environment.id
        }),
        'data',
        String(test.id)
      ]);
      if (lim) {
        lim = lim.toJS();
      }

      res[testEnc][envId] = {
        memory: lim ? String(lim.memory) : '0',
        'wall-time': lim ? String(lim['wall-time']) : '0'
      };
    });
  });

  return { limits: res };
};

/**
 * Transform form data and pass them to dispatching function.
 * The data have to be re-assembled, since they use different format and keys are encoded.
 * The dispatching function is invoked for every environment and all promise is returned.
 */
export const transformAndSendLimitsValues = (
  formData,
  tests,
  runtimeEnvironments,
  editEnvironmentSimpleLimits
) =>
  Promise.all(
    runtimeEnvironments.map(environment => {
      const envId = encodeEnvironmentId(environment.id);
      const data = {
        limits: tests.reduce((acc, test) => {
          acc[test.id] = formData.limits[encodeTestId(test.id)][envId];
          return acc;
        }, {})
      };
      return editEnvironmentSimpleLimits(environment.id, data);
    })
  );
