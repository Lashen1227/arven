#!/usr/bin/env node
import { program } from 'commander';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { init } from '../commands/init.js';
import { generate } from '../commands/generate.js';
import { check } from '../commands/check.js';
import { diff } from '../commands/diff.js';
import { guard } from '../commands/guard.js';
import { uninstall } from '../commands/uninstall.js';
const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(__dirname, '../../package.json'), 'utf8'));
program
    .name('arven')
    .description(pkg.description)
    .version(pkg.version);
// ── arven init ───────────────────────────────────────────────────────────────
program
    .command('init')
    .description('Install the pre-commit hook and generate initial .env.example')
    .option('-r, --root <path>', 'Project root directory', '.')
    .option('-o, --output <path>', 'Output file path', '.env.example')
    .option('--overwrite', 'Overwrite existing .env.example', false)
    .action((opts) => init(opts));
// ── arven generate ───────────────────────────────────────────────────────────
program
    .command('generate')
    .description('Scan codebase and generate .env.example')
    .option('-o, --output <path>', 'Output file path', '.env.example')
    .option('-r, --root <path>', 'Root directory to scan', '.')
    .option('--overwrite', 'Overwrite existing .env.example', false)
    .action((opts) => generate(opts));
// ── arven check ──────────────────────────────────────────────────────────────
program
    .command('check')
    .description('CI mode — fail if .env.example is out of sync with codebase')
    .option('-r, --root <path>', 'Root directory to scan', '.')
    .option('-e, --example <path>', 'Path to .env.example', '.env.example')
    .action((opts) => check(opts));
// ── arven diff ───────────────────────────────────────────────────────────────
program
    .command('diff')
    .description('Show vars missing from or unused in .env.example')
    .option('-r, --root <path>', 'Root directory to scan', '.')
    .option('-e, --example <path>', 'Path to .env.example', '.env.example')
    .action((opts) => diff(opts));
// ── arven guard (called by git hook internally) ───────────────────────────────
program
    .command('guard')
    .description('Guard staged files before commit (called by pre-commit hook)')
    .option('--staged <files>', 'Space-separated list of staged files', '')
    .option('-e, --example <path>', 'Path to .env.example', '.env.example')
    .option('-r, --root <path>', 'Project root', '.')
    .action((opts) => guard(opts));
// ── arven uninstall ───────────────────────────────────────────────────────────
program
    .command('uninstall')
    .description('Remove arven from the pre-commit hook')
    .option('-r, --root <path>', 'Project root directory', '.')
    .action((opts) => uninstall(opts));
program.parse();
//# sourceMappingURL=arven.js.map