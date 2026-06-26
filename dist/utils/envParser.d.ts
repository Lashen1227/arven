import type { GroupedVars } from '../types.js';
/**
 * Parse an existing .env.example and return declared var names.
 */
export declare function parseEnvExample(filePath: string): Set<string>;
/**
 * Group env var names into labelled categories.
 */
export declare function groupByCategory(varNames: string[]): GroupedVars;
/**
 * Render grouped vars into a formatted .env.example string.
 */
export declare function renderEnvExample(groups: GroupedVars): string;
//# sourceMappingURL=envParser.d.ts.map