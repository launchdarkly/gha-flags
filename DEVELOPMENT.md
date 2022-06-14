# Development

## Getting started

1. Install and configure [pre-commit](https://pre-commit.com/) for the repository.
2. Install Node 16
3. Install dependencies
   ```
   npm i
   ```
4. Install [nektos/act](https://github.com/nektos/act) for testing
5. Copy a valid environment SDK key for testing locally

## Build instructions

The action is built using [@vercel/ncc](https://github.com/vercel/ncc).

```
npm run build
```

## Testing locally

Use [nektos/act](https://github.com/nektos/act) to run actions locally.

```
act -s SDK_KEY=<SDK-KEY>
```

_Read more: [Example commands](https://github.com/nektos/act#example-commands)_

## Publishing a release

Follow instructions to [publish a release to the GitHub Marketplace](https://docs.github.com/en/actions/creating-actions/publishing-actions-in-github-marketplace#publishing-an-action).

**Publishing** is a manual step even if automation is used to create a release.

### Versioning

_Read more: [Semantic versioning](https://semver.org/)_
