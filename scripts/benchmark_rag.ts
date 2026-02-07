
import { getRelevantContext, BlogChunk } from '../lib/rag';
import { Language } from '../types';
import { magnitude } from '../lib/vector';

// Polyfill performance
const now = global.performance ? () => performance.now() : () => Date.now();

const VECTOR_SIZE = 768;
const CHUNK_COUNT = 50000;
const ITERATIONS = 20;

// Generate random vector
function randomVector(size: number): Float32Array {
  const vec = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    vec[i] = Math.random() - 0.5;
  }
  return vec;
}

// Generate dataset
console.log(`Generating ${CHUNK_COUNT} chunks...`);
const data: BlogChunk[] = [];
for (let i = 0; i < CHUNK_COUNT; i++) {
  const embedding = randomVector(VECTOR_SIZE);
  data.push({
    id: `chunk-${i}`,
    text: `Text for chunk ${i}`,
    url: `/post/${i}`,
    title: `Title ${i}`,
    publishedDate: '2023-01-01',
    embedding: embedding,
    _magnitude: magnitude(embedding),
    language: i % 2 === 0 ? Language.EN : Language.ZH
  });
}

// Pre-partition the data
const partitionedData: Record<Language, BlogChunk[]> = {
  [Language.EN]: [],
  [Language.ZH]: []
};

data.forEach(chunk => {
  const lang = (chunk.language as Language) || Language.EN;
  if (partitionedData[lang]) {
    partitionedData[lang].push(chunk);
  } else {
    partitionedData[Language.EN].push(chunk);
  }
});

// Mock embedder
const mockEmbedder = async (text: string) => {
  return Array.from(randomVector(VECTOR_SIZE));
};

async function runBenchmark() {
  console.log(`Running benchmark with ${ITERATIONS} iterations...`);

  // Test Array Input (Legacy/Baseline behavior simulation)
  console.log("Testing Array Input (Legacy)...");
  const startArray = now();
  for (let i = 0; i < ITERATIONS; i++) {
    const lang = i % 2 === 0 ? Language.EN : Language.ZH;
    await getRelevantContext('test query', 'fake-key', lang, mockEmbedder, data);
  }
  const endArray = now();
  const timeArray = endArray - startArray;

  console.log(`Array Input: ${timeArray.toFixed(2)}ms (${(timeArray/ITERATIONS).toFixed(2)}ms/call)`);

  // Test Map Input (Optimized)
  console.log("Testing Map Input (Optimized)...");
  const startMap = now();
  for (let i = 0; i < ITERATIONS; i++) {
    const lang = i % 2 === 0 ? Language.EN : Language.ZH;
    await getRelevantContext('test query', 'fake-key', lang, mockEmbedder, partitionedData);
  }
  const endMap = now();
  const timeMap = endMap - startMap;

  console.log(`Map Input: ${timeMap.toFixed(2)}ms (${(timeMap/ITERATIONS).toFixed(2)}ms/call)`);

  console.log(`Improvement: ${(timeArray / timeMap).toFixed(2)}x faster`);
}

runBenchmark().catch(console.error);
