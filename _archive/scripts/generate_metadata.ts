
import fs from 'fs';
import path from 'path';
import fm from 'front-matter';
import { calculateReadTime } from '../lib/utils';

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');
const OUTPUT_FILE = path.join(process.cwd(), 'lib', 'blog_metadata.json');

async function generateMetadata() {
  console.log('Generating blog metadata...');

  try {
    if (!fs.existsSync(POSTS_DIR)) {
      console.warn(`Directory not found: ${POSTS_DIR}`);
      return;
    }

    const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
    const metadata: Record<string, { readTime: number }> = {};

    console.log(`Processing ${files.length} posts...`);

    for (const file of files) {
      const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
      const parsed = fm<{ title: string }>(content);

      let slug = file.replace('.md', '');
      if (file.endsWith('.zh.md')) {
          slug = file.replace('.zh.md', '');
      } else if (file.endsWith('.es.md')) {
          slug = file.replace('.es.md', '');
      }

      const readTime = calculateReadTime(parsed.body);

      // If the slug already exists (e.g. from another language), we might overwrite.
      // Ideally, metadata might be language specific or keyed by file name.
      // However, looking at lib/knowledge.ts:
      // "slug" is derived from filename, but stripping .zh.md.
      // So 'foo.zh.md' and 'foo.md' have same slug 'foo'.
      // But they are separate objects in ALL_POSTS.

      // In lib/knowledge.ts:
      // const ALL_POSTS = ... .map(...)
      // return { slug, ..., language }

      // If I store by slug only, I might have collisions if readTime differs by language.
      // Let's store by filename to be safe and precise.
      // Then in lib/knowledge.ts, I can look up by filename (which I can reconstruct or extract).

      // Re-reading lib/knowledge.ts:
      // const filename = path.split('/').pop() || '';
      // ...

      // It uses filename to determine slug and language.
      // So if I key by filename, I can look it up easily.

      metadata[file] = { readTime };
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(metadata, null, 2));
    console.log(`Successfully wrote metadata for ${Object.keys(metadata).length} files to ${OUTPUT_FILE}`);

  } catch (err) {
    console.error('Failed to generate metadata:', err);
    process.exit(1);
  }
}

generateMetadata();
