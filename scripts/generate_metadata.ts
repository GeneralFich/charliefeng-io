
import fs from 'fs';
import path from 'path';
import fm from 'front-matter';
import { calculateReadTime } from '../lib/utils';

interface PostAttributes {
  title: string;
  date: string;
  author: string;
  description: string;
}

interface BlogPostMeta {
  slug: string;
  filename: string;
  attributes: PostAttributes;
  readTime: number;
  dateTimestamp: number;
  language: string;
}

interface SearchIndexEntry {
  slug: string;
  language: string;
  title: string;
  description: string;
  body: string;
}

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');
const METADATA_FILE = path.join(process.cwd(), 'lib', 'blog_metadata.json');
const SEARCH_INDEX_FILE = path.join(process.cwd(), 'lib', 'blog_search_index.json');

async function generateMetadata() {
  console.log('Generating blog metadata and search index...');

  try {
    if (!fs.existsSync(POSTS_DIR)) {
      console.warn(`Directory not found: ${POSTS_DIR}`);
      return;
    }

    const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
    const metadata: BlogPostMeta[] = [];
    const searchIndex: SearchIndexEntry[] = [];

    console.log(`Processing ${files.length} posts...`);

    for (const file of files) {
      const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
      const parsed = fm<PostAttributes>(content);

      let language = 'en';
      let slug = file.replace('.md', '');

      if (file.endsWith('.zh.md')) {
        language = 'zh';
        slug = file.replace('.zh.md', '');
      }

      const readTime = calculateReadTime(parsed.body);

      metadata.push({
        slug,
        filename: file,
        attributes: parsed.attributes,
        readTime,
        dateTimestamp: new Date(parsed.attributes.date).getTime(),
        language,
      });

      searchIndex.push({
        slug,
        language,
        title: parsed.attributes.title,
        description: parsed.attributes.description,
        body: parsed.body,
      });
    }

    // Sort metadata by date descending (newest first)
    metadata.sort((a, b) => b.dateTimestamp - a.dateTimestamp);

    fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2));
    console.log(`Wrote metadata for ${metadata.length} posts to ${METADATA_FILE}`);

    fs.writeFileSync(SEARCH_INDEX_FILE, JSON.stringify(searchIndex));
    console.log(`Wrote search index for ${searchIndex.length} posts to ${SEARCH_INDEX_FILE}`);

  } catch (err) {
    console.error('Failed to generate metadata:', err);
    process.exit(1);
  }
}

generateMetadata();
