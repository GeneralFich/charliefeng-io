import { describe, it } from 'node:test';
import assert from 'node:assert';
import { escapeRegExp } from '../lib/utils';

/**
 * @fileoverview Tests for the pure logic used by hooks/useArticleSearch.ts
 *
 * The useArticleSearch hook contains three categories of pure logic:
 * 1. Regex creation from search queries (memoized via useMemo)
 * 2. Match navigation (next/prev with modular wraparound)
 * 3. Keyboard shortcut detection
 *
 * Since the hook tightly couples these with React state and DOM operations,
 * we test the underlying algorithms directly.
 */

// ── Match navigation logic ───────────────────────────────────────────────────
// Extracted from handleNextMatch / handlePrevMatch in useArticleSearch.ts:
//   next: (prev + 1) % totalMatches
//   prev: (prev - 1 + totalMatches) % totalMatches

function nextMatch(current: number, total: number): number {
  if (total === 0) return current;
  return (current + 1) % total;
}

function prevMatch(current: number, total: number): number {
  if (total === 0) return current;
  return (current - 1 + total) % total;
}

describe('Match navigation (next/prev)', () => {
  it('next wraps from last to first', () => {
    assert.strictEqual(nextMatch(4, 5), 0);
  });

  it('next increments normally', () => {
    assert.strictEqual(nextMatch(0, 5), 1);
    assert.strictEqual(nextMatch(2, 5), 3);
  });

  it('prev wraps from first to last', () => {
    assert.strictEqual(prevMatch(0, 5), 4);
  });

  it('prev decrements normally', () => {
    assert.strictEqual(prevMatch(3, 5), 2);
    assert.strictEqual(prevMatch(4, 5), 3);
  });

  it('handles single match (toggle to self)', () => {
    assert.strictEqual(nextMatch(0, 1), 0);
    assert.strictEqual(prevMatch(0, 1), 0);
  });

  it('no-ops when total is 0', () => {
    assert.strictEqual(nextMatch(-1, 0), -1);
    assert.strictEqual(prevMatch(-1, 0), -1);
  });
});

// ── Regex creation logic ─────────────────────────────────────────────────────
// From useArticleSearch: new RegExp(`(${escapeRegExp(query)})`, 'gi')

function createSearchRegex(query: string): RegExp | null {
  if (!query.trim()) return null;
  try {
    return new RegExp(`(${escapeRegExp(query)})`, 'gi');
  } catch {
    return null;
  }
}

describe('Search regex creation', () => {
  it('returns null for empty query', () => {
    assert.strictEqual(createSearchRegex(''), null);
  });

  it('returns null for whitespace-only query', () => {
    assert.strictEqual(createSearchRegex('   '), null);
  });

  it('creates case-insensitive regex', () => {
    const regex = createSearchRegex('Hello');
    assert.ok(regex);
    assert.ok(regex!.flags.includes('i'));
    assert.ok(regex!.flags.includes('g'));
  });

  it('matches text case-insensitively', () => {
    const regex = createSearchRegex('hello');
    assert.ok(regex!.test('HELLO world'));
  });

  it('escapes special regex characters', () => {
    const regex = createSearchRegex('.map()');
    assert.ok(regex);
    // Should match the literal string ".map()", not regex wildcards
    assert.ok(regex!.test('Use the .map() function'));
    assert.ok(!regex!.test('Use the xmapxy function'));
  });

  it('escapes brackets and pipes', () => {
    const regex = createSearchRegex('[foo|bar]');
    assert.ok(regex);
    assert.ok(regex!.test('test [foo|bar] test'));
  });

  it('handles regex quantifier characters', () => {
    const regex = createSearchRegex('a+b*c?');
    assert.ok(regex);
    assert.ok(regex!.test('match a+b*c? literally'));
  });
});
