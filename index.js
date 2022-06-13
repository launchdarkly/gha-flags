import * as core from '@actions/core';
import { closeClient, evaluateFlag } from './client';
import { validate } from './configuration';

const main = async () => {
  // parse and validate args
  core.startGroup('Validating arguments');
  const sdkKey = core.getInput('sdk-key');
  core.setSecret(sdkKey);
  const flagKeys = core.getMultilineInput('flag-keys');
  const validationErrors = validate({ sdkKey, flagKeys });
  if (validationErrors.length > 0) {
    core.setFailed(`Invalid arguments: ${validationErrors.join(', ')}`);
    return;
  }
  core.endGroup();

  // evaluate flags
  core.startGroup('Evaluating flags');
  const flags = {};
  const promises = [];
  for (const flagKey of flagKeys) {
    core.debug(`Evaluating flag ${flagKey}`);
    promises.push(evaluateFlag(sdkKey, flagKey));
  }
  try {
    const results = await Promise.all(promises);
    for (let i = 0; i < results.length; i++) {
      core.debug(`Flag ${flagKeys[i]} is ${results[i]}`);
      flags[flagKeys[i]] = results[i];
    }
  } catch (error) {
    console.error(error);
    core.setFailed('Failed to evaluate flags');
  }
  closeClient();
  core.endGroup();

  // set output
  core.setOutput('flags', flags);
};

main();
