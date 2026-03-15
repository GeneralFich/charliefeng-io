import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Placeholder — P2 builds this out
  return (
    <div className="container-grid py-24">
      <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight text-ghost">
        Charlie Feng
      </h1>
      <p className="mt-4 text-lg text-steel max-w-2xl">
        Product Leadership Studio — coming soon.
      </p>
    </div>
  );
}
