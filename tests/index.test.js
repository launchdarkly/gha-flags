import { describe, test, expect, vi, afterEach } from 'vitest';
import * as LaunchDarkly from '@launchdarkly/node-server-sdk';

vi.spyOn(LaunchDarkly, 'init').mockReturnValue({
  variation: vi.fn().mockResolvedValue(false),
  waitForInitialization: vi.fn().mockResolvedValue(),
  flush: vi.fn(),
  close: vi.fn(),
});

vi.mock('@actions/core', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    error: vi.fn(),
    setOutput: vi.fn(),
    setSecret: vi.fn(),
  };
});

import { runAction } from './testUtils';
import * as core from '@actions/core';

describe('Action', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('succeeds when all required inputs are provided', async () => {
    const exitCode = await runAction({ 'sdk-key': 'sdk-xxxx', flags: 'flag-key' });
    expect(core.error).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);
  });

  test('fails when required inputs are not provided', async () => {
    const exitCode = await runAction({ 'sdk-key': '', flags: '' });
    expect(core.error).toHaveBeenCalledWith('Invalid arguments: sdk-key, flags');
    expect(exitCode).toBe(1);
  });

  test('input arguments are correctly passed to LaunchDarkly client', async () => {
    const exitCode = await runAction({
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
    expect(exitCode).toBe(0);
    expect(LaunchDarkly.init).toHaveBeenCalledWith(
      'sdk-xxxx',
      expect.objectContaining({
        baseUri: 'https://base.uri',
        eventsUri: 'https://events.uri',
        sendEvents: false,
        offline: false,
        streamUri: 'https://stream.uri',
        proxyOptions: {
          auth: 'username:password',
          host: 'https://proxy.host',
          port: '9999',
          scheme: 'https',
        },
      }),
    );
  });

  test('successfully executes action and returns the flags', async () => {
    const exitCode = await runAction({
      'sdk-key': 'sdk-xxxx',
      flags: 'flag-key-1\nflag-key-2\nflag-key-3',
    });
    expect(exitCode).toBe(0);

    expect(core.setOutput).toHaveBeenNthCalledWith(1, 'flag-key-1', false);
    expect(core.setOutput).toHaveBeenNthCalledWith(2, 'flag-key-2', false);
    expect(core.setOutput).toHaveBeenNthCalledWith(3, 'flag-key-3', false);
  });

  test('flush() completes before close() is called', async () => {
    let flushResolved = false;
    const mockFlush = vi.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          flushResolved = true;
          resolve();
        }, 10);
      });
    });

    const mockClose = vi.fn().mockImplementation(() => {
      // If flush wasn't awaited, this would be called before flushResolved is true
      expect(flushResolved).toBe(true);
    });

    vi.spyOn(LaunchDarkly, 'init').mockReturnValue({
      variation: vi.fn().mockResolvedValue(false),
      waitForInitialization: vi.fn().mockResolvedValue(),
      flush: mockFlush,
      close: mockClose,
    });

    const exitCode = await runAction({
      'sdk-key': 'sdk-xxxx',
      flags: 'flag-key',
    });
    expect(exitCode).toBe(0);
    expect(mockFlush).toHaveBeenCalledOnce();
    expect(mockClose).toHaveBeenCalledOnce();
    expect(flushResolved).toBe(true);
  });
});
