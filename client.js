import * as core from '@actions/core';
import LaunchDarkly from 'launchdarkly-node-server-sdk';

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

  async evaluateFlag(flagKey, defaultValue, ctx) {
    const timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(reject, 10000);
    });

    try {
      await Promise.race([timeoutPromise, this.client.waitForInitialization()]).then(() => {
        // Both resolve, but promise2 is faster
      });
    } catch (error) {
      console.error(error);
      core.setFailed('Failed to initialize SDK.');
    }

    core.debug(`Evaluating flag ${flagKey}`);
    core.debug(`with context ${JSON.stringify(ctx)}`);
    const result = await this.client.variation(flagKey, ctx, defaultValue);
    core.debug(`Flag ${flagKey} is ${JSON.stringify(result)}`);

    return result;
  }

  async evaluateFlags(flagKeys = [], customProps = {}) {
    const promises = flagKeys.map((item) => {
      // const splitFlagKey = item.split(',');
      // const flagKey = splitFlagKey[0];
      // const defaultValue = splitFlagKey[1] ? splitFlagKey[1] : null;
      this.evaluateFlag(item, null, customProps);
    });

    const flags = {};
    try {
      const results = await Promise.all(promises);
      for (let i = 0; i < results.length; i++) {
        flags[flagKeys[i]] = results[i];
      }
    } catch (error) {
      console.error(error);
      core.setFailed('Failed to evaluate flags');
    }

    return flags;
  }
}
