export { scanEnvVars, scanStagedFiles } from './scanner.js';
export { parseEnvExample, groupByCategory, renderEnvExample } from './utils/envParser.js';
export { installHook, uninstallHook, findGitDir } from './hooks/hookManager.js';
export { renderZodOutput, renderTsOutput } from './utils/codegenRenderer.js';
export type {
  ScanResult,
  GroupedVars,
  GenerateOptions,
  CheckOptions,
  DiffOptions,
  DiffSummary,
  GuardResult,
  CodegenOptions,
} from './types.js';
