import { spawnSync } from 'node:child_process';
import { realpath } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import openBackupStorage from '../lib/backup/storage.js';

try {
  const workspace = await realpath(process.cwd());
  const lock = await openBackupStorage(workspace);
  try {
    const script = fileURLToPath(new URL('./backup-drive-task.sh', import.meta.url));
    const child = spawnSync('bash', [script, ...process.argv.slice(2)], {
      cwd: workspace,
      stdio: ['inherit', 'inherit', 'inherit', lock.lockFd],
    });
    process.exitCode = child.status ?? 1;
  } finally {
    await lock.close();
  }
} catch (error) {
  const reason = /^[a-z-]+$/u.test(error.message) ? error.message : 'backup-storage-unavailable';
  process.stderr.write(`Backup not started: ${reason}.\n`);
  process.exitCode = 1;
}
