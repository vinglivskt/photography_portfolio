import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchJson, prefetchImageUrls } from "../api/client.js";
import {
  collectionImageUrlsFromResponse,
  prefetchBlogPage,
  prefetchCollectionPage,
} from "../utils/imagePrefetch.js";
import { isPlaceholderAssetUrl } from "../config/siteDefaults.js";
import { HOME_HERO_DEFAULTS, HOME_STRIP_FALLBACK } from "../config/themeImages.js";
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
        if (cancelled) return;
        setCollections(data.items || []);
        prefetchImageUrls(collectionImageUrlsFromResponse(data));
        if (data.pages > 1) prefetchCollectionPage(2, 6);
      })
      .catch(() => {
        if (!cancelled) setCollections([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    prefetchBlogPage(1);
    prefetchImageUrls(HOME_STRIP_FALLBACK);
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

  useEffect(() => {
    prefetchImageUrls(heroSlides);
  }, [heroSlides]);

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
    if (raw.length === 1) return { primary: raw[0], secondary: "Портреты, пары, события" };
    return { primary: "Фотограф", secondary: "Портреты, пары, события" };
  }, [s.tagline]);

  const h1 = s.photographer_name;
  const showHeroNameAccent =
    Boolean(tagLines.primary) &&
    tagLines.primary.trim().toLowerCase() !== String(h1 || "").trim().toLowerCase();
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
              {showHeroNameAccent ? <span>{tagLines.primary}</span> : null}
            </h1>
            <p className="portfolio-lead">{s.bio}</p>
            <p className="portfolio-hero-sub">{tagLines.secondary}</p>
            <div className="portfolio-hero-cta">
              <Link to="/collection" className="portfolio-btn portfolio-btn--primary">
                Смотреть работы
              </Link>
              <Link to="/contact" className="portfolio-btn portfolio-btn--ghost">
                Записаться на съемку
              </Link>
            </div>
          </article>
          <div className="portfolio-hero-media">
            <div className="portfolio-hero-frame">
              <img src={firstSlide} alt="Главная работа фотографа" loading="eager" fetchPriority="high" decoding="async" />
            </div>
            <div className="portfolio-hero-frame">
              <img src={secondSlide} alt="Дополнительная работа фотографа" loading="eager" decoding="async" />
            </div>
          </div>
        </div>
      </section>

      <section className="portfolio-section" aria-labelledby="featured-shots">
        <div className="portfolio-container">
          <div className="portfolio-section-head">
            <p className="portfolio-kicker">Портфолио</p>
            <h2 id="featured-shots">{stripTitle}</h2>
            <p>{fromApi ? "Последние съемки" : "Примеры работ"}</p>
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
            <h2 id="trust-section">Съемка без суеты</h2>
            <p>
              Перед съемкой согласуем задачу и стиль. На площадке подскажу по позированию. После съемки вы получите
              отобранные и обработанные кадры в срок.
            </p>
            <Link to="/services" className="portfolio-btn portfolio-btn--text">
              Форматы съемки
            </Link>
          </div>
          <div className="portfolio-trust-list">
            {[
              "Портреты, пары и события",
              "Понятные этапы и сроки",
              "Естественная ретушь без перегруза",
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
