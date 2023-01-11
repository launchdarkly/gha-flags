import * as core from '@actions/core';
import LaunchDarkly from 'launchdarkly-node-server-sdk';

export default class LDClient {
  constructor(sdkKey, options = {}) {
    core.debug(`Client options: ${JSON.stringify(options)}`);
    this.client = LaunchDarkly.init(sdkKey, options);
    this.options = options;
  }

  close() {
    this.client.close();
  }

  async flush() {
    this.client.flush();
  }

  async evaluateFlag(flagKey, ctx, defaultValue) {
    const timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(reject, 5000);
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
    }
  }

  async evaluateFlags(flagKeys = [], customProps = {}) {
    const promises = flagKeys.map((item) => {
      const splitFlagKey = item.split(',');
      const flagKey = splitFlagKey[0];
      const defaultValue = splitFlagKey[1] ? splitFlagKey[1].trim() : null;
      return this.evaluateFlag(flagKey, customProps, defaultValue);
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
