import * as core from '@actions/core';
import { closeClient, evaluateFlags, initClient } from './client';
import { validate } from './configuration';

const main = async () => {
  // parse and validate args
  core.startGroup('Validating arguments');
  const sdkKey = core.getInput('sdk-key');
  core.setSecret(sdkKey);
  const flagKeys = core.getMultilineInput('flag-keys');
  const baseUri = core.getInput('base-uri');
  const eventsUri = core.getInput('events-uri');
  const streamUri = core.getInput('stream-uri');
  core.info(baseUri);
  const validationErrors = validate({ sdkKey, flagKeys });
  if (validationErrors.length > 0) {
    core.setFailed(`Invalid arguments: ${validationErrors.join(', ')}`);
    return;
  }
  core.endGroup();

  // evaluate flags
  core.startGroup('Evaluating flags');
  initClient(sdkKey, { baseUri, eventsUri, streamUri });
  const flags = await evaluateFlags(flagKeys);
  closeClient();
  core.endGroup();

  // set output
  for (const flagKey in flags) {
    core.setOutput(flagKey, flags[flagKey]);
  }

  return;
};

main();
