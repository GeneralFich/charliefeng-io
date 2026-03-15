/// <reference types="vite/client" />

declare module '*.md?raw' {
  const content: string;
  export default content;
}

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

interface ImportMetaEnv {
  readonly VITE_EMAILJS_SERVICE_ID: string;
  readonly VITE_EMAILJS_TEMPLATE_ID: string;
  readonly VITE_EMAILJS_PUBLIC_KEY: string;
  readonly VITE_FORMSPREE_FORM_ID?: string; // Keeping optional for backward compatibility if needed, though we are removing usage.
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
