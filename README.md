# Temenos

Temenos is an OpenClaw workspace with an Agent System scaffold. It does not
connect live accounts or activate production automations.

Use the [skill author guide](skills/skill-author/SKILL.md) to write Temenos-local
skills and the [voice draft](skills/voice/SKILL.md) to see what remains open in
[Temenos’s identity and authorship work](https://github.com/tanaabased/temenos/issues/5).

## Development

Use the Bun version in [.bun-version](.bun-version). From the repository root:

```sh
bun install --frozen-lockfile --ignore-scripts
bun run lint
bun run validate:skills
bun run test
```

These checks do not start OpenClaw or require connected accounts.

## Agent System

With a compatible OpenClaw and Agent System installation, run
`openclaw agent-system validate` from the repository root to check the manifest
without applying setup. The setup tasks target macOS and use Homebrew, Bun, and
the public Canon checkout.

The [local overlay example](.agent-system/agent.local.yaml.example) documents
account bindings for deployment. Keep the real overlay local. The checked-in
jobs are disabled: workspace update is scheduled for 11:30 p.m. and backup for
1 a.m., both in scheduler-local time. The updater does not upgrade OpenClaw.
Backup delivery requires a private Temenos Drive folder; the repository does
not supply that destination. See [account readiness](https://github.com/tanaabased/temenos/issues/6)
before enabling either job.
