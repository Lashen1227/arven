import { existsSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';
import { scanEnvVars } from '../scanner.js';
import { parseEnvExample } from '../utils/envParser.js';
import { loadArvenConfig } from '../utils/configParser.js';
import type { CheckOptions } from '../types.js';

export async function check(options: CheckOptions): Promise<void> {
  const root        = resolve(options.root);
  const examplePath = resolve(options.example);
  const configPath = resolve(root, options.config);

  console.log(chalk.cyan('\n  arven check') + chalk.gray(' — verifying .env.example sync...\n'));

  if (!existsSync(examplePath)) {
    console.log(
      chalk.red('  ✗ ') +
      chalk.white(`${options.example} not found.`) +
      chalk.gray(' Run: arven generate\n')
    );
    process.exit(1);
  }

  const found        = await scanEnvVars(root);
  const documented   = parseEnvExample(examplePath);
  const codebaseVars = new Set(found.keys());

  let config;
  try {
    config = loadArvenConfig(configPath);
  } catch (error) {
    console.log(chalk.red(`  ✕ ${error instanceof Error ? error.message : 'Invalid arven config'}\n`));
    process.exit(1);
  }

  const missing = [...codebaseVars].filter((v) => !documented.has(v));
  const unused  = [...documented].filter((v) => !codebaseVars.has(v));
  const missingMetadata = options.requireMetadata
    ? [...codebaseVars].filter((name) => {
        const contract = config.variables[name];
        return !contract?.description || contract.required === undefined;
      })
    : [];

  if (missing.length === 0 && unused.length === 0 && missingMetadata.length === 0) {
    console.log(chalk.green('  ✓ ') + chalk.white('.env.example is in sync with codebase.\n'));
    process.exit(0);
  }

  if (missing.length > 0) {
    console.log(chalk.red(`  ✗ ${missing.length} variable${missing.length !== 1 ? 's' : ''} missing from ${options.example}:\n`));
    for (const v of missing.sort()) {
      console.log(chalk.red('    - ') + chalk.white(v));
    }
    console.log('');
  }

  if (unused.length > 0) {
    console.log(chalk.yellow(`  ⚠  ${unused.length} variable${unused.length !== 1 ? 's' : ''} in ${options.example} not used in codebase:\n`));
    for (const v of unused.sort()) {
      console.log(chalk.yellow('    ~ ') + chalk.white(v));
    }
    console.log('');
  }

  if (missingMetadata.length > 0) {
    console.log(chalk.yellow(`  ⚠  ${missingMetadata.length} variable${missingMetadata.length !== 1 ? 's' : ''} missing contract metadata:\n`));
    for (const v of missingMetadata.sort()) console.log(chalk.yellow('    ~ ') + chalk.white(v));
    console.log(chalk.gray('  Add a description and required value in .arvenrc.json.\n'));
  }

  console.log(chalk.gray('  Run: arven generate --overwrite to fix.\n'));
  process.exit(1);
}
