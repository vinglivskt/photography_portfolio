import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { isPlaceholderAssetUrl } from "../config/siteDefaults.js";
import { BLOG_FALLBACK_POST_URLS, GALLERY_LEN, THEME_IMAGES } from "../config/themeImages.js";
import { fetchJson } from "../api/client.js";
import { prefetchBlogPage } from "../utils/imagePrefetch.js";
import PageHeader from "../components/PageHeader.jsx";
import PaginationBar from "../components/PaginationBar.jsx";
import Lightbox from "../components/Lightbox.jsx";

const FALLBACK_POSTS = BLOG_FALLBACK_POST_URLS.map((url, i) => ({
  id: `theme-${i}`,
  title: ["Свет в кадре", "Подготовка к съемке", "Выбор локации", "Поза и движение"][i] || `Заметка ${i + 1}`,
  description: "Короткая заметка о процессе съемки и подготовке.",
  image_url: url,
  published_at: "—",
  external_url: "",
}));

/** Страница блога с пагинацией и предпросмотром изображений. */
export default function Blog() {
  const [searchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const [data, setData] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  useEffect(() => {
    let cancelled = false;
    fetchJson(`/api/blog?page=${page}&per_page=6`)
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
    if (page < data.pages) prefetchBlogPage(page + 1);
    if (page > 1) prefetchBlogPage(page - 1);
  }, [data, page]);

  const items = useMemo(() => {
    if (!data?.items?.length) return { rows: FALLBACK_POSTS, fromApi: false };
    const mapped = data.items.map((post, i) => {
      const ph = !post.image_url || isPlaceholderAssetUrl(post.image_url);
      const img = ph ? THEME_IMAGES.gallery[i % GALLERY_LEN] : post.image_url;
      return { ...post, display_image_url: img };
    });
    return { rows: mapped, fromApi: true };
  }, [data]);
  const lightboxItems = items.rows
    .filter((post) => !post.external_url)
    .map((post) => ({
      src: post.display_image_url || post.image_url,
      alt: post.title,
      caption: post.title,
    }));

  if (!data) {
    return <PageHeader title="Блог" subtitle="Загрузка…" />;
  }

  const isStale = Boolean(data.page !== page);

  return (
    <>
      <PageHeader
        title="Блог"
        subtitle="Короткие заметки о съемке"
      />
      <section className={`portfolio-section${isStale ? " portfolio-section--pending" : ""}`} aria-busy={isStale}>
        <div className="portfolio-container">
          <div className="portfolio-blog-grid">
            {items.rows.map((post) => {
              const imageSrc = post.display_image_url || post.image_url;
              return (
                <article key={post.id} className="portfolio-blog-card">
                  {post.external_url ? (
                    <a href={post.external_url} target="_blank" rel="noreferrer noopener">
                      <img src={imageSrc} alt={post.title} loading="lazy" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="portfolio-shot-btn"
                      onClick={() => setLightboxIndex(lightboxItems.findIndex((x) => x.src === imageSrc))}
                      aria-label={`Открыть фото: ${post.title}`}
                    >
                      <img src={imageSrc} alt={post.title} loading="lazy" />
                    </button>
                  )}
                  <div className="portfolio-blog-card-body">
                    <p className="portfolio-blog-date">{post.published_at}</p>
                    <h3>{post.title}</h3>
                    <p>{post.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
          {items.fromApi && data.pages > 1 ? (
            <PaginationBar page={data.page} pages={data.pages} basePath="/blog" onPrefetchPage={prefetchBlogPage} />
          ) : null}
          {!items.fromApi ? <p className="portfolio-muted-note">Пока показаны демонстрационные записи</p> : null}
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
    </>
  );
}
