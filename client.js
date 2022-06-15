import * as core from '@actions/core';
import LaunchDarkly from 'launchdarkly-node-server-sdk';

export default class LDClient {
  constructor(sdkKey, options = {}, userKey) {
    this.client = LaunchDarkly.init(sdkKey, options);
    this.userKey = userKey;
  }

  close() {
    this.client.close();
  }

  async flush() {
    this.client.flush();
  }

  async evaluateFlag(flagKey, defaultValue, customProps = {}) {
    await this.client.waitForInitialization();
    const context = { key: this.userKey, custom: customProps };

    core.debug(`Evaluating flag ${flagKey}`);
    const result = await this.client.variation(flagKey, context, defaultValue);
    core.debug(`Flag ${flagKey} is ${result}`);

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
