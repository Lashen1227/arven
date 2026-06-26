import { resolve } from 'path';
import { existsSync } from 'fs';
import chalk from 'chalk';
import { scanStagedFiles } from '../scanner.js';
import { parseEnvExample } from '../utils/envParser.js';
export async function guard(options) {
    const root = resolve(options.root);
    const examplePath = resolve(options.example);
    // No .env.example yet — warn but don't block
    if (!existsSync(examplePath)) {
        console.log(chalk.yellow('\n  arven ⚠  ') +
            chalk.white('.env.example not found.') +
            chalk.gray(' Run: arven generate\n'));
        process.exit(0);
    }
    const stagedFiles = options.staged
        .split(/\s+/)
        .filter(Boolean)
        .map((f) => resolve(root, f));
    if (stagedFiles.length === 0)
        process.exit(0);
    // Scan only staged files for new env vars
    const found = await scanStagedFiles(stagedFiles, root);
    const documented = parseEnvExample(examplePath);
    const result = {
        missing: [...found.keys()].filter((v) => !documented.has(v)),
        blocked: false,
    };
    if (result.missing.length === 0) {
        // Silent pass — don't spam the terminal on clean commits
        process.exit(0);
    }
    // Block the commit
    result.blocked = true;
    console.log(chalk.red('\n  arven ✗  Commit blocked\n'));
    console.log(chalk.white(`  ${result.missing.length} new env var${result.missing.length !== 1 ? 's' : ''} found in staged files`) +
        chalk.gray(' but not in .env.example:\n'));
    for (const v of result.missing) {
        const sources = found.get(v);
        const preview = [...sources].slice(0, 2).join(', ');
        console.log(chalk.red('    ✗ ') +
            chalk.white(v.padEnd(36)) +
            chalk.gray(`← ${preview}`));
    }
    console.log(chalk.gray('\n  Fix with one of:'));
    console.log(chalk.cyan('    arven generate --overwrite') + chalk.gray('   # auto-add to .env.example'));
    console.log(chalk.cyan('    arven diff') + chalk.gray('                    # see full picture'));
    console.log(chalk.gray('\n  Then re-commit.\n'));
    process.exit(1);
}
//# sourceMappingURL=guard.js.map