import { afterEach, beforeEach, expect, test } from 'bun:test';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSkill } from '../scripts/validate-skills.js';

const source = fileURLToPath(new URL('../../', import.meta.url));
let sandbox;
let skill;

beforeEach(() => {
  sandbox = mkdtempSync(join(tmpdir(), 'temenos-skills-'));
  cpSync(source, join(sandbox, 'skills'), { recursive: true });
  for (const file of ['IDENTITY.md', 'SOUL.md', 'AGENTS.md', 'references']) {
    cpSync(join(source, '..', file), join(sandbox, file), { recursive: true });
  }
  skill = join(sandbox, 'skills', 'voice');
});

afterEach(() => rmSync(sandbox, { recursive: true, force: true }));

test('accepts the bundled voice draft', () => {
  expect(validateSkill(skill)).toEqual([]);
});

test('reports broken links and missing bundled icons', () => {
  rmSync(join(sandbox, 'IDENTITY.md'));
  rmSync(join(skill, 'assets', 'skill-icon-agent.svg'));
  expect(validateSkill(skill)).toEqual([
    'SKILL.md: unresolved local link ../../IDENTITY.md',
    'agents/openai.yaml: unresolved icon_small ./assets/skill-icon-agent.svg',
    'agents/openai.yaml: unresolved icon_large ./assets/skill-icon-agent.svg',
  ]);
});

test('reports invalid YAML field types without throwing', () => {
  const metadata = join(skill, 'agents', 'openai.yaml');
  const yaml = readFileSync(metadata, 'utf8')
    .replace(/default_prompt: .+/, 'default_prompt: 42')
    .replace('allow_implicit_invocation: false', 'allow_implicit_invocation: "false"');
  writeFileSync(metadata, yaml);
  expect(validateSkill(skill)).toEqual([
    'agents/openai.yaml: expected display text, skill prompt, and Temenos brand color',
    'agents/openai.yaml: allow_implicit_invocation must be a boolean',
  ]);
});
