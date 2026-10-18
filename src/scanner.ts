import { glob } from 'glob';
import { readFileSync } from 'fs';
import { execFileSync } from 'child_process';
import { relative, resolve, sep } from 'path';
import type { ScanResult } from './types.js';

/** All env var access patterns across frameworks */
const PATTERNS: RegExp[] = [
  // process.env.VAR — Node / Express / NestJS
  /process\.env\.([A-Z_][A-Z0-9_]*)/g,

  // process.env['VAR'] or process.env["VAR"]
  /process\.env\[["']([A-Z_][A-Z0-9_]*)["']\]/g,

  // import.meta.env.VAR — Vite / SvelteKit / Next.js
  /import\.meta\.env\.([A-Z_][A-Z0-9_]*)/g,

  // Deno.env.get('VAR')
  /Deno\.env\.get\(["']([A-Z_][A-Z0-9_]*)["']\)/g,

  // Bun.env.VAR
  /Bun\.env\.([A-Z_][A-Z0-9_]*)/g,
];

const IGNORE_PATTERNS: string[] = [
  '**/node_modules/**',
  '**/.git/**',
  '**/dist/**',
  '**/build/**',
  '**/out/**',
  '**/.next/**',
  '**/.nuxt/**',
  '**/coverage/**',
  '**/*.min.js',
  '**/*.d.ts',
];

const FILE_GLOBS: string[] = [
  '**/*.ts',
  '**/*.tsx',
  '**/*.js',
  '**/*.jsx',
  '**/*.mjs',
  '**/*.cjs',
  '**/*.vue',
  '**/*.svelte',
];

/** Node / system built-ins to exclude from results */
const BUILT_INS = new Set<string>([
  'NODE_ENV', 'NODE_PATH', 'NODE_OPTIONS',
  'PATH', 'HOME', 'USER', 'SHELL', 'PWD',
  'TERM', 'LANG', 'TZ', 'CI',
  'MODE', 'DEV', 'PROD', 'SSR',
]);

/**
 * Scan a directory for all env var usages.
 * @param rootDir - Directory to scan (default: current dir)
 * @returns Map of varName → Set of relative file paths
 */
export async function scanEnvVars(rootDir: string = '.'): Promise<ScanResult> {
  const absRoot = resolve(rootDir);
  const result: ScanResult = new Map();

  const files = await glob(FILE_GLOBS, {
    cwd: absRoot,
    ignore: IGNORE_PATTERNS,
    absolute: true,
  });

  for (const file of files) {
    let content: string;
    try {
      content = readFileSync(file, 'utf8');
    } catch {
      continue;
    }

    for (const pattern of PATTERNS) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = pattern.exec(content)) !== null) {
        const varName = match[1];
        if (!varName || BUILT_INS.has(varName)) continue;

        if (!result.has(varName)) result.set(varName, new Set());
        result.get(varName)!.add(file.replace(`${absRoot}/`, ''));
      }
    }
  }

  return result;
}

/**
 * Scan only the staged files passed from the git pre-commit hook.
 * @param stagedFiles - List of absolute staged file paths
 * @param rootDir     - Project root (for relative path calculation)
 */
export async function scanStagedFiles(
  stagedFiles: string[],
  rootDir: string = '.'
): Promise<ScanResult> {
  const absRoot = resolve(rootDir);
  const result: ScanResult = new Map();

  for (const file of stagedFiles) {
    // Only scan source files
    if (!file.match(/\.(ts|tsx|js|jsx|mjs|cjs|vue|svelte)$/)) continue;

    // Read the blob from Git's index, not the working tree: pre-commit must
    // validate exactly the snapshot that will be committed.
    const relPath = relative(absRoot, resolve(file)).split(sep).join('/');
    if (!relPath || relPath === '..' || relPath.startsWith('../')) continue;

    let content: string;
    try {
      content = execFileSync('git', ['show', `:${relPath}`], {
        cwd: absRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
    } catch {
      // Deleted files and paths absent from the index have no blob to scan.
      continue;
    }

    for (const pattern of PATTERNS) {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = pattern.exec(content)) !== null) {
        const varName = match[1];
        if (!varName || BUILT_INS.has(varName)) continue;

        if (!result.has(varName)) result.set(varName, new Set());
        result.get(varName)!.add(file.replace(`${absRoot}/`, ''));
      }
    }
  }

  return result;
}
