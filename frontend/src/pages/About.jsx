import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ABOUT_PORTRAIT_FALLBACK,
  ABOUT_GALLERY_STRIP,
} from "../config/themeImages.js";
import { useSiteSettings } from "../context/SettingsContext.jsx";
import Lightbox from "../components/Lightbox.jsx";

/** Страница с профилем фотографа, счетчиками и галереей. */
export default function About() {
  const s = useSiteSettings();
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const portrait = (s.about_image && s.about_image.trim()) || ABOUT_PORTRAIT_FALLBACK;
  const stats = useMemo(
    () => [
      { label: "съемок", value: s.counter_sessions },
      { label: "клиентов", value: s.counter_clients },
      { label: "студийных проектов", value: s.counter_studio },
      { label: "кг оборудования", value: s.counter_equipment },
    ],
    [s.counter_clients, s.counter_equipment, s.counter_sessions, s.counter_studio]
  );
  const lightboxItems = ABOUT_GALLERY_STRIP.map((url, i) => ({
    src: url,
    alt: `Кадр из портфолио ${i + 1}`,
    caption: `Кадр ${i + 1}`,
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
            {ABOUT_GALLERY_STRIP.map((url, i) => (
              <button
                key={url}
                type="button"
                className="portfolio-shot portfolio-shot-btn"
                title={`Кадр ${i + 1}`}
                onClick={() => setLightboxIndex(i)}
              >
                <img src={url} alt={`Кадр из портфолио ${i + 1}`} loading="lazy" />
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
