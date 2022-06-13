import * as core from '@actions/core';
import { evaluateFlag } from './client';
import { validate } from './configuration';

const main = async () => {
  // parse and validate args
  core.startGroup('Validating arguments');
  const sdkKey = core.getInput('sdk-key');
  core.setSecret(sdkKey);
  const flagKeys = core.getMultilineInput('flag-keys');
  const validationErrors = validate({ sdkKey, flagKeys });

  if (validationErrors) {
    core.setFailed(`Invalid arguments: ${validationErrors.join(', ')}`);
    return;
  }
  core.endGroup();

  // evaluate flags
  core.startGroup('Evaluating flags');
  const flags = {};
  for (const flagKey of flagKeys) {
    flags[flagKey] = await evaluateFlag(sdkKey, flagKey);
  }
  core.endGroup();

  // set output
  core.setOutput('flags', flags);
};

main();
