import LaunchDarkly from 'launchdarkly-node-server-sdk';

// singleton client
let ldClient;

const getClient = async (sdkKey) => {
  if (ldClient && ldClient.initialized()) {
    return ldClient;
  }

  ldClient = LaunchDarkly.init(sdkKey);
  return await ldClient.waitForInitialization();
}

export const evaluateFlag = async (sdkKey, flagKey, defaultValue, customProps = {}) => {
  const client = getClient(sdkKey);
  const context = {
    key: 'ld-github-action-flags',
    custom: customProps,
  }
  return client.variation(flagKey, context, defaultValue);
}
