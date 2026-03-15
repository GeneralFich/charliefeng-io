
import { test, describe, it } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { highlightNodes } from '../components/SearchHighlighter';

/**
 * Unit tests for the `highlightNodes` utility.
 *
 * Since `highlightNodes` returns React Nodes (objects), we inspect their structure
 * to verify correct highlighting logic without mounting a full DOM.
 */

describe('SearchHighlighter', () => {
  it('returns original text if regex is null', () => {
    const input = "Hello World";
    const result = highlightNodes(input, null);
    assert.strictEqual(result, input);
  });

  // Helper to create regex like the app does
  const createRegex = (query: string) => {
      // Escape special chars logic simplified for test
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`(${escaped})`, 'gi');
  }

  it('returns original text if no match', () => {
    const input = "Hello World";
    const regex = createRegex("Foo");
    const result = highlightNodes(input, regex);
    assert.strictEqual(result, input);
  });

  it('highlights matching text (case insensitive)', () => {
    const input = "Hello World";
    const regex = createRegex("hello");
    const result = highlightNodes(input, regex);

    // Result should be an array: [<mark>Hello</mark>, " World"]
    // Or ["", <mark>Hello</mark>, " World"] depending on split behavior.
    // 'Hello World'.split(/(Hello)/gi) -> ["", "Hello", " World"]

    assert(Array.isArray(result));
    const resArray = result as any[];

    // Verify structure
    // We expect the matching part to be a React Element (type 'mark')
    const match = resArray.find(item => React.isValidElement(item) && item.type === 'mark');
    assert(match, "Should contain a mark element");
    assert.strictEqual(match.props.children, "Hello");
  });

  it('handles regex special characters in query', () => {
    const input = "Use the .map() function";
    const regex = createRegex(".map()"); // Should match literal ".map()"

    const result = highlightNodes(input, regex);
    assert(Array.isArray(result));

    const resArray = result as any[];
    const match = resArray.find(item => React.isValidElement(item) && item.type === 'mark');
    assert(match, "Should match literal string with special chars");
    assert.strictEqual(match.props.children, ".map()");
  });

  it('recursively highlights within arrays', () => {
    const input = ["Start ", "Hello World", " End"];
    const regex = createRegex("World");
    const result = highlightNodes(input, regex);

    assert(Array.isArray(result));
    // The second item in the array should now be a Fragment containing the highlighted parts
    const middleItem = (result as any[])[1];

    // In the implementation: Case 2: Array -> map to Fragments
    assert(React.isValidElement(middleItem));
    assert.strictEqual(middleItem.type, React.Fragment);

    // Check children of the fragment
    // Note: accessing props.children on a Fragment object
    const fragmentChildren = middleItem.props.children;
    assert(Array.isArray(fragmentChildren));
    const match = fragmentChildren.find((item: any) => React.isValidElement(item) && item.type === 'mark');
    assert(match);
    assert.strictEqual(match.props.children, "World");
  });

  it('recursively highlights children of React Elements', () => {
    // Input: <p>Hello <strong>Bold World</strong></p>
    const inner = React.createElement('strong', {}, "Bold World");
    const input = React.createElement('p', {}, ["Hello ", inner]);
    const regex = createRegex("World");

    const result = highlightNodes(input, regex);

    // Result should be a cloned <p>
    assert(React.isValidElement(result));
    assert.strictEqual((result as React.ReactElement).type, 'p');

    const children = (result as React.ReactElement).props.children;
    assert(Array.isArray(children));

    const fragmentWrapper = children[1];
    assert.strictEqual(fragmentWrapper.type, React.Fragment);

    const strongEl = fragmentWrapper.props.children;
    assert(React.isValidElement(strongEl));
    assert.strictEqual(strongEl.type, 'strong');

    const strongChildren = strongEl.props.children;
    assert(Array.isArray(strongChildren));
    const match = strongChildren.find((item: any) => React.isValidElement(item) && item.type === 'mark');
    assert(match);
    assert.strictEqual(match.props.children, "World");
  });

  it('preserves component props', () => {
    const input = React.createElement('div', { className: 'test-class', 'data-id': 123 }, "Target content");
    const regex = createRegex("Target");
    const result = highlightNodes(input, regex);

    assert(React.isValidElement(result));
    assert.strictEqual(result.props.className, 'test-class');
    assert.strictEqual(result.props['data-id'], 123);
  });
});
