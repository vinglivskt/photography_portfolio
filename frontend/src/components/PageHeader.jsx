import { Link } from "react-router-dom";

/** Заголовок страницы с хлебными крошками и подзаголовком. */
export default function PageHeader({ title, subtitle }) {
  return (
    <section className="portfolio-page-header" aria-labelledby="portfolio-page-title">
      <div className="portfolio-container">
        <nav className="portfolio-breadcrumb-nav" aria-label="Хлебные крошки">
          <ol className="portfolio-breadcrumb-list mb-2">
            <li className="portfolio-breadcrumb-item">
              <Link to="/" className="portfolio-breadcrumb-link">
                    Главная
              </Link>
            </li>
            <li className="portfolio-breadcrumb-item portfolio-breadcrumb-item--current" aria-current="page">
              <span className="portfolio-breadcrumb-current">{title}</span>
            </li>
          </ol>
        </nav>
        <h1 id="portfolio-page-title" className="portfolio-page-title">
          {title}
        </h1>
        {subtitle ? <p className="portfolio-header-lead">{subtitle}</p> : null}
      </div>
    </section>
  );
}
