# `temenos` Recovery

## What this example does

Create and verify backup from disposable workspace with `temenos`'s manifest,
identity, synthetic private files, and agent database. Restore into staging.
Check recovered content and excluded paths; source data and agent registrations
must remain intact. Trust, but verify.

## What it doesn't do

No runtime activation, live workspace replacement, scheduled backups, remote
uploads, or retention pruning. Restored files do not prove restored agent can
run. [Setup](../setup/README.md) covers fresh installation and configuration,
not activation of restored agent.

## Setup

```bash
# should prepare a disposable temenos checkout with synthetic private continuity
set -euo pipefail
workspace="$TMPDIR/temenos-workspace"
git clone --no-local "$GITHUB_WORKSPACE" "$workspace" >/dev/null 2>&1
git -C "$workspace" fetch -q "$GITHUB_WORKSPACE" HEAD
git -C "$workspace" checkout -q --detach FETCH_HEAD
test -f "$workspace/.agent-system/agent.yaml"
grep -Fx -- '- Name: TEMENOS' "$workspace/IDENTITY.md" >/dev/null
test ! -e "$workspace/BOOTSTRAP.md"
mkdir -p "$workspace/memory" "$workspace/.private" "$workspace/.scratch" "$workspace/.temp" "$workspace/node_modules"
printf 'synthetic continuity\n' > "$workspace/MEMORY.md"
printf 'synthetic dreams\n' > "$workspace/DREAMS.md"
printf 'synthetic indexed memory\n' > "$workspace/memory/recovery.md"
printf 'synthetic private note\n' > "$workspace/.private/recovery.txt"
printf 'excluded\n' > "$workspace/.scratch/probe"
printf 'excluded\n' > "$workspace/.temp/probe"
printf 'excluded\n' > "$workspace/node_modules/probe"
openclaw agents add temenos --workspace "$workspace" --non-interactive --json > "$TMPDIR/agent.json"
jq -e '.agentId == "temenos"' "$TMPDIR/agent.json" >/dev/null
```

## Testing

```bash
# should create a backup containing temenos's private continuity and agent database
set -euo pipefail
workspace="$TMPDIR/temenos-workspace"
node "$GITHUB_WORKSPACE/examples/backup/agent-state-fixture.mjs" seed "$TMPDIR/agent-database-path"
database="$(cat "$TMPDIR/agent-database-path")"
node "$GITHUB_WORKSPACE/examples/backup/agent-state-fixture.mjs" verify "$database"
shasum -a 256 "$database" > "$TMPDIR/source-before.sha"
openclaw agents list --json > "$TMPDIR/agents-before.json"
for file in AGENTS.md IDENTITY.md .agent-system/agent.yaml MEMORY.md DREAMS.md memory/recovery.md .private/recovery.txt; do
  shasum -a 256 "$workspace/$file"
done > "$TMPDIR/files-before.sha"
cd "$workspace"
openclaw agent-system backup create --agent temenos --json > "$TMPDIR/create.json"
jq -e '
  .status == "created" and .agentId == "temenos" and
  .settings.gitIgnore == true and .settings.openclawState == "required" and
  .coverage.openclawState == "captured" and
  .snapshot.manifest.database.agentId == "temenos" and
  (.inventory | map(.path) |
    (index("AGENTS.md") != null) and
    (index("IDENTITY.md") != null) and
    (index(".agent-system/agent.yaml") != null) and
    (index("MEMORY.md") != null) and
    (index("DREAMS.md") != null) and
    (index("memory/recovery.md") != null) and
    (index(".private/recovery.txt") != null) and
    (all(.[]; (startswith(".scratch/") or startswith(".temp/") or
      startswith("node_modules/") or startswith(".agent-system/backups/")) | not)))
' "$TMPDIR/create.json" >/dev/null
archive="$(jq -er .archive "$TMPDIR/create.json")"
test -f "$archive"
git check-ignore -q "$archive"
```

```bash
# should verify the created archive and its captured agent database
set -euo pipefail
archive="$(jq -er .archive "$TMPDIR/create.json")"
openclaw agent-system backup verify "$archive" --agent temenos --json > "$TMPDIR/verify.json"
jq -e '.status == "verified" and .coverage.openclawState == "captured" and
  .snapshot.manifest.database.agentId == "temenos"' "$TMPDIR/verify.json" >/dev/null
```

```bash
# should restore into staging without changing source data or activating a runtime
set -euo pipefail
workspace="$TMPDIR/temenos-workspace"
database="$(cat "$TMPDIR/agent-database-path")"
archive="$(jq -er .archive "$TMPDIR/create.json")"
restore="$TMPDIR/recovered"
openclaw agent-system backup restore "$archive" --target "$restore" --agent temenos --json > "$TMPDIR/restore.json"
jq -e --arg workspace "$restore/workspace" --arg database "$restore/openclaw-state/openclaw-agent.sqlite" '
  .status == "restored" and .agentId == "temenos" and
  .coverage.openclawState == "captured" and
  .workspace == $workspace and .database == $database
' "$TMPDIR/restore.json" >/dev/null
for file in AGENTS.md IDENTITY.md .agent-system/agent.yaml MEMORY.md DREAMS.md memory/recovery.md .private/recovery.txt; do
  cmp -s "$workspace/$file" "$restore/workspace/$file"
done
test ! -e "$restore/workspace/BOOTSTRAP.md"
test ! -e "$restore/workspace/.scratch/probe"
test ! -e "$restore/workspace/.temp/probe"
test ! -e "$restore/workspace/node_modules/probe"
test ! -e "$restore/workspace/.agent-system/backups"
node "$GITHUB_WORKSPACE/examples/backup/agent-state-fixture.mjs" verify "$restore/openclaw-state/openclaw-agent.sqlite"
for file in AGENTS.md IDENTITY.md .agent-system/agent.yaml MEMORY.md DREAMS.md memory/recovery.md .private/recovery.txt; do
  shasum -a 256 "$workspace/$file"
done > "$TMPDIR/files-after.sha"
cmp -s "$TMPDIR/files-before.sha" "$TMPDIR/files-after.sha"
shasum -a 256 "$database" > "$TMPDIR/source-after.sha"
cmp -s "$TMPDIR/source-before.sha" "$TMPDIR/source-after.sha"
openclaw agents list --json > "$TMPDIR/agents-after.json"
cmp -s "$TMPDIR/agents-before.json" "$TMPDIR/agents-after.json"
```
