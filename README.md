# Temenos

Temenos is an OpenClaw workspace for drafting, not installation. It does not
configure accounts, permissions, deployment, or automations.

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
