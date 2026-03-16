import type { MDXComponents } from 'mdx/types';

export const mdxComponents: MDXComponents = {
  h1: (props) => (
    <h1
      className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-ghost mt-12 mb-6"
      {...props}
    />
  ),
  h2: (props) => (
    <h2
      className="font-heading text-2xl md:text-3xl font-semibold tracking-tight text-ghost mt-16 mb-4 pb-2 border-b border-silver/10"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="font-heading text-xl font-semibold text-ghost mt-8 mb-3"
      {...props}
    />
  ),
  p: (props) => (
    <p className="text-ghost/90 leading-relaxed mb-4" {...props} />
  ),
  ul: (props) => (
    <ul className="list-disc list-inside space-y-2 mb-4 text-ghost/90" {...props} />
  ),
  ol: (props) => (
    <ol className="list-decimal list-inside space-y-2 mb-4 text-ghost/90" {...props} />
  ),
  li: (props) => <li className="leading-relaxed" {...props} />,
  a: (props) => (
    <a
      className="text-sapphire hover:text-sapphire/80 underline underline-offset-2 transition-colors"
      {...props}
    />
  ),
  blockquote: (props) => (
    <blockquote
      className="border-l-2 border-sapphire/40 pl-4 my-6 text-steel italic"
      {...props}
    />
  ),
  code: (props) => {
    const isInline = !props.className;
    if (isInline) {
      return (
        <code
          className="font-mono text-sm bg-charcoal px-1.5 py-0.5 rounded text-ghost"
          {...props}
        />
      );
    }
    return (
      <code
        className="font-mono text-sm"
        {...props}
      />
    );
  },
  pre: (props) => (
    <pre
      className="bg-charcoal border border-silver/10 rounded-lg p-4 overflow-x-auto my-6 font-mono text-sm text-ghost/90"
      {...props}
    />
  ),
  table: (props) => (
    <div className="overflow-x-auto my-6">
      <table className="w-full text-sm border-collapse" {...props} />
    </div>
  ),
  th: (props) => (
    <th
      className="text-left font-mono text-xs uppercase tracking-wider text-steel border-b border-silver/20 px-3 py-2"
      {...props}
    />
  ),
  td: (props) => (
    <td
      className="text-ghost/90 border-b border-silver/10 px-3 py-2"
      {...props}
    />
  ),
  strong: (props) => (
    <strong className="font-semibold text-ghost" {...props} />
  ),
  hr: () => <hr className="border-silver/10 my-12" />,
};
