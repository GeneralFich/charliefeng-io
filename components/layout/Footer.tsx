import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t border-silver/10">
      <div className="container-grid flex flex-col sm:flex-row items-center justify-between py-8 gap-4">
        <span className="text-sm text-steel">
          &copy; {new Date().getFullYear()} Charlie Feng
        </span>
        <nav className="flex items-center gap-6">
          <a
            href="https://www.linkedin.com/in/charliefeng/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-steel hover:text-ghost transition-colors"
          >
            {t('linkedin')}
          </a>
          <a
            href="https://substack.com/@charliefeng"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-steel hover:text-ghost transition-colors"
          >
            {t('substack')}
          </a>
          <a
            href="mailto:charlie@charliefeng.io"
            className="text-sm text-steel hover:text-ghost transition-colors"
          >
            {t('email')}
          </a>
        </nav>
      </div>
    </footer>
  );
}
