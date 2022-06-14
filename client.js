import * as core from '@actions/core';
import LaunchDarkly from 'launchdarkly-node-server-sdk';

// singleton client
let ldClient;

export const initClient = (sdkKey, options = {}) => {
  if (ldClient !== undefined) {
    return;
  }

  ldClient = LaunchDarkly.init(sdkKey, options);
};

export const closeClient = () => {
  if (ldClient !== undefined) {
    ldClient.close();
  }
};

const getClient = () => {
  return ldClient;
};

const evaluateFlag = async (flagKey, defaultValue, customProps = {}) => {
  const client = getClient();
  await client.waitForInitialization();

  const context = {
    key: 'ld-github-action-flags',
    custom: customProps,
  };
  return client.variation(flagKey, context, null);
};

export const evaluateFlags = async (flagKeys, customProps = {}) => {
  const flags = {};
  const promises = [];
  for (const flagKey of flagKeys) {
    core.debug(`Evaluating flag ${flagKey}`);
    promises.push(evaluateFlag(flagKey, null, customProps));
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

  return flags;
};
