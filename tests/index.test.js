import * as LaunchDarkly from '@launchdarkly/node-server-sdk';

initSpy = jest.spyOn(LaunchDarkly, 'init').mockReturnValue({
  variation: jest.fn().mockResolvedValue(false),
  waitForInitialization: jest.fn().mockResolvedValue(),
  flush: jest.fn(),
  close: jest.fn(),
});

import { runAction } from './testUtils';
import * as core from '@actions/core';

describe('Action', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('succeeds when all required inputs are provided', async () => {
    const errorSpy = jest.spyOn(core, 'setFailed');
    await runAction({ 'sdk-key': 'sdk-xxxx', flags: 'flag-key' });
    expect(errorSpy).not.toHaveBeenCalled();
  });

  test('fails when required inputs are not provided', async () => {
    const errorSpy = jest.spyOn(core, 'setFailed');
    await runAction({ 'sdk-key': '', flags: '' });
    expect(errorSpy).toHaveBeenCalledWith('Invalid arguments: sdk-key, flags');
  });

  test('input arguments are correctly passed to LaunchDarkly client', async () => {
    await runAction({
      'sdk-key': 'sdk-xxxx',
      flags: 'flag-key',
      'context-key': 'context-key',
      'send-events': 'false',
      offline: 'false',
      'base-uri': 'https://base.uri',
      'events-uri': 'https://events.uri',
      'stream-uri': 'https://stream.uri',
      'proxy-auth': 'username:password',
      'proxy-host': 'https://proxy.host',
      'proxy-port': '9999',
      'proxy-scheme': 'https',
    });
    expect(initSpy).toHaveBeenCalledWith(
      'sdk-xxxx',
      expect.objectContaining({
        baseUri: 'https://base.uri',
        eventsUri: 'https://events.uri',
        sendEvents: false,
        offline: false,
        streamUri: 'https://stream.uri',
        proxyAuth: 'username:password',
        proxyHost: 'https://proxy.host',
        proxyPort: '9999',
        proxyScheme: 'https',
      }),
    );
  });

  test('successfully executes action and returns the flags', async () => {
    const outputSpy = jest.spyOn(core, 'setOutput');
    await runAction({
      'sdk-key': 'sdk-xxxx',
      flags: 'flag-key-1\nflag-key-2\nflag-key-3',
    });

    expect(outputSpy).toHaveBeenNthCalledWith(1, 'flag-key-1', false);
    expect(outputSpy).toHaveBeenNthCalledWith(2, 'flag-key-2', false);
    expect(outputSpy).toHaveBeenNthCalledWith(3, 'flag-key-3', false);
  });
});
