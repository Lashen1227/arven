import { existsSync, readFileSync } from 'fs';
import type { ArvenConfig, EnvVariableContract } from '../types.js';

const EMPTY_CONFIG: ArvenConfig = { variables: {} };

function isContract(value: unknown): value is EnvVariableContract {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const contract = value as Record<string, unknown>;
  return ['required', 'secret'].every((key) =>
    contract[key] === undefined || typeof contract[key] === 'boolean'
  ) && ['description', 'example'].every((key) =>
    contract[key] === undefined || typeof contract[key] === 'string'
  );
}

/** Read and validate an optional arven contract file. */
export function loadArvenConfig(filePath: string): ArvenConfig {
  if (!existsSync(filePath)) return EMPTY_CONFIG;

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid JSON';
    throw new Error(`Could not parse ${filePath}: ${message}`);
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`${filePath} must contain a JSON object.`);
  }
  const variables = (parsed as Record<string, unknown>).variables;
  if (!variables || typeof variables !== 'object' || Array.isArray(variables)) {
    throw new Error(`${filePath} must contain a "variables" object.`);
  }

  for (const [name, contract] of Object.entries(variables)) {
    if (!/^[A-Z_][A-Z0-9_]*$/.test(name) || !isContract(contract)) {
      throw new Error(`${filePath} has an invalid contract for "${name}".`);
    }
  }

  return { variables: variables as Record<string, EnvVariableContract> };
}
