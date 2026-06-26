import type { ScanResult } from './types.js';
/**
 * Scan a directory for all env var usages.
 * @param rootDir - Directory to scan (default: current dir)
 * @returns Map of varName → Set of relative file paths
 */
export declare function scanEnvVars(rootDir?: string): Promise<ScanResult>;
/**
 * Scan only the staged files passed from the git pre-commit hook.
 * @param stagedFiles - List of absolute staged file paths
 * @param rootDir     - Project root (for relative path calculation)
 */
export declare function scanStagedFiles(stagedFiles: string[], rootDir?: string): Promise<ScanResult>;
//# sourceMappingURL=scanner.d.ts.map