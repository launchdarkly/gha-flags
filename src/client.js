import * as core from '@actions/core';
import * as LaunchDarkly from '@launchdarkly/node-server-sdk';

export default class LDClient {
  constructor(sdkKey, options = {}) {
    core.debug(`Client options: ${JSON.stringify(options)}`);
    this.client = LaunchDarkly.init(sdkKey, options);
  }

  close() {
    this.client.close();
  }

  async flush() {
    await this.client.flush();
  }

  async evaluateFlag(flagKey, ctx, defaultValue) {
    core.debug(`Evaluating flag ${flagKey}`);
    core.debug(`with context ${JSON.stringify(ctx)}`);
    try {
      await this.client.waitForInitialization({ timeout: 5 });
      const result = await this.client.variation(flagKey, ctx, defaultValue);
      core.debug(`Flag ${flagKey} is ${JSON.stringify(result)}`);

      return result;
    } catch (error) {
      console.error(error);
      core.error('Failed to initialize SDK.');
    }

    return undefined;
  }

  async evaluateFlags(flagInputs = [], customProps = {}) {
    const parsedFlags = getParsedFlags(flagInputs);

    const promises = parsedFlags.map((flag) => {
      core.debug(flag);
      return this.evaluateFlag(flag[0], customProps, flag[1]);
    });

    const flags = {};
    try {
      const results = await Promise.all(promises);
      for (let i = 0; i < results.length; i++) {
        if (results[i] === undefined) {
          return undefined;
        }

        flags[parsedFlags[i][0]] = results[i];
      }
    } catch (error) {
      console.error(error);
      core.error('Failed to evaluate flags');
      return undefined;
    }

    return flags;
  }
}

function getParsedFlags(flagInput) {
  const parsedFlags = [];
  flagInput.map((item) => {
    const splitFlagKey = item.split(',').map((v) => v.trim());
    const flagKey = splitFlagKey[0];
    const defaultValue = splitFlagKey[1] ? splitFlagKey[1] : null;
    parsedFlags.push([flagKey, defaultValue]);
  });

  return parsedFlags;
}
