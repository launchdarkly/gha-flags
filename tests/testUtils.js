import * as action from '../src/action';

const makeEnv = (envs = {}) =>
  Object.keys(envs).reduce((result, envName) => {
    result[`INPUT_${envName.toUpperCase()}`] = String(envs[envName]);
    return result;
  }, {});

const buildDefaultEnv = makeEnv({
  'sdk-key': 'sdk-xxxxxxxxx',
  flags: 'key-1\nkey-2',
  'context-key': '',
  'send-events': 'false',
  offline: 'false',
  'base-uri': '',
  'events-uri': '',
  'stream-uri': '',
  'proxy-auth': '',
  'proxy-host': '',
  'proxy-port': '',
  'proxy-scheme': '',
});

export const runAction = async (envs = {}) => {
  // preserve current env to avoid env pollution
  const savedEnvironment = process.env;
  process.env = { ...buildDefaultEnv, ...makeEnv(envs) };

  await action.run();

  // restore environment
  process.env = { ...savedEnvironment };
};
