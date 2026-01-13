
import { test } from 'node:test';
import assert from 'node:assert';
import { validateChatInput, MAX_NEW_MESSAGE_LENGTH } from '../lib/security';

test('Security Mismatch: Service layer should now BLOCK large payloads', () => {
  // UI limit is 2000
  const UI_LIMIT = 2000;

  // Create a message that is slightly larger than the limit
  const payload = 'a'.repeat(UI_LIMIT + 100);

  // Verify it fails the validation
  const result = validateChatInput([], payload);

  console.log(`Payload length: ${payload.length}`);
  console.log(`Service Limit (MAX_NEW_MESSAGE_LENGTH): ${MAX_NEW_MESSAGE_LENGTH}`);

  assert.strictEqual(result.valid, false, "Service layer should now block > 2000 chars");
  assert.strictEqual(MAX_NEW_MESSAGE_LENGTH, 2000, "Constant should be 2000");

  if (!result.valid) {
      console.log("✅ VULNERABILITY FIXED: Service layer correctly blocks oversized payloads.");
  }
});
