import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { isPlaceholderAssetUrl } from "../config/siteDefaults.js";
import { useSiteSettings } from "../context/SettingsContext.jsx";
import { fetchJson, prefetchImageUrls } from "../api/client.js";
import Lightbox from "../components/Lightbox.jsx";

const PORTFOLIO_PREVIEW = 3;

/** «Обо мне»: портрет из настроек, 3 кадра из портфолио (API). */
export default function About() {
  const s = useSiteSettings();
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [collectionStrip, setCollectionStrip] = useState(null);

  const portrait = (s.about_image || "").trim();

  useEffect(() => {
    let cancelled = false;
    fetchJson(`/api/collections?page=1&per_page=${PORTFOLIO_PREVIEW}`)
      .then((res) => {
        if (!cancelled) setCollectionStrip(Array.isArray(res?.items) ? res.items : []);
      })
      .catch(() => {
        if (!cancelled) setCollectionStrip([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stripRows = useMemo(() => {
    if (collectionStrip === null) return null;
    const rows = [];
    for (let i = 0; i < PORTFOLIO_PREVIEW; i++) {
      const c = collectionStrip[i];
      if (c?.image_url && !isPlaceholderAssetUrl(c.image_url)) {
        rows.push({
          key: `api-${c.id}`,
          src: c.image_url,
          caption: c.title || `Кадр ${i + 1}`,
        });
      }
    }
    return rows;
  }, [collectionStrip]);

  useEffect(() => {
    const urls = [];
    if (portrait) urls.push(portrait);
    if (stripRows?.length) urls.push(...stripRows.map((r) => r.src));
    prefetchImageUrls(urls);
  }, [portrait, stripRows]);

  const stats = useMemo(
    () => [
      { label: "съемок", value: s.counter_sessions },
      { label: "клиентов", value: s.counter_clients },
      { label: "студийных проектов", value: s.counter_studio },
      { label: "кг оборудования", value: s.counter_equipment },
    ],
    [s.counter_clients, s.counter_equipment, s.counter_sessions, s.counter_studio]
  );

  const displayName = (s.photographer_name || "").trim() || (s.public_short_name || "").trim() || "Обо мне";
  const lightboxItems = (stripRows || []).map((r) => ({
    src: r.src,
    alt: r.caption,
    caption: r.caption,
  }));

  return (
    <div className="portfolio-about">
      <section className="portfolio-section">
        <div className="portfolio-container portfolio-about-grid">
          <div className="portfolio-about-photo">
            {portrait ? (
              <img src={portrait} alt={`Портрет ${displayName}`} loading="lazy" />
            ) : (
              <div className="portfolio-about-photo-empty" role="img" aria-label="Фото из настроек сайта" />
            )}
          </div>
          <article>
            <p className="portfolio-kicker">Обо мне</p>
            <h1 className="portfolio-page-title">{displayName}</h1>
            {s.bio ? <p className="portfolio-lead">{s.bio}</p> : null}
            <div className="portfolio-stat-grid">
              {stats.map((it) => (
                <div key={it.label} className="portfolio-stat">
                  <strong>{it.value}</strong>
                  <span>{it.label}</span>
                </div>
              ))}
            </div>
            <Link to="/contact" className="portfolio-btn portfolio-btn--primary">
              Связаться
            </Link>
          </article>
        </div>
      </section>

      <section className="portfolio-section portfolio-section--alt" aria-label="Работы из портфолио">
        <div className="portfolio-container">
          <div className="portfolio-grid portfolio-grid--featured">
            {stripRows === null ? (
              Array.from({ length: PORTFOLIO_PREVIEW }, (_, i) => (
                <div key={`about-strip-skel-${i}`} className="portfolio-shot portfolio-shot--skeleton" aria-hidden="true" />
              ))
            ) : stripRows.length > 0 ? (
              stripRows.map((row, i) => (
                <button
                  key={row.key}
                  type="button"
                  className="portfolio-shot portfolio-shot-btn"
                  title={row.caption}
                  onClick={() => setLightboxIndex(i)}
                >
                  <img src={row.src} alt={row.caption} loading="lazy" />
                </button>
              ))
            ) : (
              <p className="portfolio-empty-hint">В коллекции пока нет кадров для блока «работы».</p>
            )}
          </div>
        </div>
      </section>
      {lightboxIndex >= 0 && lightboxItems.length > 0 ? (
        <Lightbox
          items={lightboxItems}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(-1)}
          onPrev={() => setLightboxIndex((prev) => (prev - 1 + lightboxItems.length) % lightboxItems.length)}
          onNext={() => setLightboxIndex((prev) => (prev + 1) % lightboxItems.length)}
        />
      ) : null}
    </div>
  );
}
