import { existsSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';
import { scanEnvVars } from '../scanner.js';
import { parseEnvExample } from '../utils/envParser.js';
export async function diff(options) {
    const root = resolve(options.root);
    const examplePath = resolve(options.example);
    console.log(chalk.cyan('\n  arven diff') + chalk.gray(' — comparing codebase vs .env.example...\n'));
    const found = await scanEnvVars(root);
    const codebaseVars = new Set(found.keys());
    const documented = existsSync(examplePath) ? parseEnvExample(examplePath) : new Set();
    const summary = {
        missing: [...codebaseVars].filter((v) => !documented.has(v)),
        unused: [...documented].filter((v) => !codebaseVars.has(v)),
        synced: [...codebaseVars].filter((v) => documented.has(v)),
    };
    if (summary.missing.length === 0 && summary.unused.length === 0) {
        console.log(chalk.green('  ✓ Everything is in sync — nothing to show.\n'));
        return;
    }
    if (summary.missing.length > 0) {
        console.log(chalk.red(`  Missing in ${options.example} (in code, not documented):\n`));
        for (const v of summary.missing.sort()) {
            const preview = [...found.get(v)].slice(0, 2).join(', ');
            console.log(chalk.red('    + ') +
                chalk.white(v.padEnd(36)) +
                chalk.gray(`← ${preview}`));
        }
        console.log('');
    }
    if (summary.unused.length > 0) {
        console.log(chalk.yellow(`  Unused in ${options.example} (documented, not in code):\n`));
        for (const v of summary.unused.sort()) {
            console.log(chalk.yellow('    - ') + chalk.white(v));
        }
        console.log('');
    }
    console.log(chalk.gray('  Summary: ') +
        chalk.green(`${summary.synced.length} synced  `) +
        chalk.red(`${summary.missing.length} missing  `) +
        chalk.yellow(`${summary.unused.length} unused\n`));
}
//# sourceMappingURL=diff.js.map