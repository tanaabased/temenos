import assert from 'node:assert/strict';
import { accessSync, readFileSync } from 'node:fs';
import { test } from 'bun:test';
import { YAML } from 'bun';

const root = new URL('../', import.meta.url);
const manifestFile = new URL('.agent-system/agent.yaml', root);
const readYaml = (url) => YAML.parse(readFileSync(url, 'utf8'));
const manifest = readYaml(manifestFile);

test('production configuration declares only disabled OpenClaw maintenance jobs', () => {
  const { automations, defaults } = readYaml(new URL(manifest.automations.file, manifestFile));
  assert.deepEqual(automations.map(({ id }) => id).sort(), ['backup-agent', 'update-agent']);
  for (const job of automations) {
    assert.equal(job.enabled ?? defaults.enabled, false);
    assert.deepEqual(job.runtimes ?? defaults.runtimes, ['openclaw']);
    accessSync(new URL(job.run[1], root));
  }
});

test('checked-in setup resolves task files without credential or intake configuration', () => {
  assert.equal(manifest.agent.id, 'temenos');
  for (const key of ['environment', 'github', 'google', 'memory'])
    assert.equal(manifest[key], undefined);
  for (const key of ['setup-host', 'setup-agent']) {
    const { steps } = readYaml(new URL(manifest[key].file, manifestFile));
    for (const { check, apply } of steps) {
      accessSync(new URL(check.command, root));
      accessSync(new URL(apply.command, root));
    }
  }
});
