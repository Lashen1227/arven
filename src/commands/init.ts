import { existsSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';
import { installHook } from '../hooks/hookManager.js';
import { scanEnvVars } from '../scanner.js';
import { groupByCategory, renderEnvExample } from '../utils/envParser.js';
import { writeFileSync } from 'fs';

export interface InitOptions {
  root: string;
  output: string;
  overwrite: boolean;
}

export async function init(options: InitOptions): Promise<void> {
  const root = resolve(options.root);
  const outputPath = resolve(options.output);

  console.log(chalk.cyan('\n  arven') + chalk.gray(' — setting up your watcher...\n'));

  // ── Step 1: Install the git hook ─────────────────────────────────────────
  console.log(chalk.bold('  Step 1/2  ') + chalk.white('Installing pre-commit hook'));

  const hookResult = installHook(root);
  if (!hookResult.success) {
    console.log(chalk.red(`\n  ✗ ${hookResult.message}\n`));
    process.exit(1);
  }

  console.log(chalk.green('  ✓ ') + chalk.white(hookResult.message));
  console.log(chalk.gray(`    → ${hookResult.hookPath}\n`));

  // ── Step 2: Generate initial .env.example ────────────────────────────────
  console.log(chalk.bold('  Step 2/2  ') + chalk.white('Scanning codebase for env vars'));

  if (existsSync(outputPath) && !options.overwrite) {
    console.log(
      chalk.yellow('\n  ⚠  ') +
      chalk.white(`${options.output} already exists — skipping generation.`) +
      chalk.gray(' Use --overwrite to replace.\n')
    );
  } else {
    console.log(chalk.gray(`    Scanning: ${root}\n`));

    const found = await scanEnvVars(root);

    if (found.size === 0) {
      console.log(chalk.yellow('  No env vars found yet — .env.example not created.\n'));
    } else {
      const groups = groupByCategory([...found.keys()]);
      writeFileSync(outputPath, renderEnvExample(groups), 'utf8');
      console.log(
        chalk.green('  ✓ ') +
        chalk.white(`Generated ${options.output}`) +
        chalk.gray(` (${found.size} variable${found.size !== 1 ? 's' : ''})`)
      );
    }
  }

  // ── Done ─────────────────────────────────────────────────────────────────
  console.log(chalk.green('\n  arven is watching. ') + chalk.gray('Every commit is now guarded.\n'));
  console.log(chalk.gray('  Commands available:'));
  console.log(chalk.gray('    arven generate    — regenerate .env.example'));
  console.log(chalk.gray('    arven check       — CI sync check'));
  console.log(chalk.gray('    arven diff        — see what\'s missing'));
  console.log(chalk.gray('    arven uninstall   — remove the hook\n'));
}
