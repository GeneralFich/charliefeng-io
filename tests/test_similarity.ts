
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { cosineSimilarity, magnitude, dotProduct } from '../lib/vector';

describe('RAG Math Utilities', () => {
  describe('magnitude', () => {
    it('should calculate magnitude of a vector', () => {
      assert.strictEqual(magnitude([3, 4]), 5); // 3-4-5 triangle
      assert.strictEqual(magnitude([1, 0, 0]), 1);
      assert.strictEqual(magnitude([0, 0, 0]), 0);
    });

    it('should handle negative numbers', () => {
       assert.strictEqual(magnitude([-3, -4]), 5);
    });
  });

  describe('dotProduct', () => {
    it('should calculate dot product of two vectors', () => {
      assert.strictEqual(dotProduct([1, 2], [3, 4]), 11); // 1*3 + 2*4 = 3 + 8 = 11
      assert.strictEqual(dotProduct([1, 0], [0, 1]), 0); // Orthogonal
    });

    it('should handle negative numbers', () => {
       assert.strictEqual(dotProduct([-1, -2], [3, 4]), -11);
    });
  });

  describe('cosineSimilarity', () => {
    it('should calculate correct similarity', () => {
      const vecA = [1, 0, 0];
      const vecB = [1, 0, 0];
      assert.strictEqual(cosineSimilarity(vecA, vecB), 1);

      const vecC = [0, 1, 0];
      assert.strictEqual(cosineSimilarity(vecA, vecC), 0);

      const vecD = [1, 1, 0];
      // dot = 1, magA = 1, magD = sqrt(2). sim = 1/sqrt(2) ~= 0.7071
      const sim = cosineSimilarity(vecA, vecD);
      assert(Math.abs(sim - 0.70710678) < 0.0001);
    });

    it('should handle pre-calculated magnitudes', () => {
       const vecA = [3, 4];
       const vecB = [6, 8];
       // magnitudes are 5 and 10
       // dot = 18 + 32 = 50
       // sim = 50 / (5 * 10) = 1
       const sim = cosineSimilarity(vecA, vecB, 5, 10);
       assert.strictEqual(sim, 1);
    });

    it('should return 0 for zero vectors', () => {
       assert.strictEqual(cosineSimilarity([0, 0], [1, 1]), 0);
    });

    it('should return 0 for length mismatch', () => {
       assert.strictEqual(cosineSimilarity([1, 2], [1, 2, 3]), 0);
    });

    it('should return 0 for empty vectors', () => {
       assert.strictEqual(cosineSimilarity([], []), 0);
    });

    it('should return 0 if one magnitude is 0', () => {
        // even if not empty, if magnitude is 0 (all zeros), it should handle it
        assert.strictEqual(cosineSimilarity([0, 0, 0], [1, 2, 3]), 0);
    });
  });
});
