import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { isPlaceholderAssetUrl } from "../config/siteDefaults.js";
import { fetchJson } from "../api/client.js";
import { prefetchCollectionPage } from "../utils/imagePrefetch.js";
import PageHeader from "../components/PageHeader.jsx";
import PaginationBar from "../components/PaginationBar.jsx";
import Lightbox from "../components/Lightbox.jsx";

/** Портфолио только из API коллекции. */
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
    if (page < data.pages) prefetchCollectionPage(page + 1);
    if (page > 1) prefetchCollectionPage(page - 1);
  }, [data, page]);

  const rows = useMemo(() => {
    if (!data?.items?.length) return { mode: "empty", list: [] };
    const list = data.items.map((c, i) => {
      const ph = !c.image_url || isPlaceholderAssetUrl(c.image_url);
      const bg = ph ? "" : c.image_url;
      return { ...c, displayUrl: bg };
    });
    const hasDisplay = list.some((c) => c.displayUrl);
    if (!hasDisplay) return { mode: "empty", list: [] };
    return { mode: "api", list };
  }, [data]);

  const isStale = Boolean(data && data.page !== page);

  if (!data) {
    return <PageHeader title="Портфолио" subtitle="Загрузка…" />;
  }

  const galleryItems =
    rows.mode === "api"
      ? rows.list
          .filter((c) => !c.external_url && c.displayUrl)
          .map((c) => ({
            src: c.displayUrl,
            alt: c.title || "Работа из портфолио",
            caption: c.title || "Работа из коллекции",
          }))
      : [];

  return (
    <>
      <PageHeader title="Портфолио" subtitle="Избранные работы" />
      <section className={`portfolio-section${isStale ? " portfolio-section--pending" : ""}`} aria-busy={isStale}>
        <div className="portfolio-container">
          {rows.mode === "empty" ? (
            <p className="portfolio-empty-hint">В коллекции пока нет работ — добавьте записи в базу.</p>
          ) : (
            <>
              <div className="portfolio-grid portfolio-grid--gallery">
                {rows.list.map((c) =>
                  c.external_url && c.displayUrl ? (
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
                  ) : c.displayUrl ? (
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
                  ) : (
                    <div key={c.id} className="portfolio-shot portfolio-shot--skeleton" aria-hidden="true" />
                  )
                )}
              </div>
              {data.pages > 1 ? (
                <PaginationBar
                  page={data.page}
                  pages={data.pages}
                  basePath="/collection"
                  onPrefetchPage={prefetchCollectionPage}
                />
              ) : null}
            </>
          )}
        </div>
      </section>
      {lightboxIndex >= 0 && galleryItems.length > 0 ? (
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
