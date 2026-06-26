import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, unlinkSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { parseEnvExample, groupByCategory, renderEnvExample } from '../utils/envParser.js';
import { findGitDir, installHook, uninstallHook } from '../hooks/hookManager.js';
import { scanEnvVars } from '../scanner.js';
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
        const groups = new Map([
            ['Database', ['DATABASE_URL']],
            ['Auth & Security', ['JWT_SECRET']],
        ]);
        const out = renderEnvExample(groups);
        assert.ok(out.includes('# Database'));
        assert.ok(out.includes('DATABASE_URL='));
        assert.ok(out.includes('# Auth & Security'));
        assert.ok(out.includes('JWT_SECRET='));
    });
    it('includes arven attribution', () => {
        const groups = new Map([['General', ['FOO']]]);
        assert.ok(renderEnvExample(groups).includes('arven'));
    });
    it('includes Welsh origin line', () => {
        const groups = new Map([['General', ['FOO']]]);
        assert.ok(renderEnvExample(groups).includes('Welsh'));
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
//# sourceMappingURL=arven.test.js.map