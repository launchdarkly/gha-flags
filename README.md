# LaunchDarkly GitHub Action

GitHub Action for evaluating LaunchDarkly flags in your workflow.

## Configuration

| Option       | Description                                                                                  | Required | Default value                   |
| ------------ | -------------------------------------------------------------------------------------------- | -------- | ------------------------------- |
| `sdk-key`    | SDK Key for environment                                                                      | true     |                                 |
| `flag-keys`  | The flag keys to evaluate                                                                    | true     |                                 |
| `user-key`   | The key of the user object used in a feature flag evaluation                                 | false    | `ld-github-action-flags`        |
| `base-uri`   | The base URI for the LaunchDarkly server. Most users should use the default value.           | false    | https://app.launchdarkly.com    |
| `events-uri` | The base URI for the LaunchDarkly events server. Most users should use the default value.    | false    | https://events.launchdarkly.com |
| `stream-uri` | The base URI for the LaunchDarkly streaming server. Most users should use the default value. | false    | https://stream.launchdarkly.com |

## Output

The values of the request flags are stored on the step outputs with the flag key.

> Outputs are Unicode strings, and can be a maximum of 1 MB. The total of all outputs in a workflow run can be a maximum of 50 MB.

_Read more: [Metadata syntax](https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions)_

## Examples

- [Basic](#basic)
- [Use value in expression](#use-value-in-expression)
- [Parse output string to types](#parse-output-string-to-types)
- [Use with GitHub deployment environments](#use-with-github-deployment-environments)

### Basic

This example evaluates flag keys of different types and prints their values.

```yaml
name: Evaluate LaunchDarkly flags
on: push
jobs:
  eval-flags:
    runs-on: ubuntu-latest
    steps:
      - name: Evaluate flags
        id: flags
        uses: launchdarkly/gha-flags@v0.0.1
        with:
          sdk-key: ${{ secrets.LD_SDK_KEY }}
          flag-keys: |
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

### Use value in expression

This example evaluates a flag key and uses the value in an expression in a subsequent step.

```yaml
name: Evaluate LaunchDarkly flags
on: push
jobs:
  eval-flags:
    runs-on: ubuntu-latest
    steps:
      - name: Evaluate flags
        id: ld
        uses: launchdarkly/gha-flags@v0.0.1
        with:
          sdk-key: ${{ secrets.LD_SDK_KEY }}
          flag-keys: test-boolean-flag
      - name: If true
        if: steps.flags.outputs.test-boolean-flag == 'true'
        run: echo "It's true"
      - name: If false
        if: steps.flags.outputs.test-boolean-flag == 'false'
        run: echo "It's false"
```

### Parse output string to types

This example illustrates how output values are stored as strings. You can parse them to JSON or a JSON data type using [fromJSON()](https://docs.github.com/en/actions/learn-github-actions/expressions#fromjson).

```yaml
name: Evaluate LaunchDarkly flags
on: push
jobs:
  eval-flags:
    runs-on: ubuntu-latest
    steps:
      - name: Evaluate flags
        id: ld
        uses: launchdarkly/gha-flags@v0.0.1
        with:
          sdk-key: ${{ secrets.LD_SDK_KEY }}
          flag-keys: test-boolean-flag
          - name: If true
            if: fromJSON(steps.flags.outputs.test-boolean-flag) == true
            run: echo "It's true"
          - name: If false
            if: fromJSON(steps.flags.outputs.test-boolean-flag) == false
            run: echo "It's false"
```

### Use with GitHub deployment environments

_Read more: [Using environments for deployment](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)_

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
        uses: launchdarkly/gha-flags@v0.0.1
        with:
          sdk-key: ${{ secrets.LD_SDK_KEY }} # configure environment-specific secret
          flag-keys: test-boolean-flag
```

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
