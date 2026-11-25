---
name: temenos-skill-author
description: Draft, refine, or validate a Temenos-local skill. Use when its scope, instructions, metadata, or bundled resources need work.
license: MIT
metadata:
  type: meta
  owner: temenos
  tags:
    - temenos
    - meta
    - skills
  openclaw:
    emoji: '🛠️'
    homepage: https://github.com/tanaabased/temenos/tree/main/skills/skill-author
---

# Skill author

## Overview

Author Temenos-local skills using the [local skill standard](../../references/skill-standard.md).
Do not use this guide to replace shared Tanaab capabilities or finalize the
Temenos persona.

## Required reading

Read [Identity](../../IDENTITY.md), [Mission and boundaries](../../SOUL.md),
[Workspace guidance](../../AGENTS.md), and the [voice draft](../voice/SKILL.md)
before drafting or revising a skill. These files own the current Temenos
context; do not copy it into individual skills or fill in undecided choices.

## Workflow

1. Confirm the skill has one local job. Use Canon if the work is shared, or
   update workspace guidance if the change is only a standing rule.
2. Choose the [meta](templates/meta.md) template for skill-authoring work or
   the [generic](templates/generic.md) template for editorial or other local work.
3. Explain when to use the skill, write the smallest useful workflow, and keep
   supporting examples or resources with it. Pick the icon by the skill's job.
4. Run `bun run validate:skills`. Fix failed checks and review the draft for
   stale identifiers, borrowed persona, overlap, and authority claims. Leave
   unresolved identity and authorship decisions open.
