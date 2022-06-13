import { evaluateFlag } from "./client";
import { validate } from "./configuration";
import core from '@actions/core';

const main = async () => {
  // parse and validate args
  core.startGroup('Validating arguments');
  const sdkKey = core.getInput('sdk-key');
  core.setSecret(sdkKey);
  const flagKeys = core.getMultilineInput('flag-keys');
  const validationErrors = validate({ sdkKey, flagKeys });

  if (validationErrors) {
    core.setFailed('Invalid arguments: ' + validationErrors.join(', '));
    return;
  }
  core.endGroup();

  // evaluate flags
  // const result = await evaluateFlag('sdkKey', 'flagKey', 'defaultValue', {})

  // set output
};

main();
