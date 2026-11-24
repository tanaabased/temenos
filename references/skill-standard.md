# Temenos skill standard

Temenos skills own local behavior and use `temenos-*` IDs. Canon's
[`tanaab-skill-author`](https://github.com/tanaabased/canon/tree/main/skills/skill-author)
owns shared Tanaab skills. Name the local difference rather than cloning a
shared skill just to change precedence.

## Files and metadata

- Put each local skill under `skills/<name>/`, dropping the `temenos-` prefix
  from the directory but not from its machine ID or prompts.
- Give `SKILL.md` YAML frontmatter with a name, a description stating what the
  skill does and when to use it, MIT license, and metadata. Set the owner to
  `temenos`; include the owner and type in the tags, plus a category tag.
  Set an OpenClaw emoji and the skill's GitHub homepage.
- Put Codex presentation in `agents/openai.yaml`. Use brand accent `#00c88a`,
  skill-relative icon paths, and a default prompt that names the skill ID.
  Disable implicit invocation for drafts, and make their descriptions and
  prompts explicit about their draft status.
- Keep templates, assets, and references with their owning skill. Put internal
  commands in `scripts/` and keep tests with their owning skill.
- Start with the [meta](../skills/skill-author/templates/meta.md) or
  [generic](../skills/skill-author/templates/generic.md) template as appropriate.
  Add sections only when the skill needs them.

## Flame artwork

Choose the small icon by primary job. Voice and Skill Author both use Agent.
Bundle the SVG with the skill so its metadata still resolves if moved on its own.
For these two skills, use the same scalable flame for both icon sizes.

| Job           | SVG                            | Color           |
| ------------- | ------------------------------ | --------------- |
| Agent         | `skill-icon-agent.svg`         | Pink `#9c1c55`  |
| Code          | `skill-icon-code.svg`          | Blue `#0069b8`  |
| Miscellaneous | `skill-icon-miscellaneous.svg` | Green `#008f64` |

The [original flame assets](https://github.com/tanaabased/smutlord/pull/116) are
copied unchanged into [Skill Author's assets](../skills/skill-author/assets/).

## Verification

Run `bun run validate:skills` for frontmatter, local links, and icon references.
Review ownership, audience, and draft boundaries by reading the skill; a passing
structure check does not establish that a persona is ready.
