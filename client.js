import * as core from '@actions/core';
import LaunchDarkly from 'launchdarkly-node-server-sdk';

export default class LDClient {
  constructor(sdkKey, options = {}, userKey) {
    core.debug(`Client options: ${JSON.stringify(options)}`);
    this.client = LaunchDarkly.init(sdkKey, options);
    this.userKey = userKey;
  }

  close() {
    this.client.close();
  }

  async flush() {
    this.client.flush();
  }

  async evaluateFlag(flagKey, defaultValue, ctx) {
    await this.client.waitForInitialization();

    core.debug(`Evaluating flag ${flagKey}`);
    core.debug(`with context ${JSON.stringify(ctx)}`);
    const result = await this.client.variation(flagKey, ctx, defaultValue);
    core.debug(`Flag ${flagKey} is ${JSON.stringify(result)}`);

    return result;
  }

  async evaluateFlags(flagKeys = [], customProps = {}) {
    const promises = flagKeys.map((flagKey) => this.evaluateFlag(flagKey, null, customProps));

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
