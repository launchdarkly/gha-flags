# LaunchDarkly GitHub Action

GitHub Action for evaluating LaunchDarkly flags in your workflow.

## Configuration

| Option     | Description                                                                                  | Required | Default value                  | Example                       |
| ---------- | -------------------------------------------------------------------------------------------- | -------- | ------------------------------ | ----------------------------- |
| sdk-key    | SDK Key for environment                                                                      | true     |                                | sdk-\*\*\*                    |
| flag-keys  | The flag keys to evaluate                                                                    | true     |                                | enable-new-feature            |
| user-key   | The key of the user object used in a feature flag evaluation.                                | false    | ld-github-action-flags         |                               |
| base-uri   | The base URI for the LaunchDarkly server. Most users should use the default value.           | false    | http://app.launchdarkly.com    | http://app.launchdarkly.us    |
| events-uri | The base URI for the LaunchDarkly events server. Most users should use the default value.    | false    | http://events.launchdarkly.com | http://events.launchdarkly.us |
| stream-uri | The base URI for the LaunchDarkly streaming server. Most users should use the default value. | false    | http://stream.launchdarkly.com | http://stream.launchdarkly.us |

## Output

The value of the given flags will be saved directly to the step's outputs with the flag key.

## Examples

- [Basic](#basic)

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

### Parse values to correct type

<!-- TODO link to info about fromJSON -->

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

### Using with Github environment deployments

<!-- TODO link to info about environments -->

Set secret for production environment

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

### Use JSON flag value

<!-- TODO >
