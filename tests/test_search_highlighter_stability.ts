
import { test, describe, it } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { highlightNodes } from '../components/SearchHighlighter';

describe('SearchHighlighter Performance', () => {
  const createRegex = (query: string) => new RegExp(`(${query})`, 'gi');

  it('returns original array reference if no match', () => {
    const input = ["Hello", "World"];
    const regex = createRegex("Foo");
    const result = highlightNodes(input, regex);
    assert.strictEqual(result, input, "Should return same array reference when no match");
  });

  it('returns original element reference if no match in children', () => {
    const inner = React.createElement('span', {}, "Hello");
    const input = React.createElement('div', {}, inner);
    const regex = createRegex("Foo");
    const result = highlightNodes(input, regex);
    assert.strictEqual(result, input, "Should return same element reference when no match");
  });
});
