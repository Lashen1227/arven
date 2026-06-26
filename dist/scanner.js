import { glob } from 'glob';
import { readFileSync } from 'fs';
import { resolve } from 'path';
/** All env var access patterns across frameworks */
const PATTERNS = [
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
const IGNORE_PATTERNS = [
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
const FILE_GLOBS = [
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
const BUILT_INS = new Set([
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
export async function scanEnvVars(rootDir = '.') {
    const absRoot = resolve(rootDir);
    const result = new Map();
    const files = await glob(FILE_GLOBS, {
        cwd: absRoot,
        ignore: IGNORE_PATTERNS,
        absolute: true,
    });
    for (const file of files) {
        let content;
        try {
            content = readFileSync(file, 'utf8');
        }
        catch {
            continue;
        }
        for (const pattern of PATTERNS) {
            pattern.lastIndex = 0;
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const varName = match[1];
                if (!varName || BUILT_INS.has(varName))
                    continue;
                if (!result.has(varName))
                    result.set(varName, new Set());
                result.get(varName).add(file.replace(`${absRoot}/`, ''));
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
export async function scanStagedFiles(stagedFiles, rootDir = '.') {
    const absRoot = resolve(rootDir);
    const result = new Map();
    const allowed = new Set(FILE_GLOBS.flatMap((g) => g.replace('**/*', '').split(',')));
    for (const file of stagedFiles) {
        // Only scan source files
        if (!file.match(/\.(ts|tsx|js|jsx|mjs|cjs|vue|svelte)$/))
            continue;
        let content;
        try {
            content = readFileSync(file, 'utf8');
        }
        catch {
            continue;
        }
        for (const pattern of PATTERNS) {
            pattern.lastIndex = 0;
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const varName = match[1];
                if (!varName || BUILT_INS.has(varName))
                    continue;
                if (!result.has(varName))
                    result.set(varName, new Set());
                result.get(varName).add(file.replace(`${absRoot}/`, ''));
            }
        }
    }
    // suppress unused warning
    void allowed;
    return result;
}
//# sourceMappingURL=scanner.js.map