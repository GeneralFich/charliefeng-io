
import fs from 'fs';
import path from 'path';
import fm from 'front-matter';
import { calculateReadTime } from '../lib/utils';
import { performance } from 'perf_hooks';

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');
const METADATA_FILE = path.join(process.cwd(), 'lib', 'blog_metadata.json');

async function benchmark() {
  console.log('Starting benchmark comparison...');

  try {
    const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
    const posts: { filename: string, body: string }[] = [];

    // Pre-load content
    for (const file of files) {
      const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
      const parsed = fm(content);
      posts.push({ filename: file, body: parsed.body });
    }

    // Load metadata
    const metadataRaw = fs.readFileSync(METADATA_FILE, 'utf-8');
    const metadata = JSON.parse(metadataRaw);

    console.log(`Loaded ${posts.length} posts and metadata.`);

    const iterations = 10000;

    // --- Legacy: Calculate Every Time ---
    const startLegacy = performance.now();
    for (let i = 0; i < iterations; i++) {
        for (const post of posts) {
            calculateReadTime(post.body);
        }
    }
    const endLegacy = performance.now();
    const timeLegacy = endLegacy - startLegacy;

    // --- Optimized: Lookup ---
    const startOptimized = performance.now();
    for (let i = 0; i < iterations; i++) {
        for (const post of posts) {
             const m = metadata[post.filename];
             // Fallback logic simulation (though in this case metadata should exist)
             if (m) {
                 const _ = m.readTime;
             } else {
                 calculateReadTime(post.body);
             }
        }
    }
    const endOptimized = performance.now();
    const timeOptimized = endOptimized - startOptimized;

    console.log(`\nResults (${iterations} iterations):`);
    console.log(`Legacy (Calculation): ${timeLegacy.toFixed(2)}ms`);
    console.log(`Optimized (Lookup):   ${timeOptimized.toFixed(2)}ms`);

    const speedup = timeLegacy / timeOptimized;
    console.log(`\nSpeedup: ${speedup.toFixed(2)}x`);

    const perStartupLegacy = timeLegacy / iterations;
    const perStartupOptimized = timeOptimized / iterations;

    console.log(`\nTime per "startup":`);
    console.log(`Legacy:    ${perStartupLegacy.toFixed(4)}ms`);
    console.log(`Optimized: ${perStartupOptimized.toFixed(4)}ms`);

  } catch (err) {
    console.error('Benchmark failed:', err);
  }
}

benchmark();
