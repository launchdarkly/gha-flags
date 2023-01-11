// mock LD client
jest.mock('launchdarkly-node-server-sdk', () => ({
  init: () => ({
    variation: jest.fn().mockResolvedValue(false),
    waitForInitialization: jest.fn().mockResolvedValue(),
    flush: jest.fn(),
    close: jest.fn(),
  }),
}));

import { runAction } from './testUtils';
import LaunchDarkly from 'launchdarkly-node-server-sdk';
import * as core from '@actions/core';

describe('Action', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('succeeds when all required inputs are provided', async () => {
    const errorSpy = jest.spyOn(core, 'setFailed');
    await runAction({ 'sdk-key': 'sdk-xxxx', 'flag-keys': 'flag-key' });
    expect(errorSpy).not.toHaveBeenCalled();
  });

  test('fails when required inputs are not provided', async () => {
    const errorSpy = jest.spyOn(core, 'setFailed');
    await runAction({ 'sdk-key': '', 'flag-keys': '' });
    expect(errorSpy).toHaveBeenCalledWith('Invalid arguments: sdk-key, flag-keys');
  });

  test('input arguments are correctly passed to LaunchDarkly client', async () => {
    const clientInitSpy = jest.spyOn(LaunchDarkly, 'init');
    await runAction({
      'sdk-key': 'sdk-xxxx',
      'flag-keys': 'flag-key',
      'user-key': 'user-key',
      'send-events': 'false',
      // eslint-disable-next-line prettier/prettier
      'offline': 'false',
      'base-uri': 'https://base.uri',
      'events-uri': 'https://events.uri',
      'stream-uri': 'https://stream.uri',
      'proxy-auth': 'username:password',
      'proxy-host': 'https://proxy.host',
      'proxy-port': '9999',
      'proxy-scheme': 'https',
    });
    expect(clientInitSpy).toHaveBeenCalledWith(
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
      'flag-keys': 'flag-key-1\nflag-key-2\nflag-key-3',
    });

    expect(outputSpy).toHaveBeenNthCalledWith(1, 'flag-key-1', false);
    expect(outputSpy).toHaveBeenNthCalledWith(2, 'flag-key-2', false);
    expect(outputSpy).toHaveBeenNthCalledWith(3, 'flag-key-3', false);
  });
});
