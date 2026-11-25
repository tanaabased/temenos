# Setup

## What this example does

Install TEMENOS twice in an isolated OpenClaw profile and verify that
the declared setup converges without accounts or live schedules.

## What it doesn't do

No model turns or credentialed operations. The [backup example](../backup/README.md)
covers recovery from synthetic state, not installation.

## Setup

```bash
# should start an isolated Gateway with cron disabled
set -euo pipefail
openclaw config set cron.enabled false --strict-json
openclaw-gateway start
```

## Testing

```bash
# should validate and install the checked-in manifest without credentials
set -euo pipefail
cd "$GITHUB_WORKSPACE"
openclaw agent-system validate
openclaw agent-system install --yes --json > "$TMPDIR/install.json"
jq -e '
  .agentId == "temenos" and .blocked == null and
  ((.unattempted // []) | length == 0) and
  ([.outcomes[] | select(.component == "setup") | .stepId] | unique) ==
    ["brew-dependencies", "canon-checkout", "canon-plugin", "openclaw-config", "workspace-memory"]
' "$TMPDIR/install.json"
test -d memory
test -f MEMORY.md
openclaw config get agents.entries.temenos --json | jq -e '
  .name == "TEMENOS" and .model.primary == "openai/gpt-6.2-sol" and
  .tools.profile == "coding" and .memory.search.rememberAcrossConversations
'
openclaw plugins inspect tanaab --runtime --json | jq -e '
  .plugin.id == "tanaab" and .plugin.enabled and
  (.install.acceptedSurface.skills | length) > 0
'
```

```bash
# should leave setup and host policy unchanged on repeat installation
set -euo pipefail
cd "$GITHUB_WORKSPACE"
openclaw config get agents --json | jq -S . > "$TMPDIR/agents-before.json"
openclaw agent-system install --yes --json > "$TMPDIR/reinstall.json"
jq -e '
  .agentId == "temenos" and .blocked == null and
  ((.unattempted // []) | length == 0) and
  ([.outcomes[] | select(.component == "setup")] |
    length == 5 and all(.[]; .status == "unchanged"))
' "$TMPDIR/reinstall.json"
openclaw config get agents --json | jq -S . > "$TMPDIR/agents-after.json"
cmp "$TMPDIR/agents-before.json" "$TMPDIR/agents-after.json"
openclaw config get cron.enabled --json | jq -e '. == false'
test -z "$(git status --short --untracked-files=all)"
```
