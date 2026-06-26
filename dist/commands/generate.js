import { writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';
import { scanEnvVars } from '../scanner.js';
import { groupByCategory, renderEnvExample } from '../utils/envParser.js';
export async function generate(options) {
    const root = resolve(options.root);
    const outputPath = resolve(options.output);
    console.log(chalk.cyan('\n  arven generate') + chalk.gray(' — scanning your codebase...\n'));
    if (existsSync(outputPath) && !options.overwrite) {
        console.log(chalk.yellow('  ⚠  ') +
            chalk.white(`${options.output} already exists.`) +
            chalk.gray(' Use --overwrite to replace it.\n'));
        process.exit(1);
    }
    console.log(chalk.gray(`  Scanning: ${root}\n`));
    const found = await scanEnvVars(root);
    if (found.size === 0) {
        console.log(chalk.yellow('  No environment variables found in codebase.\n'));
        process.exit(0);
    }
    const varNames = [...found.keys()];
    const groups = groupByCategory(varNames);
    writeFileSync(outputPath, renderEnvExample(groups), 'utf8');
    console.log(chalk.green(`  ✓ Generated ${options.output}\n`));
    for (const [category, vars] of groups) {
        console.log(chalk.bold(`  ${category}`));
        for (const v of [...vars].sort()) {
            const sources = found.get(v);
            const preview = [...sources].slice(0, 2).join(', ');
            const extra = sources.size > 2 ? ` +${sources.size - 2} more` : '';
            console.log(chalk.green('    + ') +
                chalk.white(v.padEnd(36)) +
                chalk.gray(`← ${preview}${extra}`));
        }
        console.log('');
    }
    console.log(chalk.gray(`  ${varNames.length} variable${varNames.length !== 1 ? 's' : ''} ` +
        `across ${groups.size} group${groups.size !== 1 ? 's' : ''}.\n`));
}
//# sourceMappingURL=generate.js.map