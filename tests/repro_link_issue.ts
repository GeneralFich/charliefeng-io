import assert from 'assert';

// Simulating the FIXED logic in components/ChatMessage.tsx

function getLinkProps(href: string) {
  // New fixed logic:
  const isInternal = href.startsWith('/') && !href.startsWith('//');
  const isSafe = href.startsWith('http') || href.startsWith('mailto') || isInternal;

  const target = isInternal ? undefined : "_blank";

  return { isSafe, target, isInternal };
}

console.log("Testing Link Logic (FIXED)...");

// Case 1: Normal internal link
const internal = getLinkProps('/essays/test');
console.log('Internal:', internal);
assert.strictEqual(internal.target, undefined, 'Internal link should be same tab');
assert.strictEqual(internal.isInternal, true, 'Internal link should be marked internal');

// Case 2: Normal external link
const external = getLinkProps('https://google.com');
console.log('External:', external);
assert.strictEqual(external.target, '_blank', 'External link should be _blank');

// Case 3: Protocol-relative URL (Should now be external)
const protocolRelative = getLinkProps('//google.com');
console.log('Protocol Relative (//google.com):', protocolRelative);

if (protocolRelative.target === '_blank') {
    console.log("✅ Secure: //google.com is treated as external.");
} else {
    console.error("⚠️  VULNERABILITY STILL EXISTS");
    process.exit(1);
}
