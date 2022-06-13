import LaunchDarkly from 'launchdarkly-node-server-sdk';

// singleton client
let ldClient;

const getClient = (sdkKey) => {
  if (ldClient !== undefined) {
    return ldClient;
  }

  ldClient = LaunchDarkly.init(sdkKey);
  return ldClient;
};

export const evaluateFlag = async (sdkKey, flagKey, defaultValue, customProps = {}) => {
  const client = getClient(sdkKey);
  await client.waitForInitialization();
  const context = {
    key: 'ld-github-action-flags',
    custom: customProps,
  };
  return client.variation(flagKey, context, null);
};
