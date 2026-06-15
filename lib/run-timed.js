// Runs a command and prints the elapsed time in green on completion.
// Usage: node lib/run-timed.js <command> [args...]

import { execSync } from 'child_process';

const command = process.argv.slice(2).join(' ');
const start = Date.now();

try {
  execSync(command, { stdio: 'inherit', shell: true });
} catch (e) {
  process.exit(e.status || 1);
}

const elapsed = (Date.now() - start) / 1000;
const display = elapsed >= 60 ? `${Math.floor(elapsed / 60)}m ${(elapsed % 60).toFixed(1)}s` : `${elapsed.toFixed(1)}s`;
process.stdout.write(`\x1b[32m✓ Completed in ${display}\x1b[0m\n`);
