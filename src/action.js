import * as core from '@actions/core';
import LDClient from './client';
import { validate } from './configuration';

export const run = async () => {
  // parse and validate args
  core.startGroup('Validating arguments');
  const sdkKey = core.getInput('sdk-key');
  core.setSecret(sdkKey);
  const flags = core.getMultilineInput('flags');
  const contextKey = core.getInput('context-key');
  const sendEvents = core.getBooleanInput('send-events');
  const baseUri = core.getInput('base-uri');
  const eventsUri = core.getInput('events-uri');
  const streamUri = core.getInput('stream-uri');
  const offline = core.getBooleanInput('offline');
  // these will be validated by SDK
  const proxyAuth = core.getInput('proxy-auth');
  const proxyHost = core.getInput('proxy-host');
  const proxyPort = core.getInput('proxy-port');
  const proxyScheme = core.getInput('proxy-scheme');

  const validationErrors = validate({ sdkKey, flags });
  if (validationErrors.length > 0) {
    core.error(`Invalid arguments: ${validationErrors.join(', ')}`);
    return 1;
  }
  core.endGroup();

  // build a context
  core.startGroup('Extracting action context');

  // Setup Runner Context
  // Don't strip RUNNER_ and GITHUB_ env vars so we can avoid naming conflicts
  const runnerKey = 'RUNNER_TRACKING_ID';
  const githubRunnerCtx = process.env[runnerKey]
    ? {
        GithubRunner: createContext(process.env[runnerKey], { prefix: 'RUNNER_', strip: false }, runnerKey),
      }
    : {};

  // Setup Github Context
  const githubKey = 'GITHUB_REPOSITORY';
  const githubCtx = process.env[githubKey]
    ? {
        Github: createContext(
          process.env[githubKey].split('/').pop().trim(),
          { prefix: 'GITHUB_', strip: false },
          githubKey,
        ),
      }
    : {};

  // Setup LaunchDarkly Context
  let context = createContext(contextKey, { prefix: 'LD_', strip: true });
  let ldCtx = { GithubCustomAttributes: context };

  const ctx = {
    kind: 'multi',
    ...githubRunnerCtx,
    ...githubCtx,
    ...ldCtx,
  };

  core.endGroup();

  const options = {
    sendEvents,
    baseUri,
    eventsUri,
    streamUri,
    offline,
    wrapperName: 'github-flag-evaluation',
  };

  if (proxyAuth) {
    options.proxyAuth = proxyAuth;
  }
  if (proxyHost) {
    options.proxyHost = proxyHost;
  }
  if (proxyPort) {
    options.proxyPort = proxyPort;
  }
  if (proxyScheme) {
    options.proxyScheme = proxyScheme;
  }

  // evaluate flags
  const client = new LDClient(sdkKey, options);
  core.startGroup('Evaluating flags');
  const evaledFlags = await client.evaluateFlags(flags, ctx);
  if (evaledFlags === null) {
    return 1;
  }
  await client.flush();
  client.close();
  core.endGroup();

  // set output
  for (const flagKey in evaledFlags) {
    core.setOutput(flagKey, evaledFlags[flagKey]);
  }

  return 0;
};

function createContext(contextKey, filter, ignoreKey = '') {
  const ctx = {};

  Object.keys(process.env)
    .filter((key) => process.env[key] != '')
    .filter((key) => key !== ignoreKey)
    .filter((key) => key.startsWith(filter.prefix))
    .forEach((key) => {
      var k = filter.strip ? key.substring(filter.prefix.length) : key;
      ctx[k] = process.env[key];
      core.debug(k + '="' + process.env[key]) + '"';
    });

  ctx['key'] = contextKey;

  return ctx;
}
