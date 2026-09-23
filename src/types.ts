/** Map of env var name → set of relative file paths where it was found */
export type ScanResult = Map<string, Set<string>>;

/** Map of category label → list of var names */
export type GroupedVars = Map<string, string[]>;

export interface GenerateOptions {
  output: string;
  root: string;
  overwrite: boolean;
  config: string;
}

export interface CheckOptions {
  root: string;
  example: string;
  config: string;
  requireMetadata: boolean;
}

export interface DiffOptions {
  root: string;
  example: string;
}

export interface EnvVariableContract {
  required?: boolean;
  description?: string;
  example?: string;
  secret?: boolean;
}

export interface ArvenConfig {
  variables: Record<string, EnvVariableContract>;
}

export interface SchemaOptions {
  root: string;
  output: string;
  overwrite: boolean;
}

export interface DiffSummary {
  missing: string[];
  unused: string[];
  synced: string[];
}

export interface GuardResult {
  missing: string[];
  blocked: boolean;
}
