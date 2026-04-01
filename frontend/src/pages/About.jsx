import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ABOUT_PORTRAIT_FALLBACK,
  ABOUT_GALLERY_STRIP,
  THEME_IMAGES,
} from "../config/themeImages.js";
import { isPlaceholderAssetUrl } from "../config/siteDefaults.js";
import { useSiteSettings } from "../context/SettingsContext.jsx";
import { fetchJson, prefetchImageUrls } from "../api/client.js";
import Lightbox from "../components/Lightbox.jsx";

const ABOUT_STRIP_COUNT = 5;

/** Страница с профилем фотографа, счетчиками и галереей. */
export default function About() {
  const s = useSiteSettings();
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [collectionStrip, setCollectionStrip] = useState(null);
  const portrait = (s.about_image && s.about_image.trim()) || ABOUT_PORTRAIT_FALLBACK;

  useEffect(() => {
    let cancelled = false;
    fetchJson(`/api/collections?page=1&per_page=${ABOUT_STRIP_COUNT}`)
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
    if (!collectionStrip.length) {
      return ABOUT_GALLERY_STRIP.map((url, i) => ({
        key: `theme-${i}`,
        src: url,
        caption: `Кадр ${i + 1}`,
      }));
    }
    return Array.from({ length: ABOUT_STRIP_COUNT }, (_, i) => {
      const c = collectionStrip[i];
      if (c && c.image_url && !isPlaceholderAssetUrl(c.image_url)) {
        return {
          key: `api-${c.id}`,
          src: c.image_url,
          caption: c.title || `Кадр ${i + 1}`,
        };
      }
      if (c) {
        return {
          key: `api-${c.id}-ph`,
          src: THEME_IMAGES.gallery[i % 12],
          caption: c.title || `Кадр ${i + 1}`,
        };
      }
      return {
        key: `fill-${i}`,
        src: ABOUT_GALLERY_STRIP[i % ABOUT_GALLERY_STRIP.length],
        caption: `Кадр ${i + 1}`,
      };
    });
  }, [collectionStrip]);

  useEffect(() => {
    const urls = [portrait];
    if (stripRows?.length) urls.push(...stripRows.map((r) => r.src));
    else urls.push(...ABOUT_GALLERY_STRIP);
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
  const lightboxItems = (stripRows || ABOUT_GALLERY_STRIP.map((url, i) => ({ src: url, caption: `Кадр ${i + 1}` }))).map((r) => ({
    src: r.src,
    alt: r.caption,
    caption: r.caption,
  }));

  return (
    <div className="portfolio-about">
      <section className="portfolio-section">
        <div className="portfolio-container portfolio-about-grid">
          <div className="portfolio-about-photo">
            <img src={portrait} alt={`Портрет ${s.photographer_name}`} loading="lazy" />
          </div>
          <article>
            <p className="portfolio-kicker">Обо мне</p>
            <h1 className="portfolio-page-title">{s.photographer_name}</h1>
            <p className="portfolio-lead">{s.bio}</p>
            <div className="portfolio-stat-grid">
              {stats.map((it) => (
                <div key={it.label} className="portfolio-stat">
                  <strong>{it.value}</strong>
                  <span>{it.label}</span>
                </div>
              ))}
            </div>
            <Link to="/contact" className="portfolio-btn portfolio-btn--primary">
              Записаться на съемку
            </Link>
          </article>
        </div>
      </section>

      <section className="portfolio-section portfolio-section--alt" aria-label="Лента работ">
        <div className="portfolio-container">
          <div className="portfolio-grid portfolio-grid--featured">
            {stripRows === null
              ? Array.from({ length: ABOUT_STRIP_COUNT }, (_, i) => (
                  <div key={`about-strip-skel-${i}`} className="portfolio-shot portfolio-shot--skeleton" aria-hidden="true" />
                ))
              : stripRows.map((row, i) => (
                  <button
                    key={row.key}
                    type="button"
                    className="portfolio-shot portfolio-shot-btn"
                    title={row.caption}
                    onClick={() => setLightboxIndex(i)}
                  >
                    <img src={row.src} alt={row.caption} loading="lazy" />
                  </button>
                ))}
          </div>
        </div>
      </section>
      {lightboxIndex >= 0 ? (
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
