declare module '*.md?raw' {
  const content: string;
  export default content;
}

/// <reference types="vite/client" />

declare module 'front-matter' {
  interface FrontMatterResult<T> {
    attributes: T;
    body: string;
    bodyBegin: number;
    frontmatter: string;
  }
  function fm<T>(markdown: string): FrontMatterResult<T>;
  export = fm;
}
