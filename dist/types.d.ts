/** Map of env var name → set of relative file paths where it was found */
export type ScanResult = Map<string, Set<string>>;
/** Map of category label → list of var names */
export type GroupedVars = Map<string, string[]>;
export interface GenerateOptions {
    output: string;
    root: string;
    overwrite: boolean;
}
export interface CheckOptions {
    root: string;
    example: string;
}
export interface DiffOptions {
    root: string;
    example: string;
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
//# sourceMappingURL=types.d.ts.map