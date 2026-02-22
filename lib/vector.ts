/**
 * @fileoverview Vector Math Utilities
 *
 * This module provides generic vector operations used for semantic similarity calculations.
 *
 * Why: Extracting these pure math functions allows for better testing and reuse
 * independent of the RAG implementation details.
 */

/**
 * Calculates the magnitude (Euclidean norm) of a vector.
 * @param vec - The vector.
 * @returns The magnitude.
 */
export function magnitude(vec: ArrayLike<number>): number {
  let sum = 0;
  for (let i = 0; i < vec.length; i++) {
    sum += vec[i] * vec[i];
  }
  return Math.sqrt(sum);
}

/**
 * Calculates the dot product of two vectors.
 * @param vecA - The first vector.
 * @param vecB - The second vector.
 * @returns The dot product.
 */
export function dotProduct(vecA: ArrayLike<number>, vecB: ArrayLike<number>): number {
  let product = 0;
  for (let i = 0; i < vecA.length; i++) {
    product += vecA[i] * vecB[i];
  }
  return product;
}

/**
 * Calculates the cosine similarity between two vectors.
 *
 * Cosine similarity measures the cosine of the angle between two non-zero vectors.
 * It is a judgment of orientation and not magnitude: two vectors with the same orientation
 * have a cosine similarity of 1, two vectors oriented at 90° relative to each other have
 * a similarity of 0, and two vectors diametrically opposed have a similarity of -1.
 *
 * In the context of semantic search, a higher cosine similarity indicates that two text
 * embeddings are semantically closer.
 *
 * @param vecA - The first vector (e.g., query embedding).
 * @param vecB - The second vector (e.g., document chunk embedding).
 * @param magA - Optional pre-calculated magnitude of vecA.
 * @param magB - Optional pre-calculated magnitude of vecB.
 * @returns A number between -1 and 1 representing the similarity.
 *          Returns 0 if dimensions mismatch or magnitude is zero to prevent errors.
 */
export function cosineSimilarity(vecA: ArrayLike<number>, vecB: ArrayLike<number>, magA?: number, magB?: number): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;

  const dot = dotProduct(vecA, vecB);
  const mA = magA ?? magnitude(vecA);
  const mB = magB ?? magnitude(vecB);

  if (mA === 0 || mB === 0) return 0;

  return dot / (mA * mB);
}
