import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, unlinkSync, mkdirSync, mkdtempSync, rmSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { runInNewContext } from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { z } from 'zod';
import { parseEnvExample, groupByCategory, renderEnvExample } from '../utils/envParser.js';
import { loadArvenConfig } from '../utils/configParser.js';
import { findGitDir, installHook, uninstallHook } from '../hooks/hookManager.js';
import { scanEnvVars } from '../scanner.js';
import { schema } from '../commands/schema.js';
import { codegen } from '../commands/codegen.js';
import { renderZodOutput, renderTsOutput } from '../utils/codegenRenderer.js';
import type { GroupedVars, ArvenConfig } from '../types.js';

function runGenerated(source: string, env: Record<string, string | undefined>, errors: string[] = []): Record<string, unknown> {
  const javascript = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  });
  assert.deepEqual(javascript.diagnostics, []);
  const exports: Record<string, unknown> = {};
  runInNewContext(javascript.outputText, {
    exports,
    require: (name: string) => {
      assert.equal(name, 'zod');
      return { z };
    },
    process: { env, exit: (code: number) => { throw new Error(`process.exit(${code})`); } },
    console: { error: (message: string) => errors.push(message) },
  });
  return exports.env as Record<string, unknown>;
}

// ─── parseEnvExample ──────────────────────────────────────────────────────────

describe('parseEnvExample', () => {
  it('parses var names correctly', () => {
    const f = join(tmpdir(), 'arven-test1.env');
    writeFileSync(f, '# DB\nDATABASE_URL=\nDB_HOST=\n# Auth\nJWT_SECRET=\n');
    const vars = parseEnvExample(f);
    assert.ok(vars.has('DATABASE_URL'));
    assert.ok(vars.has('DB_HOST'));
    assert.ok(vars.has('JWT_SECRET'));
    assert.equal(vars.size, 3);
    unlinkSync(f);
  });

  it('skips comments and blank lines', () => {
    const f = join(tmpdir(), 'arven-test2.env');
    writeFileSync(f, '# comment\nPORT=\n\nAPI_KEY=\n');
    const vars = parseEnvExample(f);
    assert.ok(!vars.has('# comment'));
    assert.ok(vars.has('PORT'));
    assert.ok(vars.has('API_KEY'));
    assert.equal(vars.size, 2);
    unlinkSync(f);
  });

  it('handles values with equals signs', () => {
    const f = join(tmpdir(), 'arven-test3.env');
    writeFileSync(f, 'DATABASE_URL=postgres://user:pass@host/db\nJWT_SECRET=\n');
    const vars = parseEnvExample(f);
    assert.ok(vars.has('DATABASE_URL'));
    assert.ok(vars.has('JWT_SECRET'));
    assert.equal(vars.size, 2);
    unlinkSync(f);
  });

  it('returns empty set for missing file', () => {
    assert.equal(parseEnvExample('/non/existent/.env.example').size, 0);
  });
});

// ─── groupByCategory ─────────────────────────────────────────────────────────

describe('groupByCategory', () => {
  it('groups database vars', () => {
    const g = groupByCategory(['DATABASE_URL', 'DB_HOST', 'REDIS_URL']);
    assert.ok(g.has('Database'));
    assert.equal(g.get('Database')?.length, 3);
  });

  it('groups AI vars', () => {
    const g = groupByCategory(['OPENAI_API_KEY', 'ANTHROPIC_API_KEY']);
    assert.ok(g.has('AI / LLM'));
  });

  it('groups auth vars', () => {
    const g = groupByCategory(['JWT_SECRET', 'SESSION_SECRET']);
    assert.ok(g.has('Auth & Security'));
  });

  it('groups payment vars', () => {
    const g = groupByCategory(['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET']);
    assert.ok(g.has('Payments'));
  });

  it('falls back to General for unknowns', () => {
    const g = groupByCategory(['MY_WEIRD_VAR']);
    assert.ok(g.has('General'));
    assert.ok(g.get('General')?.includes('MY_WEIRD_VAR'));
  });

  it('handles empty input', () => {
    assert.equal(groupByCategory([]).size, 0);
  });
});

// ─── renderEnvExample ────────────────────────────────────────────────────────

describe('renderEnvExample', () => {
  it('renders headers and keys', () => {
    const groups: GroupedVars = new Map([
      ['Database',       ['DATABASE_URL']],
      ['Auth & Security', ['JWT_SECRET']],
    ]);
    const out = renderEnvExample(groups);
    assert.ok(out.includes('# Database'));
    assert.ok(out.includes('DATABASE_URL='));
    assert.ok(out.includes('# Auth & Security'));
    assert.ok(out.includes('JWT_SECRET='));
  });

  it('includes arven attribution', () => {
    const groups: GroupedVars = new Map([['General', ['FOO']]]);
    assert.ok(renderEnvExample(groups).includes('arven'));
  });

  it('includes Welsh origin line', () => {
    const groups: GroupedVars = new Map([['General', ['FOO']]]);
    assert.ok(renderEnvExample(groups).includes('Welsh'));
  });

  it('renders contract metadata and never writes secret examples', () => {
    const out = renderEnvExample(new Map([['Payments', ['STRIPE_SECRET_KEY']]]), {
      variables: {
        STRIPE_SECRET_KEY: {
          required: true,
          description: 'Stripe API credential',
          example: 'must-not-appear',
          secret: true,
        },
      },
    });
    assert.ok(out.includes('# Stripe API credential'));
    assert.ok(out.includes('# Required'));
    assert.ok(out.includes('STRIPE_SECRET_KEY='));
    assert.ok(!out.includes('must-not-appear'));
  });
});

describe('loadArvenConfig', () => {
  it('loads a valid variable contract', () => {
    const f = join(tmpdir(), `arven-config-${Date.now()}.json`);
    writeFileSync(f, JSON.stringify({ variables: { API_KEY: { required: false, description: 'API access' } } }));
    const config = loadArvenConfig(f);
    assert.equal(config.variables.API_KEY?.required, false);
    assert.equal(config.variables.API_KEY?.description, 'API access');
    unlinkSync(f);
  });

  it('rejects malformed contracts', () => {
    const f = join(tmpdir(), `arven-invalid-config-${Date.now()}.json`);
    writeFileSync(f, JSON.stringify({ variables: { API_KEY: { required: 'yes' } } }));
    assert.throws(() => loadArvenConfig(f), /invalid contract/);
    unlinkSync(f);
  });
});

// ─── scanEnvVars ─────────────────────────────────────────────────────────────

describe('scanEnvVars', () => {
  it('detects process.env vars', async () => {
    const dir = join(tmpdir(), `arven-scan-${Date.now()}`);
    mkdirSync(dir);
    writeFileSync(join(dir, 'server.ts'), 'const p = process.env.MY_API_KEY;\n');

    const result = await scanEnvVars(dir);
    assert.ok(result.has('MY_API_KEY'));

    rmSync(dir, { recursive: true });
  });

  it('detects import.meta.env vars', async () => {
    const dir = join(tmpdir(), `arven-scan2-${Date.now()}`);
    mkdirSync(dir);
    writeFileSync(join(dir, 'app.ts'), 'const k = import.meta.env.VITE_API_URL;\n');

    const result = await scanEnvVars(dir);
    assert.ok(result.has('VITE_API_URL'));

    rmSync(dir, { recursive: true });
  });

  it('excludes built-in NODE_ENV', async () => {
    const dir = join(tmpdir(), `arven-scan3-${Date.now()}`);
    mkdirSync(dir);
    writeFileSync(join(dir, 'app.ts'), 'const e = process.env.NODE_ENV;\n');

    const result = await scanEnvVars(dir);
    assert.ok(!result.has('NODE_ENV'));

    rmSync(dir, { recursive: true });
  });
});

describe('schema', () => {
  it('generates a contract for discovered variables', async () => {
    const dir = join(tmpdir(), `arven-schema-${Date.now()}`);
    const output = join(dir, '.arvenrc.json');
    mkdirSync(dir);
    writeFileSync(join(dir, 'server.ts'), 'const key = process.env.SERVICE_API_KEY;\n');

    await schema({ root: dir, output, overwrite: false });

    const config = loadArvenConfig(output);
    assert.equal(config.variables.SERVICE_API_KEY?.required, true);
    assert.equal(config.variables.SERVICE_API_KEY?.description, '');
    rmSync(dir, { recursive: true });
  });
});

// ─── hookManager ─────────────────────────────────────────────────────────────

describe('hookManager', () => {
  it('findGitDir returns null outside a git repo', () => {
    assert.equal(findGitDir('/tmp'), null);
  });

  it('installHook fails gracefully outside git repo', () => {
    const dir = join(tmpdir(), `arven-hook-${Date.now()}`);
    mkdirSync(dir);
    const result = installHook(dir);
    assert.equal(result.success, false);
    assert.ok(result.message.includes('.git'));
    rmSync(dir, { recursive: true });
  });

  it('installHook installs correctly in a fake git repo', () => {
    const dir = join(tmpdir(), `arven-gitrepo-${Date.now()}`);
    mkdirSync(join(dir, '.git', 'hooks'), { recursive: true });

    const install = installHook(dir);
    assert.equal(install.success, true);

    const uninstallResult = uninstallHook(dir);
    assert.equal(uninstallResult.success, true);

    rmSync(dir, { recursive: true });
  });
});

// ─── renderZodOutput ──────────────────────────────────────────────────────────

describe('renderZodOutput', () => {
  const makeConfig = (overrides: Record<string, object> = {}): ArvenConfig => ({
    variables: overrides as ArvenConfig['variables'],
  });

  it('produces a valid zod import and schema object', () => {
    const cats: GroupedVars = new Map([['General', ['MY_VAR']]]);
    const out = renderZodOutput(['MY_VAR'], makeConfig(), cats);
    assert.ok(out.includes("import { z } from 'zod'"));
    assert.ok(out.includes('_schema = z.object('));
    assert.ok(out.includes('MY_VAR'));
    assert.ok(out.includes('export const env'));
    assert.ok(out.includes('export type Env'));
  });

  it('uses z.coerce.number() for PORT-style vars', () => {
    const cats: GroupedVars = new Map([['Server', ['PORT']]]);
    const out = renderZodOutput(['PORT'], makeConfig(), cats);
    assert.ok(out.includes('z.coerce.number()'));
  });

  it('uses z.string().url() for URL-suffixed vars', () => {
    const cats: GroupedVars = new Map([['Database', ['DATABASE_URL']]]);
    const out = renderZodOutput(['DATABASE_URL'], makeConfig(), cats);
    assert.ok(out.includes('z.string().url()'));
  });

  it('uses z.enum for boolean-flag vars', () => {
    const cats: GroupedVars = new Map([['General', ['ENABLE_FEATURE']]]);
    const out = renderZodOutput(['ENABLE_FEATURE'], makeConfig(), cats);
    assert.ok(out.includes("z.enum(['true', 'false'])"));
  });

  it('marks optional when required === false', () => {
    const cats: GroupedVars = new Map([['General', ['OPTIONAL_VAR']]]);
    const cfg = makeConfig({ OPTIONAL_VAR: { required: false } });
    const out = renderZodOutput(['OPTIONAL_VAR'], cfg, cats);
    assert.ok(out.includes('.optional()'));
  });

  it('includes description as inline comment', () => {
    const cats: GroupedVars = new Map([['Auth & Security', ['JWT_SECRET']]]);
    const cfg = makeConfig({ JWT_SECRET: { description: 'Signing secret', required: true } });
    const out = renderZodOutput(['JWT_SECRET'], cfg, cats);
    assert.ok(out.includes('// Signing secret'));
  });

  it('keeps descriptions with line breaks on one comment line', () => {
    const cfg = makeConfig({ TOKEN: { description: 'first\r\nsecond\rthird\nfourth\u2028fifth\u2029last' } });
    const out = renderZodOutput(['TOKEN'], cfg, new Map());
    assert.match(out, /\/\/ first second third fourth fifth last/);
    assert.equal(runGenerated(out, { TOKEN: 'value' }).TOKEN, 'value');
  });

  it('treats empty numeric values like the TypeScript validator', () => {
    const names = ['PORT', 'TIMEOUT'];
    const cfg = makeConfig({ TIMEOUT: { required: false } });
    for (const render of [renderZodOutput, renderTsOutput]) {
      const out = render(names, cfg, new Map());
      assert.throws(() => runGenerated(out, { PORT: '', TIMEOUT: '1' }));
      assert.throws(() => runGenerated(out, { TIMEOUT: '1' }));
      const empty = runGenerated(out, { PORT: '42', TIMEOUT: '' });
      assert.equal(empty.PORT, 42);
      assert.equal(empty.TIMEOUT, undefined);
      assert.equal(runGenerated(out, { PORT: '  ', TIMEOUT: ' ' }).TIMEOUT, 0);
      assert.throws(() => runGenerated(out, { PORT: 'not-a-number' }));
    }
  });

  it('infers numeric and boolean types only from the supported patterns', () => {
    const names = ['PORT', 'PORT_HTTP', 'WEB_PORT', 'TIMEOUT_MS', 'MAX_COUNT', 'CACHE_TTL',
      'PORTAL_URL', 'RETRYABLE', 'TTLISH', 'DEBUG', 'SSL_CERT_FILE', 'ALLOW_ORIGINS',
      'FEATURE_NAME', 'ENABLE_CACHE', 'DISABLE_CACHE', 'USE_CACHE', 'IS_READY'];
    const zodOutput = renderZodOutput(names, makeConfig(), new Map());
    const tsOutput = renderTsOutput(names, makeConfig(), new Map());
    const line = (output: string, name: string) => output.split('\n').find((item) => item.trimStart().startsWith(`${name}:`))!;
    for (const name of ['PORT', 'PORT_HTTP', 'WEB_PORT', 'TIMEOUT_MS', 'MAX_COUNT', 'CACHE_TTL']) {
      assert.match(line(zodOutput, name), /z\.coerce\.number\(\)/);
      assert.match(line(tsOutput, name), /number/);
    }
    for (const name of ['ENABLE_CACHE', 'DISABLE_CACHE', 'USE_CACHE', 'IS_READY']) {
      assert.match(line(zodOutput, name), /z\.enum/);
    }
    for (const name of ['PORTAL_URL', 'RETRYABLE', 'TTLISH', 'DEBUG', 'SSL_CERT_FILE', 'ALLOW_ORIGINS', 'FEATURE_NAME']) {
      assert.doesNotMatch(line(zodOutput, name), /z\.coerce\.number|z\.enum/);
      assert.match(line(tsOutput, name), /string/);
    }
    assert.match(line(zodOutput, 'PORTAL_URL'), /z\.string\(\)\.url\(\)/);
  });

  it('includes arven header comment', () => {
    const cats: GroupedVars = new Map([['General', ['FOO']]]);
    const out = renderZodOutput(['FOO'], makeConfig(), cats);
    assert.ok(out.includes('Generated by arven'));
  });

  it('reports only the relevant error headers for missing and invalid values', () => {
    const out = renderTsOutput(['PORT', 'API_KEY'], makeConfig(), new Map());
    for (const [env, missing, invalid] of [
      [{ PORT: 'oops', API_KEY: 'key' }, false, true],
      [{ PORT: '42' }, true, false],
      [{ PORT: 'oops' }, true, true],
    ] as const) {
      const errors: string[] = [];
      assert.throws(() => runGenerated(out, env, errors), /process.exit\(1\)/);
      const message = errors.join('\n');
      assert.equal(message.includes('Missing required environment variables'), missing);
      assert.equal(message.includes('Invalid numeric environment variables'), invalid);
      assert.match(message, /Check your environment variables/);
    }
  });

  it('groups vars with category comments', () => {
    const cats: GroupedVars = new Map([
      ['Database', ['DB_URL']],
      ['Auth & Security', ['JWT_SECRET']],
    ]);
    const out = renderZodOutput(['DB_URL', 'JWT_SECRET'], makeConfig(), cats);
    assert.ok(out.includes('// Database'));
    assert.ok(out.includes('// Auth & Security'));
  });
});

// ─── renderTsOutput ───────────────────────────────────────────────────────────

describe('renderTsOutput', () => {
  const makeConfig = (overrides: Record<string, object> = {}): ArvenConfig => ({
    variables: overrides as ArvenConfig['variables'],
  });

  it('produces an Env interface and validateEnv function', () => {
    const cats: GroupedVars = new Map([['General', ['MY_VAR']]]);
    const out = renderTsOutput(['MY_VAR'], makeConfig(), cats);
    assert.ok(out.includes('export interface Env'));
    assert.ok(out.includes('MY_VAR'));
    assert.ok(out.includes('export const env'));
    assert.ok(out.includes('validateEnv()'));
  });

  it('uses number type for PORT-style vars', () => {
    const cats: GroupedVars = new Map([['Server', ['PORT']]]);
    const out = renderTsOutput(['PORT'], makeConfig(), cats);
    assert.ok(out.includes('PORT:') && out.includes('number'));
  });

  it('marks optional vars with | undefined', () => {
    const cats: GroupedVars = new Map([['General', ['OPT_VAR']]]);
    const cfg = makeConfig({ OPT_VAR: { required: false } });
    const out = renderTsOutput(['OPT_VAR'], cfg, cats);
    assert.ok(out.includes('| undefined'));
  });

  it('does not add missing-check for optional vars', () => {
    const cats: GroupedVars = new Map([['General', ['OPT_VAR']]]);
    const cfg = makeConfig({ OPT_VAR: { required: false } });
    const out = renderTsOutput(['OPT_VAR'], cfg, cats);
    // Optional vars should not appear in the missing.push() block
    assert.ok(!out.includes("missing.push('OPT_VAR')"));
  });

  it('adds missing-check for required vars', () => {
    const cats: GroupedVars = new Map([['General', ['REQ_VAR']]]);
    const out = renderTsOutput(['REQ_VAR'], makeConfig(), cats);
    assert.ok(out.includes("missing.push('REQ_VAR')"));
  });

  it('has no external imports', () => {
    const cats: GroupedVars = new Map([['General', ['SOME_VAR']]]);
    const out = renderTsOutput(['SOME_VAR'], makeConfig(), cats);
    assert.ok(!out.includes("from '"));
  });

  it('includes arven header comment', () => {
    const cats: GroupedVars = new Map([['General', ['FOO']]]);
    const out = renderTsOutput(['FOO'], makeConfig(), cats);
    assert.ok(out.includes('Generated by arven'));
  });
});

// ─── codegen command (integration) ───────────────────────────────────────────

describe('codegen command', () => {
  it('creates nested output directories and drops references found only in the output', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'arven-codegen-regenerate-'));
    try {
      const output = join(dir, 'generated', 'nested', 'env.ts');
      mkdirSync(join(dir, 'src'));
      const source = join(dir, 'src', 'env.ts');
      writeFileSync(source, 'process.env.SHARED; process.env.STALE;\n');
      const options = { root: dir, output, overwrite: true, config: '.arvenrc.json', format: 'ts' as const };
      await codegen(options);
      assert.match(readFileSync(output, 'utf8'), /STALE/);

      writeFileSync(source, 'process.env.SHARED; process.env.NEW_VALUE;\n');
      await codegen(options);
      const regenerated = readFileSync(output, 'utf8');
      assert.match(regenerated, /SHARED/);
      assert.match(regenerated, /NEW_VALUE/);
      assert.doesNotMatch(regenerated, /STALE/);

      writeFileSync(source, '// no remaining references\n');
      await codegen(options);
      const empty = readFileSync(output, 'utf8');
      assert.doesNotMatch(empty, /SHARED|NEW_VALUE/);
      assert.match(empty, /export interface Env/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('reports directory creation failures cleanly', () => {
    const dir = mkdtempSync(join(tmpdir(), 'arven-codegen-directory-'));
    try {
      writeFileSync(join(dir, 'app.ts'), 'process.env.API_KEY;\n');
      writeFileSync(join(dir, 'blocker'), 'not a directory');
      const cli = fileURLToPath(new URL('../bin/arven.js', import.meta.url));
      const result = spawnSync(process.execPath, [cli, 'codegen', '--root', dir, '--output', join(dir, 'blocker', 'env.ts'), '--format', 'ts'], { encoding: 'utf8' });
      assert.equal(result.status, 1);
      assert.match(result.stdout, /Could not create output directory/);
      assert.doesNotMatch(result.stderr, /Error:/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('generates a ts validator file with --format ts', async () => {
    const dir    = join(tmpdir(), `arven-codegen-${Date.now()}`);
    const output = join(dir, 'env.ts');
    mkdirSync(dir);
    writeFileSync(join(dir, 'server.ts'), 'const k = process.env.API_SECRET;\n');

    await codegen({
      root:      dir,
      output,
      overwrite: false,
      config:    join(dir, '.arvenrc.json'), // non-existent → empty config
      format:    'ts',
    });

    const content = readFileSync(output, 'utf8');
    assert.ok(content.includes('export interface Env'));
    assert.ok(content.includes('API_SECRET'));
    assert.ok(content.includes('export const env'));

    rmSync(dir, { recursive: true });
  });

  it('refuses to overwrite without --overwrite flag', async () => {
    const dir    = join(tmpdir(), `arven-codegen-ow-${Date.now()}`);
    const output = join(dir, 'env.ts');
    mkdirSync(dir);
    writeFileSync(join(dir, 'server.ts'), 'const k = process.env.SOME_KEY;\n');
    writeFileSync(output, '// existing file\n');

    let exited = false;
    const origExit = process.exit.bind(process);
    (process as NodeJS.Process & { exit: (code?: number) => never }).exit = ((code?: number) => {
      exited = true;
      throw new Error(`process.exit(${code})`);
    }) as typeof process.exit;

    try {
      await codegen({
        root: dir, output, overwrite: false,
        config: join(dir, '.arvenrc.json'), format: 'ts',
      });
    } catch {
      // expected — the exit throws
    } finally {
      (process as NodeJS.Process & { exit: (code?: number) => never }).exit = origExit as typeof process.exit;
    }

    assert.ok(exited, 'process.exit should have been called');
    // Original file must be untouched
    assert.equal(readFileSync(output, 'utf8'), '// existing file\n');

    rmSync(dir, { recursive: true });
  });

  it('respects contract metadata from .arvenrc.json in ts format', async () => {
    const dir    = join(tmpdir(), `arven-codegen-cfg-${Date.now()}`);
    const output = join(dir, 'env.ts');
    const cfgPath = join(dir, '.arvenrc.json');
    mkdirSync(dir);
    writeFileSync(join(dir, 'app.ts'), 'const x = process.env.WEBHOOK_PORT;\n');
    writeFileSync(cfgPath, JSON.stringify({
      variables: {
        WEBHOOK_PORT: { required: true, description: 'Webhook listener port' },
      },
    }));

    await codegen({ root: dir, output, overwrite: false, config: cfgPath, format: 'ts' });

    const content = readFileSync(output, 'utf8');
    // PORT-like name → number type in ts format
    assert.ok(content.includes('number'));
    assert.ok(content.includes('WEBHOOK_PORT'));

    rmSync(dir, { recursive: true });
  });
});
