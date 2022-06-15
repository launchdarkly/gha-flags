# LaunchDarkly GitHub Action

GitHub Action for evaluating LaunchDarkly flags in your workflow.

## Configuration

| Option       | Description                                                                                  | Required | Default value                   |
| ------------ | -------------------------------------------------------------------------------------------- | -------- | ------------------------------- |
| `sdk-key`    | SDK Key for environment                                                                      | true     |                                 |
| `flag-keys`  | The flag keys to evaluate                                                                    | true     |                                 |
| `user-key`   | The key of the user object used in a feature flag evaluation                                | false    | `ld-github-action-flags`          |
| `base-uri`   | The base URI for the LaunchDarkly server. Most users should use the default value.           | false    | https://app.launchdarkly.com    |
| `events-uri` | The base URI for the LaunchDarkly events server. Most users should use the default value.    | false    | https://events.launchdarkly.com |
| `stream-uri` | The base URI for the LaunchDarkly streaming server. Most users should use the default value. | false    | https://stream.launchdarkly.com |

## Output

The values of the request flags are stored on the step outputs with the flag key.

> Outputs are Unicode strings, and can be a maximum of 1 MB. The total of all outputs in a workflow run can be a maximum of 50 MB.

_Read more: [Metadata syntax](https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions)_

## Examples

- [LaunchDarkly GitHub Action](#launchdarkly-github-action)
  - [Configuration](#configuration)
  - [Output](#output)
  - [Examples](#examples)
    - [Basic](#basic)
    - [Use value in expression](#use-value-in-expression)
    - [Parse output string to types](#parse-output-string-to-types)
    - [Use with GitHub deployment environments](#use-with-github-deployment-environments)

### Basic

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

Output values are stored as strings and can be parsed to JSON or a JSON data type using [fromJSON()](https://docs.github.com/en/actions/learn-github-actions/expressions#fromjson).

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

_See more: [Using environments for deployment](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)_

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
