# LaunchDarkly GitHub Action

GitHub Action for evaluating LaunchDarkly flags in your workflow.

## Configuration

| Option    | Description                      | Required | Default value               | Example                    |
| --------- | -------------------------------- | -------- | --------------------------- | -------------------------- |
| sdk-key   | SDK Key for environment          | true     | N/A                         | sdk-\*\*\*                 |
| flag-keys | The flag keys to evaluate        | true     | N/A                         | enable-new-feature         |
| baseUri   | The LaunchDarkly application URI | false    | http://app.launchdarkly.com | http://app.launchdarkly.us |

## Output

## Examples

- [Basic](#basic)

### Basic

```yaml
steps:
  - name: Evaluate flags
    id: ld
    uses: launchdarkly/gha-flags@v0.0.1
    with:
      sdk-key: ${{ secrets.SDK_KEY }}
      flag-keys: |
        test-boolean-flag
        test-string-flag
        test-number-flag
        test-json-flag
  - name: Print flag values
    run: echo ${{ toJSON(steps.ld.outputs.flags) }}
```

### Use value in expression

```yaml
steps:
  - name: Evaluate flags
    id: ld
    uses: launchdarkly/gha-flags@v0.0.1
    with:
      sdk-key: ${{ secrets.SDK_KEY }}
      flag-keys: enable-slack-notification
  - name: Send slack notification
    if: steps.ld.outputs.flags['enable-slack-notification'] == 'true'
```
