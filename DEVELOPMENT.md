# Development

## Getting started

1. Install and configure [pre-commit](https://pre-commit.com/) for the repository
1. Install Node 20
1. Install dependencies
   ```
   npm i
   ```
1. Install [nektos/act](https://github.com/nektos/act) for testing
1. Copy a valid environment SDK key for testing locally
1. Configure the required flags as detailed below.

### Flag configurations

In order to evaluate the test workflows successfully, your test environment must have the following flag configurations.

**test-number-flag** is a numeric flag that evaluates to `1` when on and `0` when off. No targeting rules should be provided.

**test-boolean-flag** is a boolean flag that evaluates to `true` when on and `false` when off. No targeting rules should be provided.

**test-json-flag** is a JSON flag that evaluates to `{"pet": "cat"}` when on and `{"pet": "dog"}` when off. No targeting rules should be provided.

**test-string-flag** is a string flag that should evaluate to "fallthrough" when on and "off" when "off". It should also have the below targeting rules:

1. A context kind of `GithubCustomAttributes` and a key of `context-key` should return `custom`.
1. A context kind of `GithubCustomAttributes` and a group of `beta` should return `custom`.
1. A context kind of `GitHubRunner` and a `RUNNER_TAG` of `GitHub Actions` should return `runner`.
1. A context kind of `GitHub` with any `GITHUB_ACTOR` set should return `github`.

## Build instructions

The action is built using [@vercel/ncc](https://github.com/vercel/ncc).

```
npm run build
```

## Testing locally

Use [nektos/act](https://github.com/nektos/act) to run actions locally. The `RUNNER_TRACKING_ID` environment variable will not be available automatically, preventing `GitHubRunner` related tests from passing. We must set it manually as shown below.

```
act --env RUNNER_TRACKING_ID=1 -s SDK_KEY=<SDK-KEY>
```

_Read more: [Example commands](https://github.com/nektos/act#example-commands)_

## Publishing a release

Follow instructions to [publish a release to the GitHub Marketplace](https://docs.github.com/en/actions/creating-actions/publishing-actions-in-github-marketplace#publishing-an-action).

**Publishing** is a manual step even if automation is used to create a release.

### Versioning

_Read more: [Semantic versioning](https://semver.org/)_
