/**
 * Find the .git directory starting from cwd upward.
 */
export declare function findGitDir(from?: string): string | null;
/**
 * Install the arven pre-commit hook into .git/hooks/pre-commit.
 * If a hook already exists (from another tool), arven appends to it.
 */
export declare function installHook(projectRoot?: string): {
    success: boolean;
    message: string;
    hookPath: string;
};
/**
 * Remove the arven block from the pre-commit hook.
 * If arven was the only thing in the hook, delete the file entirely.
 */
export declare function uninstallHook(projectRoot?: string): {
    success: boolean;
    message: string;
};
//# sourceMappingURL=hookManager.d.ts.map