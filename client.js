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
    this.client.flush();
  }

  async evaluateFlag(flagKey, ctx, defaultValue) {
    var timeout = null;
    const timeoutPromise = new Promise((resolve, reject) => {
      timeout = setTimeout(reject, 5000);
    });
    core.debug(`Evaluating flag ${flagKey}`);
    core.debug(`with context ${JSON.stringify(ctx)}`);
    try {
      // Only await initialization if we're not in offline mode.
      await Promise.race([timeoutPromise, this.client.waitForInitialization()]);
      const result = await this.client.variation(flagKey, ctx, defaultValue);
      core.debug(`Flag ${flagKey} is ${JSON.stringify(result)}`);

      return result;
    } catch (error) {
      console.error(error);
      core.setFailed('Failed to initialize SDK.');
    } finally {
      clearTimeout(timeout);
    }
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
        flags[parsedFlags[i][0]] = results[i];
      }
    } catch (error) {
      console.error(error);
      core.setFailed('Failed to evaluate flags');
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
