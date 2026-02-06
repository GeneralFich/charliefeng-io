
import { promises as fs } from 'fs';
import path from 'path';
import fm from 'front-matter';
import { calculateReadTime, extractTextFromMarkdown } from '../lib/utils';

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');
const METADATA_FILE = path.join(process.cwd(), 'lib', 'blog_metadata.json');
const SEARCH_INDEX_FILE = path.join(process.cwd(), 'lib', 'blog_search_index.json');

interface PostAttributes {
  title: string;
  date: string;
  author: string;
  description: string;
}

export interface BlogPostMetadata {
  slug: string;
  filename: string;
  attributes: PostAttributes;
  readTime: number;
  dateTimestamp: number;
  language: 'en' | 'zh' | 'es';
}

export interface BlogSearchEntry {
  slug: string;
  title: string;
  description: string;
  searchContent: string;
}

async function generate() {
  console.log('Generating blog metadata and search index...');

  try {
    await fs.access(POSTS_DIR);
  } catch {
    console.error(`Directory not found: ${POSTS_DIR}`);
    process.exit(1);
  }

  const allFiles = await fs.readdir(POSTS_DIR);
  const mdFiles = allFiles.filter(f => f.endsWith('.md'));

  const metadataList: BlogPostMetadata[] = [];
  const searchIndex: BlogSearchEntry[] = [];

  console.log(`Found ${mdFiles.length} posts.`);

  for (const file of mdFiles) {
    const filePath = path.join(POSTS_DIR, file);
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = fm<PostAttributes>(content);

    let language: 'en' | 'zh' | 'es' = 'en';
    let slug = file.replace('.md', '');

    if (file.endsWith('.zh.md')) {
        language = 'zh';
        slug = file.replace('.zh.md', '');
    } else if (file.endsWith('.es.md')) {
        language = 'es';
        slug = file.replace('.es.md', '');
    }

    const readTime = calculateReadTime(parsed.body);
    const dateTimestamp = new Date(parsed.attributes.date).getTime();

    metadataList.push({
      slug,
      filename: file,
      attributes: parsed.attributes,
      readTime,
      dateTimestamp,
      language
    });

    const searchContent = extractTextFromMarkdown(parsed.body);
    searchIndex.push({
      slug,
      title: parsed.attributes.title,
      description: parsed.attributes.description,
      searchContent
    });
  }

  // Sort by date descending
  metadataList.sort((a, b) => b.dateTimestamp - a.dateTimestamp);

  await fs.writeFile(METADATA_FILE, JSON.stringify(metadataList, null, 2));
  console.log(`Wrote metadata to ${METADATA_FILE}`);

  await fs.writeFile(SEARCH_INDEX_FILE, JSON.stringify(searchIndex, null, 2));
  console.log(`Wrote search index to ${SEARCH_INDEX_FILE}`);
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
