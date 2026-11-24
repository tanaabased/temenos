import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { YAML } from 'bun';

export function validateSkill(directory) {
  const errors = [];
  const id = `temenos-${basename(directory)}`;
  let frontmatter;
  let body;
  let codex;

  try {
    const source = readFileSync(join(directory, 'SKILL.md'), 'utf8');
    const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(source);
    if (!match) return ['SKILL.md: missing YAML frontmatter'];
    frontmatter = YAML.parse(match[1]);
    body = match[2];
  } catch (error) {
    return [`SKILL.md: ${error.message}`];
  }

  try {
    codex = YAML.parse(readFileSync(join(directory, 'agents/openai.yaml'), 'utf8'));
  } catch (error) {
    errors.push(`agents/openai.yaml: ${error.message}`);
  }

  const { metadata } = frontmatter ?? {};
  const { type, owner, tags, openclaw } = metadata ?? {};
  if (frontmatter?.name !== id || !/^temenos-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    errors.push(`SKILL.md: expected a valid machine ID matching the folder (${id})`);
  }
  if (!nonempty(frontmatter?.description) || frontmatter.license !== 'MIT') {
    errors.push('SKILL.md: expected a description and MIT license');
  }
  if (!nonempty(type) || owner !== 'temenos' || !validTags(tags, type)) {
    errors.push('SKILL.md: expected a type, temenos owner, and owner, type, and category tags');
  }
  if (!nonempty(openclaw?.emoji) || !/^https:\/\/\S+$/.test(openclaw?.homepage ?? '')) {
    errors.push('SKILL.md: expected an OpenClaw emoji and HTTPS homepage');
  }

  for (const [, target] of body.matchAll(/\]\(<?([^\s>)]+)>?(?:\s+"[^"]*")?\)/g)) {
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(target)) continue;
    const path = target.split(/[?#]/, 1)[0];
    try {
      statSync(resolve(directory, decodeURIComponent(path)));
    } catch {
      errors.push(`SKILL.md: unresolved local link ${target}`);
    }
  }

  const ui = codex?.interface;
  if (
    !nonempty(ui?.display_name) ||
    !nonempty(ui?.short_description) ||
    !nonempty(ui?.default_prompt) ||
    !ui.default_prompt.split(/[^$a-z0-9-]+/).includes(`$${id}`) ||
    ui.brand_color !== '#00c88a'
  ) {
    errors.push('agents/openai.yaml: expected display text, skill prompt, and Temenos brand color');
  }
  for (const key of ['icon_small', 'icon_large']) {
    const icon = ui?.[key];
    if (!nonempty(icon) || !/^\.\/assets\/[\w.-]+\.(?:svg|png)$/.test(icon)) {
      errors.push(`agents/openai.yaml: ${key} must reference a bundled SVG or PNG`);
      continue;
    }
    try {
      if (!statSync(join(directory, icon)).isFile()) throw new Error('Not a file');
    } catch {
      errors.push(`agents/openai.yaml: unresolved ${key} ${icon}`);
    }
  }
  if (
    codex?.policy?.allow_implicit_invocation !== undefined &&
    typeof codex.policy.allow_implicit_invocation !== 'boolean'
  ) {
    errors.push('agents/openai.yaml: allow_implicit_invocation must be a boolean');
  }
  return errors;
}

function nonempty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validTags(tags, type) {
  return (
    Array.isArray(tags) &&
    tags.includes('temenos') &&
    tags.includes(type) &&
    tags.some((tag) => tag !== 'temenos' && tag !== type) &&
    tags.every((tag) => typeof tag === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tag))
  );
}

if (import.meta.main) {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const skills = readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  if (skills.length === 0) {
    process.stderr.write('No skill directories found\n');
    process.exitCode = 1;
  }
  for (const { name } of skills) {
    const directory = join(root, name);
    const errors = validateSkill(directory);
    const label = relative(process.cwd(), directory);
    if (errors.length === 0) {
      process.stdout.write(`OK ${label}\n`);
    } else {
      for (const error of errors) process.stderr.write(`${label}: ${error}\n`);
      process.exitCode = 1;
    }
  }
}
