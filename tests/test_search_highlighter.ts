
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
  it('returns original text if query is empty', () => {
    const input = "Hello World";
    const result = highlightNodes(input, "");
    assert.strictEqual(result, input);
  });

  it('returns original text if no match', () => {
    const input = "Hello World";
    const result = highlightNodes(input, "Foo");
    assert.strictEqual(result, input);
  });

  it('highlights matching text (case insensitive)', () => {
    const input = "Hello World";
    const result = highlightNodes(input, "hello");

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
    const query = ".map()"; // Should not be treated as "any char" + "map" + capture group

    const result = highlightNodes(input, query);
    assert(Array.isArray(result));

    const resArray = result as any[];
    const match = resArray.find(item => React.isValidElement(item) && item.type === 'mark');
    assert(match, "Should match literal string with special chars");
    assert.strictEqual(match.props.children, ".map()");
  });

  it('recursively highlights within arrays', () => {
    const input = ["Start ", "Hello World", " End"];
    const result = highlightNodes(input, "World");

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

    const result = highlightNodes(input, "World");

    // Result should be a cloned <p>
    assert(React.isValidElement(result));
    assert.strictEqual((result as React.ReactElement).type, 'p');

    const children = (result as React.ReactElement).props.children;
    assert(Array.isArray(children));

    // The second child should be the CLONED <strong> element.
    // Wait, why did the previous test fail with "actual: Symbol(react.fragment), expected: 'strong'"?

    // Debugging:
    // If "Bold World" matches "World", it returns an ARRAY: ["Bold ", <mark>World</mark>]
    // When `highlightNodes` sees an array as children, does it wrap it?

    // Implementation:
    // if (Array.isArray(nodes)) { return nodes.map(...) }  <-- Returns Array of Fragments

    // But here we are recursing on `nodes.props.children`.
    // In the `input` construction: `React.createElement('p', {}, ["Hello ", inner])`
    // The children of `p` is an array.
    // So `highlightNodes` is called on that ARRAY.
    // It returns an ARRAY of Fragments (because of the map).

    // So `React.cloneElement` receives `children` as an ARRAY of Fragments.

    // Let's look at `inner` (the <strong>).
    // It is an element. `highlightNodes` calls itself on `inner`.
    // Inside `highlightNodes(inner)`:
    // It's a valid element. It calls `React.cloneElement(inner, { children: highlightNodes("Bold World") })`.
    // "Bold World" splits into array. So `children` becomes an array.
    // It returns a cloned `strong` element.

    // So the result of `highlightNodes(["Hello ", inner])` is:
    // Map over array:
    // 0: "Hello " -> No match -> "Hello " -> Wrapped in Fragment? No.
    // Wait, let's look at implementation:
    // if (Array.isArray(nodes)) return nodes.map((node, i) => <React.Fragment key={i}>{highlightNodes(node, query)}</React.Fragment>);

    // YES! The implementation WRAPS every item in a Fragment if the input is an array.
    // So `children[1]` is NOT the `strong` element directly.
    // It is a `React.Fragment` containing the `strong` element.

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
    const result = highlightNodes(input, "Target");

    assert(React.isValidElement(result));
    assert.strictEqual(result.props.className, 'test-class');
    assert.strictEqual(result.props['data-id'], 123);
  });
});
