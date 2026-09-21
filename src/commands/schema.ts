import { existsSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';
import { scanEnvVars } from '../scanner.js';
import type { SchemaOptions } from '../types.js';

export async function schema(options: SchemaOptions): Promise<void> {
  const root = resolve(options.root);
  const outputPath = resolve(options.output);

  if (existsSync(outputPath) && !options.overwrite) {
    console.log(chalk.yellow(`\n  ⚠  ${options.output} already exists. Use --overwrite to replace it.\n`));
    process.exit(1);
  }

  const found = await scanEnvVars(root);
  const variables = Object.fromEntries(
    [...found.keys()].sort().map((name) => [name, {
      required: true,
      description: '',
      example: '',
      secret: false,
    }])
  );
  writeFileSync(outputPath, `${JSON.stringify({ variables }, null, 2)}\n`, 'utf8');
  console.log(chalk.green(`\n  ✓ Generated ${options.output} with ${found.size} variable${found.size === 1 ? '' : 's'}.\n`));
}
