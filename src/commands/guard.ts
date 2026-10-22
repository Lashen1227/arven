import { isAbsolute, relative, resolve, sep } from 'path';
import { execFileSync } from 'child_process';
import { existsSync } from 'fs';
import chalk from 'chalk';
import { scanStagedFiles } from '../scanner.js';
import { parseEnvExample, parseEnvExampleContent } from '../utils/envParser.js';
import { readGitIndexFile } from '../utils/gitIndex.js';
import type { GuardResult, ScanResult } from '../types.js';

export interface GuardOptions {
  example: string;
  root: string;
}

export async function guard(options: GuardOptions): Promise<void> {
  const root      = resolve(options.root);
  const examplePath = resolve(options.example);

  let stagedFiles: string[];
  let gitRoot: string;
  try {
    gitRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    const staged = execFileSync('git', [
      'diff', '--cached', '--name-only', '--diff-filter=ACMRT', '-z',
    ], { cwd: gitRoot, stdio: ['ignore', 'pipe', 'ignore'] });
    stagedFiles = staged.toString('utf8').split('\0').filter(Boolean)
      .map((file) => resolve(gitRoot, file))
      .filter((file) => {
        const projectRelativePath = relative(root, file);
        return projectRelativePath === '' ||
          (!projectRelativePath.startsWith(`..${sep}`) && projectRelativePath !== '..' && !isAbsolute(projectRelativePath));
      });
  } catch {
    console.log(chalk.red('\n  arven ✕  Could not read staged files from Git.\n'));
    process.exit(1);
  }

  if (stagedFiles.length === 0) process.exit(0);

  // Scan only staged files for new env vars
  let found: ScanResult;
  try {
    found = await scanStagedFiles(stagedFiles, root, gitRoot);
  } catch (error) {
    console.log(chalk.red(`\n  arven ✕  ${error instanceof Error ? error.message : 'Could not scan staged files.'}\n`));
    process.exit(1);
  }
  const stagedExamplePath = relative(gitRoot, examplePath).split(sep).join('/');
  let stagedExample: string | null;
  try {
    stagedExample = readGitIndexFile(gitRoot, stagedExamplePath);
  } catch (error) {
    console.log(chalk.red(`\n  arven ✕  ${error instanceof Error ? error.message : 'Could not read staged .env.example.'}\n`));
    process.exit(1);
  }
  // No .env.example in the index or working tree yet — warn but don't block.
  if (stagedExample === null && !existsSync(examplePath)) {
    console.log(
      chalk.yellow('\n  arven ⚠  ') +
      chalk.white('.env.example not found.') +
      chalk.gray(' Run: arven generate\n')
    );
    process.exit(0);
  }
  const documented = stagedExample === null ? parseEnvExample(examplePath) : parseEnvExampleContent(stagedExample);

  const result: GuardResult = {
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
  console.log(
    chalk.white(`  ${result.missing.length} new env var${result.missing.length !== 1 ? 's' : ''} found in staged files`) +
    chalk.gray(' but not in .env.example:\n')
  );

  for (const v of result.missing) {
    const sources = found.get(v)!;
    const preview = [...sources].slice(0, 2).join(', ');
    console.log(
      chalk.red('    ✗ ') +
      chalk.white(v.padEnd(36)) +
      chalk.gray(`← ${preview}`)
    );
  }

  console.log(chalk.gray('\n  Fix with one of:'));
  console.log(chalk.cyan('    arven generate --overwrite') + chalk.gray('   # auto-add to .env.example'));
  console.log(chalk.cyan('    arven diff') + chalk.gray('                    # see full picture'));
  console.log(chalk.gray('\n  Then re-commit.\n'));

  process.exit(1);
}
