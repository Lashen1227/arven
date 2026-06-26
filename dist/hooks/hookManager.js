import { existsSync, mkdirSync, writeFileSync, readFileSync, chmodSync, unlinkSync, } from 'fs';
import { resolve, join } from 'path';
const HOOK_MARKER = '# arven:pre-commit';
/**
 * The pre-commit shell script arven injects.
 * It calls `arven guard` which scans staged files.
 */
function buildHookScript() {
    return [
        '#!/bin/sh',
        HOOK_MARKER,
        '# This hook was installed by arven. Remove with: arven uninstall',
        '',
        '# Get list of staged files',
        'STAGED=$(git diff --cached --name-only --diff-filter=ACM)',
        '',
        'if [ -z "$STAGED" ]; then',
        '  exit 0',
        'fi',
        '',
        '# Run arven guard — blocks commit if new env vars are undocumented',
        'npx arven guard --staged "$STAGED"',
        'exit $?',
    ].join('\n');
}
/**
 * Find the .git directory starting from cwd upward.
 */
export function findGitDir(from = process.cwd()) {
    let current = resolve(from);
    while (true) {
        const candidate = join(current, '.git');
        if (existsSync(candidate))
            return candidate;
        const parent = resolve(current, '..');
        if (parent === current)
            return null;
        current = parent;
    }
}
/**
 * Install the arven pre-commit hook into .git/hooks/pre-commit.
 * If a hook already exists (from another tool), arven appends to it.
 */
export function installHook(projectRoot = process.cwd()) {
    const gitDir = findGitDir(projectRoot);
    if (!gitDir) {
        return { success: false, message: 'No .git directory found. Are you inside a git repo?', hookPath: '' };
    }
    const hooksDir = join(gitDir, 'hooks');
    const hookPath = join(hooksDir, 'pre-commit');
    if (!existsSync(hooksDir))
        mkdirSync(hooksDir, { recursive: true });
    // If hook exists and already has arven marker — skip
    if (existsSync(hookPath)) {
        const existing = readFileSync(hookPath, 'utf8');
        if (existing.includes(HOOK_MARKER)) {
            return { success: true, message: 'arven hook is already installed.', hookPath };
        }
        // Append to existing hook (e.g. husky already installed something)
        const appended = existing.trimEnd() + '\n\n' + buildHookScript();
        writeFileSync(hookPath, appended, 'utf8');
        chmodSync(hookPath, 0o755);
        return { success: true, message: 'Appended arven to existing pre-commit hook.', hookPath };
    }
    // Fresh install
    writeFileSync(hookPath, buildHookScript(), 'utf8');
    chmodSync(hookPath, 0o755);
    return { success: true, message: 'arven pre-commit hook installed.', hookPath };
}
/**
 * Remove the arven block from the pre-commit hook.
 * If arven was the only thing in the hook, delete the file entirely.
 */
export function uninstallHook(projectRoot = process.cwd()) {
    const gitDir = findGitDir(projectRoot);
    if (!gitDir) {
        return { success: false, message: 'No .git directory found.' };
    }
    const hookPath = join(gitDir, 'hooks', 'pre-commit');
    if (!existsSync(hookPath)) {
        return { success: false, message: 'No pre-commit hook found — nothing to uninstall.' };
    }
    const content = readFileSync(hookPath, 'utf8');
    if (!content.includes(HOOK_MARKER)) {
        return { success: false, message: 'arven hook marker not found in pre-commit hook.' };
    }
    // Remove lines from the marker onward (the arven block)
    const lines = content.split('\n');
    const markerIndex = lines.findIndex((l) => l.includes(HOOK_MARKER));
    const cleaned = lines.slice(0, markerIndex).join('\n').trimEnd();
    if (!cleaned || cleaned === '#!/bin/sh') {
        // Only arven was in the hook — remove the file
        unlinkSync(hookPath);
        return { success: true, message: 'pre-commit hook removed (arven was the only entry).' };
    }
    writeFileSync(hookPath, cleaned + '\n', 'utf8');
    return { success: true, message: 'arven removed from pre-commit hook.' };
}
//# sourceMappingURL=hookManager.js.map