# Changelog

All notable changes to this GitHub Action will be documented in this file. This project adheres to [Semantic Versioning](http://semver.org).

## [1.0.4](https://github.com/launchdarkly/gha-flags/compare/v1.0.3...v1.0.4) (2026-03-18)


### Bug Fixes

* Await flush to ensure events are sent on shutdown ([#81](https://github.com/launchdarkly/gha-flags/issues/81)) ([e048a44](https://github.com/launchdarkly/gha-flags/commit/e048a441849acd8b168dd7b3d6acf45d9555fe33))

## [1.0.3](https://github.com/launchdarkly/gha-flags/compare/v1.0.2...v1.0.3) (2026-03-13)


### Bug Fixes

* Bump to github runner to node 24 ([#76](https://github.com/launchdarkly/gha-flags/issues/76)) ([03e0c4a](https://github.com/launchdarkly/gha-flags/commit/03e0c4a57ef439a7fb311ff37a5fc3e225d506bc)), closes [#75](https://github.com/launchdarkly/gha-flags/issues/75)

## [1.0.2](https://github.com/launchdarkly/gha-flags/compare/v1.0.1...v1.0.2) (2025-11-20)


### Bug Fixes

* Nest proxy options appropriately ([#69](https://github.com/launchdarkly/gha-flags/issues/69)) ([c448395](https://github.com/launchdarkly/gha-flags/commit/c448395516d37afe7dd244dc4233489eaba89b3f))
* Replace process.exitCode usage with process.exit ([#71](https://github.com/launchdarkly/gha-flags/issues/71)) ([5b05c24](https://github.com/launchdarkly/gha-flags/commit/5b05c2450990f98eff1a13c4717f7b07d2093110))

## [1.0.1](https://github.com/launchdarkly/gha-flags/compare/v1.0.0...v1.0.1) (2023-11-01)


### Bug Fixes

* Remove beta designation ([#60](https://github.com/launchdarkly/gha-flags/issues/60)) ([63f0a03](https://github.com/launchdarkly/gha-flags/commit/63f0a0304f15e255c2be1f25878a94403b8e0edb))

## [1.0.0](https://github.com/launchdarkly/gha-flags/compare/v0.0.1...v1.0.0) (2023-11-01)


### Features

* Remove `Date.now()` fallback for custom context key ([#55](https://github.com/launchdarkly/gha-flags/issues/55)) ([aa01598](https://github.com/launchdarkly/gha-flags/commit/aa01598f7188a11ccd9e782f3c70d76272262c28))
* Update user references with context replacements ([#47](https://github.com/launchdarkly/gha-flags/issues/47)) ([8290376](https://github.com/launchdarkly/gha-flags/commit/8290376e0d20913a44d9f8fad3985433c47444e6))


### Miscellaneous Chores

* Prepare for v1.0.0 release ([fc25bff](https://github.com/launchdarkly/gha-flags/commit/fc25bff43f4ffb58076063fbcb16388161fd0264))
