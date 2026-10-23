import { execFileSync } from 'child_process';

const MAX_INDEX_FILE_SIZE = 64 * 1024 * 1024;

/** Read a file from Git's index, or return null when it has no index entry. */
export function readGitIndexFile(gitRoot: string, repoRelativePath: string): string | null {
  try {
    return execFileSync('git', ['show', `:0:${repoRelativePath}`], {
      cwd: gitRoot,
      encoding: 'utf8',
      maxBuffer: MAX_INDEX_FILE_SIZE,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch (error) {
    let entry: Buffer;
    try {
      entry = execFileSync('git', [
        'ls-files', '--stage', '-z', '--', `:(literal)${repoRelativePath}`,
      ], { cwd: gitRoot, stdio: ['ignore', 'pipe', 'ignore'] });
    } catch (checkError) {
      const detail = checkError instanceof Error ? checkError.message : String(checkError);
      throw new Error(`Could not determine whether "${repoRelativePath}" is staged: ${detail}`);
    }

    if (entry.length === 0) return null;
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not read staged file "${repoRelativePath}" from Git's index: ${detail}`);
  }
}

/** Return whether a path is tracked in HEAD. An unborn repository has no HEAD. */
export function gitHeadHasFile(gitRoot: string, repoRelativePath: string): boolean {
  try {
    execFileSync('git', ['rev-parse', '--verify', 'HEAD'], {
      cwd: gitRoot,
      stdio: ['ignore', 'ignore', 'ignore'],
    });
  } catch {
    return false;
  }

  const entries = execFileSync('git', [
    'ls-tree', '-r', '-z', '--full-tree', 'HEAD', '--', `:(literal)${repoRelativePath}`,
  ], { cwd: gitRoot, stdio: ['ignore', 'pipe', 'ignore'] });
  return entries.length > 0;
}
