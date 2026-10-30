import { writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';
import { scanEnvVars } from '../scanner.js';
import { groupByCategory } from '../utils/envParser.js';
import { loadArvenConfig } from '../utils/configParser.js';
import { renderZodOutput, renderTsOutput } from '../utils/codegenRenderer.js';
import type { CodegenOptions } from '../types.js';

export async function codegen(options: CodegenOptions): Promise<void> {
  const root       = resolve(options.root);
  const outputPath = resolve(options.output);
  const configPath = resolve(root, options.config);
  const format     = options.format ?? 'zod';

  console.log(
    chalk.cyan('\n  arven codegen') +
    chalk.gray(` — generating ${format === 'zod' ? 'Zod' : 'TypeScript'} env validator...\n`)
  );

  // Guard: don't overwrite without explicit flag
  if (existsSync(outputPath) && !options.overwrite) {
    console.log(
      chalk.yellow('  ⚠  ') +
      chalk.white(`${options.output} already exists.`) +
      chalk.gray(' Use --overwrite to replace it.\n')
    );
    process.exit(1);
  }

  // Load contract config
  let config;
  try {
    config = loadArvenConfig(configPath);
  } catch (error) {
    console.log(chalk.red(`  ✕ ${error instanceof Error ? error.message : 'Invalid arven config'}\n`));
    process.exit(1);
  }

  // Scan codebase for env vars
  const found    = await scanEnvVars(root);
  const varNames = [...found.keys()];

  if (varNames.length === 0) {
    console.log(chalk.yellow('  No environment variables found in codebase.\n'));
    process.exit(0);
  }

  // Group vars by category (used for inline comments in generated code)
  const categories = groupByCategory(varNames);

  // Check if Zod format is requested but zod is not installed
  if (format === 'zod') {
    try {
      // Use createRequire for a synchronous, type-checker-safe existence check.
      // zod is a peer dependency of the USER's project, not of arven itself.
      const { createRequire } = await import('module');
      const req = createRequire(import.meta.url);
      req.resolve('zod');
    } catch {
      console.log(
        chalk.yellow('  ⚠  ') +
        chalk.white('zod is not installed in this project.') +
        chalk.gray(' Run: npm install zod\n')
      );
      console.log(
        chalk.gray('  Or generate a zero-dependency validator instead:\n') +
        chalk.cyan('    arven codegen --format ts\n')
      );
      process.exit(1);
    }
  }

  // Render output
  const output = format === 'zod'
    ? renderZodOutput(varNames, config, categories)
    : renderTsOutput(varNames, config, categories);

  writeFileSync(outputPath, output, 'utf8');

  console.log(
    chalk.green(`  ✓ Generated ${options.output}`) +
    chalk.gray(` (${varNames.length} variable${varNames.length !== 1 ? 's' : ''})\n`)
  );

  // Show summary by category
  for (const [category, vars] of categories) {
    console.log(chalk.bold(`  ${category}`));
    for (const v of [...vars].sort()) {
      const contract = config.variables[v];
      const tag = contract?.required === false
        ? chalk.gray('optional')
        : chalk.green('required');
      const secretTag = contract?.secret ? chalk.red(' secret') : '';
      console.log(
        chalk.green('    + ') +
        chalk.white(v.padEnd(36)) +
        tag + secretTag
      );
    }
    console.log('');
  }

  // Hint for next steps
  if (format === 'zod') {
    console.log(chalk.gray(`  Import in your app entry point:`));
    console.log(chalk.cyan(`    import { env } from './${options.output.replace(/\.ts$/, '.js')}';`));
  } else {
    console.log(chalk.gray(`  Import in your app entry point:`));
    console.log(chalk.cyan(`    import { env } from './${options.output.replace(/\.ts$/, '.js')}';`));
  }
  console.log(chalk.gray(`\n  Keep in sync: arven codegen --overwrite\n`));
}
