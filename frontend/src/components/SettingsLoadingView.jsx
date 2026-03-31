/** Экран-заглушка во время загрузки настроек сайта. */
export default function SettingsLoadingView() {
  return (
    <div className="portfolio-app-loading" role="status" aria-live="polite" aria-busy="true">
      <div className="portfolio-skeleton portfolio-skeleton--header" />
      <div className="portfolio-skeleton portfolio-skeleton--line" />
      <div className="portfolio-skeleton portfolio-skeleton--line portfolio-skeleton--short" />
      <span className="sr-only">Загрузка настроек сайта</span>
    </div>
  );
}
