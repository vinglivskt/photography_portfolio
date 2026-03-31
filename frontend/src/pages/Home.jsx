import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchJson } from "../api/client.js";
import { isPlaceholderAssetUrl } from "../config/siteDefaults.js";
import { HOME_HERO_DEFAULTS, HOME_STRIP_FALLBACK, THEME_IMAGES } from "../config/themeImages.js";
import { useSiteSettings } from "../context/SettingsContext.jsx";
import Lightbox from "../components/Lightbox.jsx";

/** Главная страница с hero-блоком и витриной выбранных работ. */
export default function Home() {
  const s = useSiteSettings();
  const [collections, setCollections] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  useEffect(() => {
    let cancelled = false;
    fetchJson("/api/collections?page=1&per_page=12")
      .then((data) => {
        if (!cancelled) setCollections(data.items || []);
      })
      .catch(() => {
        if (!cancelled) setCollections([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const heroSlides = useMemo(() => {
    const a = (s.hero_image_1 || "").trim();
    const b = (s.hero_image_2 || "").trim();
    const slides = [];
    if (a && !isPlaceholderAssetUrl(a)) slides.push(a);
    if (b && !isPlaceholderAssetUrl(b)) slides.push(b);
    if (slides.length === 0) return HOME_HERO_DEFAULTS;
    if (slides.length === 1) return [slides[0], HOME_HERO_DEFAULTS[1]];
    return slides;
  }, [s.hero_image_1, s.hero_image_2]);

  const stripItems = useMemo(() => {
    if (collections === null) return [];
    const real = collections.filter((c) => c.image_url && !isPlaceholderAssetUrl(c.image_url));
    if (real.length > 0) {
      return real.map((c) => ({
        key: `api-${c.id}`,
        href: c.external_url || c.image_url,
        bg: c.image_url,
        caption: c.title || "Снимок из коллекции",
        popup: !c.external_url,
      }));
    }
    return HOME_STRIP_FALLBACK.map((url, i) => ({
      key: `theme-${i}`,
      href: url,
      bg: url,
      caption: `Кадр ${i + 1}`,
      popup: true,
    }));
  }, [collections]);

  const isLoadingCollections = collections === null;
  const fromApi = Array.isArray(collections) && collections.some((c) => c.image_url && !isPlaceholderAssetUrl(c.image_url));
  const lightboxItems = stripItems.filter((item) => item.popup).map((item) => ({ src: item.bg, alt: item.caption, caption: item.caption }));

  const tagLines = useMemo(() => {
    const raw = (s.tagline || "").split(/\n+/).map((x) => x.trim()).filter(Boolean);
    if (raw.length >= 2) return { primary: raw[0], secondary: raw.slice(1).join(" · ") };
    if (raw.length === 1) return { primary: raw[0], secondary: "Портфолио и заказ съёмки" };
    return { primary: "Фотограф", secondary: "Портфолио и заказ съёмки" };
  }, [s.tagline]);

  const h1 = s.photographer_name;
  const stripTitle = s.instagram_section_title || "Избранные кадры";
  const firstSlide = heroSlides[0] || HOME_HERO_DEFAULTS[0];
  const secondSlide = heroSlides[1] || HOME_HERO_DEFAULTS[1];

  return (
    <div className="portfolio-home">
      <section className="portfolio-hero" aria-labelledby="hero-title">
        <div className="portfolio-container portfolio-hero-grid">
          <article className="portfolio-hero-copy">
            <p className="portfolio-kicker">Фотограф</p>
            <h1 id="hero-title">
              {h1}
              <span>{tagLines.primary}</span>
            </h1>
            <p className="portfolio-lead">{s.bio}</p>
            <p className="portfolio-hero-sub">{tagLines.secondary}</p>
            <div className="portfolio-hero-cta">
              <Link to="/collection" className="portfolio-btn portfolio-btn--primary">
                Смотреть портфолио
              </Link>
              <Link to="/contact" className="portfolio-btn portfolio-btn--ghost">
                Забронировать съемку
              </Link>
            </div>
          </article>
          <div className="portfolio-hero-media">
            <img src={firstSlide} alt="Главная работа фотографа" loading="eager" fetchpriority="high" decoding="async" />
            <img src={secondSlide} alt="Дополнительная работа фотографа" loading="lazy" decoding="async" />
          </div>
        </div>
      </section>

      <section className="portfolio-section" aria-labelledby="featured-shots">
        <div className="portfolio-container">
          <div className="portfolio-section-head">
            <p className="portfolio-kicker">Портфолио</p>
            <h2 id="featured-shots">{stripTitle}</h2>
            <p>{fromApi ? "Подборка последних работ из коллекции" : "Демонстрационные кадры из библиотеки проекта"}</p>
          </div>
          <div className={`portfolio-grid portfolio-grid--featured ${isLoadingCollections ? "" : "portfolio-grid--ready"}`}>
            {isLoadingCollections ? Array.from({ length: 6 }, (_, i) => (
              <div key={`home-skeleton-${i}`} className="portfolio-shot portfolio-shot--skeleton" aria-hidden="true" />
            )) : stripItems.map((item) => (
              item.popup ? (
                <button
                  key={item.key}
                  type="button"
                  className="portfolio-shot portfolio-shot-btn"
                  title={item.caption}
                  aria-label={item.caption}
                  onClick={() => setLightboxIndex(lightboxItems.findIndex((x) => x.src === item.bg))}
                >
                  <img src={item.bg} alt={item.caption} loading="lazy" />
                </button>
              ) : (
                <a
                  key={item.key}
                  href={item.href}
                  className="portfolio-shot"
                  title={item.caption}
                  aria-label={item.caption}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <img src={item.bg} alt={item.caption} loading="lazy" />
                </a>
              )
            ))}
          </div>
        </div>
      </section>

      <section className="portfolio-section portfolio-section--alt" aria-labelledby="trust-section">
        <div className="portfolio-container portfolio-trust-grid">
          <div>
            <p className="portfolio-kicker">Почему выбирают меня</p>
            <h2 id="trust-section">Спокойный процесс и предсказуемый результат</h2>
            <p>
              Перед съемкой обсуждаем идею, стиль и референсы. На площадке помогаю с позированием и атмосферой, после
              съемки вы получаете отобранные и обработанные кадры в срок.
            </p>
            <Link to="/services" className="portfolio-btn portfolio-btn--text">
              Посмотреть форматы съемки
            </Link>
          </div>
          <div className="portfolio-trust-list">
            {[
              "Портреты, семейные съемки и мероприятия",
              "Четкий бриф и понятные этапы работы",
              "Аккуратная ретушь без потери естественности",
            ].map((point) => (
              <p key={point}>{point}</p>
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
