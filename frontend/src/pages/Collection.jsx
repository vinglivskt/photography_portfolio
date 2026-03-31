import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { isPlaceholderAssetUrl } from "../config/siteDefaults.js";
import { COLLECTION_EMPTY_MOSAIC, THEME_IMAGES } from "../config/themeImages.js";
import { fetchJson, prefetchJson } from "../api/client.js";
import PageHeader from "../components/PageHeader.jsx";
import PaginationBar from "../components/PaginationBar.jsx";
import Lightbox from "../components/Lightbox.jsx";

/** Страница портфолио с API-данными и fallback-мозаикой. */
export default function Collection() {
  const [searchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const [data, setData] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  useEffect(() => {
    let cancelled = false;
    fetchJson(`/api/collections?page=${page}&per_page=6`)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) setData({ items: [], page: 1, pages: 1, total: 0, per_page: 6 });
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  useEffect(() => {
    if (!data) return;
    if (page < data.pages) {
      prefetchJson(`/api/collections?page=${page + 1}&per_page=6`);
    }
    if (page > 1) {
      prefetchJson(`/api/collections?page=${page - 1}&per_page=6`);
    }
  }, [data, page]);

  const rows = useMemo(() => {
    if (!data?.items?.length) return { mode: "mosaic", list: COLLECTION_EMPTY_MOSAIC };
    const allPlaceholders = data.items.every((c) => !c.image_url || isPlaceholderAssetUrl(c.image_url));
    if (allPlaceholders) return { mode: "mosaic", list: COLLECTION_EMPTY_MOSAIC };
    return {
      mode: "api",
      list: data.items.map((c, i) => {
        const ph = !c.image_url || isPlaceholderAssetUrl(c.image_url);
        const bg = ph ? THEME_IMAGES.gallery[i % 12] : c.image_url;
        return { ...c, displayUrl: bg };
      }),
    };
  }, [data]);

  if (!data) {
    return <PageHeader title="Моя коллекция" subtitle="Загрузка…" />;
  }

  const empty = !data.items || data.items.length === 0;
  const galleryItems =
    empty || rows.mode === "mosaic"
      ? rows.list.map((url, i) => ({ src: url, alt: `Фотография ${i + 1}`, caption: `Кадр ${i + 1}` }))
      : rows.list
          .filter((c) => !c.external_url)
          .map((c) => ({
            src: c.displayUrl,
            alt: c.title || "Работа из портфолио",
            caption: c.title || "Работа из коллекции",
          }));

  return (
    <>
      <PageHeader
        title="Портфолио"
        subtitle="Подборка работ в удобной адаптивной сетке"
      />
      <section className="portfolio-section">
        <div className="portfolio-container">
          {empty || rows.mode === "mosaic" ? (
            <>
              <div className="portfolio-grid portfolio-grid--gallery">
                {rows.list.map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    className="portfolio-shot portfolio-shot--gallery portfolio-shot-btn"
                    title={`Кадр ${i + 1}`}
                    onClick={() => setLightboxIndex(i)}
                  >
                    <img src={url} alt={`Фотография ${i + 1}`} loading="lazy" />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="portfolio-grid portfolio-grid--gallery">
                {rows.list.map((c) =>
                  c.external_url ? (
                    <a
                      key={c.id}
                      href={c.external_url}
                      className="portfolio-shot portfolio-shot--gallery"
                      target="_blank"
                      rel="noreferrer noopener"
                      title={c.title || "Работа из коллекции"}
                    >
                      <img src={c.displayUrl} alt={c.title || "Работа из портфолио"} loading="lazy" />
                      <span className="portfolio-shot-meta">
                        <strong>{c.title || "Без названия"}</strong>
                        {c.description ? <small>{c.description}</small> : null}
                      </span>
                    </a>
                  ) : (
                    <button
                      key={c.id}
                      type="button"
                      className="portfolio-shot portfolio-shot--gallery portfolio-shot-btn"
                      title={c.title || "Работа из коллекции"}
                      onClick={() =>
                        setLightboxIndex(galleryItems.findIndex((item) => item.src === c.displayUrl))
                      }
                    >
                      <img src={c.displayUrl} alt={c.title || "Работа из портфолио"} loading="lazy" />
                      <span className="portfolio-shot-meta">
                        <strong>{c.title || "Без названия"}</strong>
                        {c.description ? <small>{c.description}</small> : null}
                      </span>
                    </button>
                  )
                )}
              </div>
              {data.pages > 1 ? <PaginationBar page={data.page} pages={data.pages} basePath="/collection" /> : null}
            </>
          )}
        </div>
      </section>
      {lightboxIndex >= 0 ? (
        <Lightbox
          items={galleryItems}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(-1)}
          onPrev={() => setLightboxIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length)}
          onNext={() => setLightboxIndex((prev) => (prev + 1) % galleryItems.length)}
        />
      ) : null}
    </>
  );
}
