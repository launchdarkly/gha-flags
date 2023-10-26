import * as core from '@actions/core';

export const validate = (args) => {
  const errors = [];
  if (!args.sdkKey) {
    core.error('SDK key is required');
    errors.push('sdk-key');
  } else if (!args.sdkKey.startsWith('sdk-')) {
    core.error('SDK key must start with "sdk-"');
    errors.push('sdk-key');
  }

  if (!Array.isArray(args.flags) || !args.flags.length) {
    core.error('At least one flag key is required');
    errors.push('flags');
  }

  return errors;
};
