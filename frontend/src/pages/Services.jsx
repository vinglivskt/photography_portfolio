import { useEffect, useState } from "react";
import { fetchJson } from "../api/client.js";
import PageHeader from "../components/PageHeader.jsx";
import { useSiteSettings } from "../context/SettingsContext.jsx";

/** Услуги из API; переход на запись — ссылка из БД (booking_url или telegram). */
export default function Services() {
  const s = useSiteSettings();
  const [items, setItems] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchJson("/api/services")
      .then((data) => {
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fallbackTelegram = (s.telegram_url || "").trim();

  return (
    <>
      <PageHeader title="Форматы съемки" subtitle="Что можно снять и как проходит работа" />
      <section className="portfolio-section">
        <div className="portfolio-container">
          {items === null ? <p className="portfolio-loading-note">Загрузка услуг…</p> : null}
          {items !== null && items.length === 0 ? (
            <p className="portfolio-empty-hint">Список услуг пуст — добавьте записи в таблицу услуг.</p>
          ) : null}
          <div className={`portfolio-service-grid${items === null ? " portfolio-service-grid--hidden" : ""}`}>
            {(items || []).map((it) => {
              const href = ((it.booking_url || "").trim() || fallbackTelegram).trim();
              const inner = (
                <>
                  <div className="portfolio-service-icon">
                    <span className={it.icon_class || "flaticon-camera"} aria-hidden="true" />
                  </div>
                  <h3>{it.title}</h3>
                  <p>{it.description}</p>
                  {href ? <span className="portfolio-service-cta">Записаться в Telegram →</span> : null}
                </>
              );
              return href ? (
                <a
                  key={it.id}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="portfolio-service-card portfolio-service-card--link"
                >
                  {inner}
                </a>
              ) : (
                <article key={it.id} className="portfolio-service-card">
                  {inner}
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
