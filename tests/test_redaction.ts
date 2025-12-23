
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { redactSensitiveInfo } from '../lib/utils';

describe('redactSensitiveInfo', () => {
  it('should redact a simple secret', () => {
    const text = 'This is a SECRET_KEY in the text.';
    const secrets = ['SECRET_KEY'];
    const result = redactSensitiveInfo(text, secrets);
    assert.strictEqual(result, 'This is a [REDACTED] in the text.');
  });

  it('should redact multiple occurrences of the same secret', () => {
    const text = 'Key: SECRET_123. Again: SECRET_123.';
    const secrets = ['SECRET_123'];
    const result = redactSensitiveInfo(text, secrets);
    assert.strictEqual(result, 'Key: [REDACTED]. Again: [REDACTED].');
  });

  it('should redact multiple different secrets', () => {
    const text = 'Use API_KEY and DB_PASSWORD to connect.';
    const secrets = ['API_KEY', 'DB_PASSWORD'];
    const result = redactSensitiveInfo(text, secrets);
    assert.strictEqual(result, 'Use [REDACTED] and [REDACTED] to connect.');
  });

  it('should not redact secrets shorter than or equal to 4 characters', () => {
    // This is to avoid false positives like "the", "and", etc. if they accidentally get into secrets
    const text = 'The key is 1234.';
    const secrets = ['1234'];
    const result = redactSensitiveInfo(text, secrets);
    assert.strictEqual(result, 'The key is 1234.');
  });

  it('should escape special regex characters in secrets', () => {
    const text = 'This secret has special chars: a+b*c.';
    const secrets = ['a+b*c'];
    const result = redactSensitiveInfo(text, secrets);
    assert.strictEqual(result, 'This secret has special chars: [REDACTED].');
  });

  it('should handle null or undefined secrets in the array', () => {
    const text = 'My SECRET is safe.';
    // @ts-ignore
    const secrets = ['SECRET', null, undefined];
    const result = redactSensitiveInfo(text, secrets);
    assert.strictEqual(result, 'My [REDACTED] is safe.');
  });

  it('should return original text if secrets array is empty', () => {
    const text = 'Nothing to hide.';
    const secrets: string[] = [];
    const result = redactSensitiveInfo(text, secrets);
    assert.strictEqual(result, 'Nothing to hide.');
  });

  it('should return original text if text is empty or null', () => {
    assert.strictEqual(redactSensitiveInfo('', ['SECRET']), '');
    // @ts-ignore
    assert.strictEqual(redactSensitiveInfo(null, ['SECRET']), null);
  });

  it('should correctly handle overlapping secrets', () => {
     // If both "SUPER" and "SUPER_SECRET" are in the secrets list.
     // "SUPER" (5 chars) is > 4 chars, so it is valid for redaction.
     const text = 'SUPER_SECRET data.';
     const secrets = ['SUPER', 'SUPER_SECRET'];
     const result = redactSensitiveInfo(text, secrets);
     // Depending on order of execution, it might redact "SUPER" first -> "[REDACTED]_SECRET"
     // or "SUPER_SECRET" first -> "[REDACTED]"
     // The current implementation uses simple iteration, so order matters.
     // If 'SUPER' is processed first:
     // "SUPER_SECRET" -> "[REDACTED]_SECRET"

     // Note: The function does not sort secrets by length. It iterates in order.

     // Case 1: Substring first
     const result1 = redactSensitiveInfo('SUPER_SECRET', ['SUPER', 'SUPER_SECRET']);
     assert.strictEqual(result1, '[REDACTED]_SECRET');

     // Case 2: Superstring first
     const result2 = redactSensitiveInfo('SUPER_SECRET', ['SUPER_SECRET', 'SUPER']);
     // First pass replaces SUPER_SECRET -> [REDACTED]
     // Second pass looks for SUPER in [REDACTED], none found.
     assert.strictEqual(result2, '[REDACTED]');
  });
});
