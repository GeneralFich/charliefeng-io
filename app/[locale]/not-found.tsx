import { Link } from '@/i18n/routing';

export default function NotFound() {
  return (
    <div className="container-grid py-32 text-center">
      <h1 className="font-mono text-6xl font-bold text-ghost">404</h1>
      <p className="mt-4 text-lg text-steel">This page doesn&apos;t exist.</p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center px-6 py-3 text-sm font-medium text-ghost border border-silver/30 rounded-lg hover:border-silver/60 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
