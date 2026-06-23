import { resolve } from 'path';
import chalk from 'chalk';
import { uninstallHook } from '../hooks/hookManager.js';

export interface UninstallOptions {
  root: string;
}

export function uninstall(options: UninstallOptions): void {
  const root = resolve(options.root);

  console.log(chalk.cyan('\n  arven uninstall') + chalk.gray(' — removing pre-commit hook...\n'));

  const result = uninstallHook(root);

  if (!result.success) {
    console.log(chalk.red('  ✗ ') + chalk.white(result.message) + '\n');
    process.exit(1);
  }

  console.log(chalk.green('  ✓ ') + chalk.white(result.message));
  console.log(chalk.gray('\n  arven is no longer watching. Run arven init to re-enable.\n'));
}
