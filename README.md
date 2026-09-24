# LaunchDarkly Flag Evaluation GitHub Action

GitHub Action for evaluating LaunchDarkly flags in your workflow.

<!-- action-docs-inputs -->

## Inputs

| parameter    | description                                                                                                                                     | required | default                         |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------- |
| sdk-key      | Server-side SDK key for environment.                                                                                                            | `true`   |                                 |
| flags        | Provide a list flag keys and default value in a comma separated format with a newline between each flag you want evaluated. `example-flag,true` | `true`   |                                 |
| context-key  | The key of the context object used in a feature flag evaluation                                                                                 | `false`  | ld-github-action-flags          |
| send-events  | Whether to send analytics events back to LaunchDarkly                                                                                           | `false`  | true                            |
| offline      | Whether to use the LaunchDarkly SDK in offline mode                                                                                             | `false`  | false                           |
| base-uri     | The base URI for the LaunchDarkly server. Most users should use the default value.                                                              | `false`  | https://app.launchdarkly.com    |
| stream-uri   | The base URI for the LaunchDarkly streaming server. Most users should use the default value.                                                    | `false`  | https://stream.launchdarkly.com |
| events-uri   | The base URI for the LaunchDarkly events server. Most users should use the default value.                                                       | `false`  | https://events.launchdarkly.com |
| proxy-auth   | Allows you to specify basic authentication parameters for an optional HTTP proxy. Usually of the form username:password.                        | `false`  |                                 |
| proxy-host   | Allows you to specify a host for an optional HTTP proxy. Both the host and port must be specified to enable proxy support.                      | `false`  |                                 |
| proxy-port   | Allows you to specify a port for an optional HTTP proxy. Both the host and port must be specified to enable proxy support.                      | `false`  |                                 |
| proxy-scheme | When using an HTTP proxy, specifies whether it is accessed via http or https                                                                    | `false`  |                                 |

<!-- action-docs-inputs -->

## Output

The values of the request flags are stored on the step outputs with the flag key.

**Keys:**

Flag keys used in this GitHub Action must contain only alphanumeric characters, `-`, or `_`.

**Values:**

> Outputs are Unicode strings, and can be a maximum of 1 MB. The total of all outputs in a workflow run can be a maximum of 50 MB.

_Read more: [Metadata syntax](https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions)_

## Examples

- [Basic](#basic)
- [Dynamic context key](#dynamic-context-key)
- [Use value in expression](#use-value-in-expression)
- [Parse output string to types](#parse-output-string-to-types)
- [Setting custom contexts](#setting-custom-contexts)
- [Use with GitHub deployment environments](#use-with-github-deployment-environments)
- [Disable analytics events](#disable-analytics-events)

### Basic

This example evaluates flag keys of different types and prints their values.

<!-- x-release-please-start-version -->

```yaml
name: Evaluate LaunchDarkly flags
on: push
jobs:
  eval-flags:
    runs-on: ubuntu-latest
    steps:
      - name: Evaluate flags
        id: flags
        uses: launchdarkly/gha-flags@v1.1.0
        with:
          sdk-key: ${{ secrets.LD_SDK_KEY }}
          flags: |
            test-boolean-flag
            test-string-flag
            test-number-flag
            test-json-flag
      - name: Print flag values
        run: |
          echo ${{ steps.flags.outputs.test-boolean-flag }}
          echo ${{ steps.flags.outputs.test-string-flag }}
          echo ${{ steps.flags.outputs.test-number-flag }}
          echo ${{ toJSON(steps.flags.outputs.test-json-flag) }}
```

<!-- x-release-please-end -->

### Dynamic context key

This example evaluates a flag for a context. Here, the LaunchDarkly context key is the username of the GitHub user who initiated the workflow run.

_Read more: [GitHub Actions Contexts](https://docs.github.com/en/actions/learn-github-actions/contexts)_

<!-- x-release-please-start-version -->

```yaml
name: Evaluate LaunchDarkly flags
on: push
jobs:
  eval-flags:
    runs-on: ubuntu-latest
    steps:
      - name: Evaluate flags
        id: flags
        uses: launchdarkly/gha-flags@v1.1.0
        with:
          sdk-key: ${{ secrets.LD_SDK_KEY }}
          flags: favorite-animal
          context-key: ${{ github.actor }}
      - name: Favorite animal
        if: steps.flags.outputs.favorite-animal != 'idk'
        run: echo "${{ github.actor }}'s favorite animal is a...${{ steps.flags.outputs.favorite-animal }}"
```

<!-- x-release-please-end -->

### Use value in expression

This example evaluates a flag key and uses the value in an expression in a subsequent step.

<!-- x-release-please-start-version -->

```yaml
name: Evaluate LaunchDarkly flags
on: push
jobs:
  eval-flags:
    runs-on: ubuntu-latest
    steps:
      - name: Evaluate flags
        id: ld
        uses: launchdarkly/gha-flags@v1.1.0
        with:
          sdk-key: ${{ secrets.LD_SDK_KEY }}
          flags: test-boolean-flag
      - name: If true
        if: steps.flags.outputs.test-boolean-flag == 'true'
        run: echo "It's true"
      - name: If false
        if: steps.flags.outputs.test-boolean-flag == 'false'
        run: echo "It's false"
```

<!-- x-release-please-end -->

### Parse output string to types

This example illustrates how output values are stored as strings. You can parse them to JSON or a JSON data type using [fromJSON()](https://docs.github.com/en/actions/learn-github-actions/expressions#fromjson).

<!-- x-release-please-start-version -->

```yaml
name: Evaluate LaunchDarkly flags
on: push
jobs:
  eval-flags:
    runs-on: ubuntu-latest
    steps:
      - name: Evaluate flags
        id: ld
        uses: launchdarkly/gha-flags@v1.1.0
        with:
          sdk-key: ${{ secrets.LD_SDK_KEY }}
          flags: test-boolean-flag
          - name: If true
            if: fromJSON(steps.flags.outputs.test-boolean-flag) == true
            run: echo "It's true"
          - name: If false
            if: fromJSON(steps.flags.outputs.test-boolean-flag) == false
            run: echo "It's false"
```

<!-- x-release-please-end -->

### Setting custom contexts

If you would like to include additional custom properties in your context object you may specify environment variables with the `LD_` prefix. All values will be treated at strings.

By default, all metadata associated with the workflow run is saved in custom properties.

_Read more: [Setting custom contexts](https://docs.launchdarkly.com/home/users/attributes#setting-custom-contexts)_

<!-- x-release-please-start-version -->

```yaml
name: Evaluate LaunchDarkly flags
on: push
job:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Evaluate flags
        id: ld
        uses: launchdarkly/gha-flags@v1.1.0
        with:
          sdk-key: ${{ secrets.LD_SDK_KEY }}
          flags: test-boolean-flag
        env:
          LD_group: beta
```

<!-- x-release-please-end -->

### Use with GitHub deployment environments

_Read more: [Using environments for deployment](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)_

<!-- x-release-please-start-version -->

```yaml
name: Deploy to environment
on: push
job:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Evaluate flags
        id: ld
        uses: launchdarkly/gha-flags@v1.1.0
        with:
          sdk-key: ${{ secrets.LD_SDK_KEY }} # configure environment-specific secret
          flags: test-boolean-flag
```

<!-- x-release-please-end -->

### Disable analytics events

This example evaluates flag keys without sending events to LaunchDarkly.

_Read more: [Analytics events](https://docs.launchdarkly.com/sdk/concepts/events/)_

<!-- x-release-please-start-version -->

```yaml
name: Evaluate LaunchDarkly flags
on: push
jobs:
  eval-flags:
    runs-on: ubuntu-latest
    steps:
      - name: Evaluate flags
        id: flags
        uses: launchdarkly/gha-flags@v1.1.0
        with:
          sdk-key: ${{ secrets.LD_SDK_KEY }}
          flags: test-boolean-flag
          send-events: false
```

<!-- x-release-please-end -->

## Contributing

We encourage pull requests and other contributions from the community. Check out our [contributing guidelines](CONTRIBUTING.md) for instructions on how to contribute to this project.

## About LaunchDarkly

- LaunchDarkly is a continuous delivery platform that provides feature flags as a service and allows developers to iterate quickly and safely. We allow you to easily flag your features and manage them from the LaunchDarkly dashboard. With LaunchDarkly, you can:
  - Roll out a new feature to a subset of your users (like a group of users who opt-in to a beta tester group), gathering feedback and bug reports from real-world use cases.
  - Gradually roll out a feature to an increasing percentage of users, and track the effect that the feature has on key metrics (for instance, how likely is a user to complete a purchase if they have feature A versus feature B?).
  - Turn off a feature that you realize is causing performance problems in production, without needing to re-deploy, or even restart the application with a changed configuration file.
  - Grant access to certain features based on user attributes, like payment plan (eg: users on the ‘gold’ plan get access to more features than users in the ‘silver’ plan). Disable parts of your application to facilitate maintenance, without taking everything offline.
- LaunchDarkly provides feature flag SDKs for a wide variety of languages and technologies. Check out [our documentation](https://docs.launchdarkly.com/sdk) for a complete list.
- Explore LaunchDarkly
  - [launchdarkly.com](https://www.launchdarkly.com/ 'LaunchDarkly Main Website') for more information
  - [docs.launchdarkly.com](https://docs.launchdarkly.com/ 'LaunchDarkly Documentation') for our documentation and SDK reference guides
  - [apidocs.launchdarkly.com](https://apidocs.launchdarkly.com/ 'LaunchDarkly API Documentation') for our API documentation
  - [blog.launchdarkly.com](https://blog.launchdarkly.com/ 'LaunchDarkly Blog Documentation') for the latest product updates
