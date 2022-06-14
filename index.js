import * as core from '@actions/core';
import LDClient from './client';
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
  const userKey = core.getInput('user-key');

  core.info(baseUri);
  const validationErrors = validate({ sdkKey, flagKeys });
  if (validationErrors.length > 0) {
    core.setFailed(`Invalid arguments: ${validationErrors.join(', ')}`);
    return;
  }
  core.endGroup();

  // build a context
  core.startGroup('Extracting inputs');
  const inputPrefix = 'INPUT_';
  var ctx = {};
  Object.keys(process.env)
    .filter(function (key) {
      return key.startsWith(inputPrefix);
    })
    .forEach(function (key) {
      var shortName = key.substring(inputPrefix.length);
      ctx[shortName] = process.env[key];
      core.debug(shortName + '="' + process.env[key]) + '"';
    });
  core.endGroup();

  // evaluate flags
  const client = new LDClient(sdkKey, { baseUri, eventsUri, streamUri }, userKey);
  core.startGroup('Evaluating flags');
  const flags = await client.evaluateFlags(flagKeys, ctx);
  client.close();
  core.endGroup();

  // set output
  for (const flagKey in flags) {
    core.setOutput(flagKey, flags[flagKey]);
  }

  return;
};

main();
