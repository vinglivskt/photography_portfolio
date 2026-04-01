import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { isPlaceholderAssetUrl } from "../config/siteDefaults.js";
import { fetchJson } from "../api/client.js";
import { prefetchBlogPage, prefetchBlogPost } from "../utils/imagePrefetch.js";
import PageHeader from "../components/PageHeader.jsx";
import PaginationBar from "../components/PaginationBar.jsx";

/** Список историй блога из API; переход на страницу записи. */
export default function Blog() {
  const [searchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const [data, setData] = useState(null);

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

  const rows = useMemo(() => data?.items || [], [data]);

  if (!data) {
    return <PageHeader title="Блог" subtitle="Загрузка…" />;
  }

  const isStale = Boolean(data.page !== page);

  return (
    <>
      <PageHeader title="Блог" subtitle="Истории со съёмок" />
      <section className={`portfolio-section${isStale ? " portfolio-section--pending" : ""}`} aria-busy={isStale}>
        <div className="portfolio-container">
          {rows.length === 0 ? (
            <p className="portfolio-empty-hint">Записи блога появятся после добавления в базу.</p>
          ) : (
            <div className="portfolio-blog-grid">
              {rows.map((post) => {
                const ph = !post.image_url || isPlaceholderAssetUrl(post.image_url);
                const imageSrc = ph ? null : post.image_url;
                const cardImage = imageSrc ? (
                  <img src={imageSrc} alt="" loading="lazy" />
                ) : (
                  <div className="portfolio-blog-thumb-empty" aria-hidden="true" />
                );

                return (
                  <article key={post.id} className="portfolio-blog-card">
                    {post.external_url ? (
                      <a href={post.external_url} target="_blank" rel="noreferrer noopener">
                        {cardImage}
                      </a>
                    ) : (
                      <Link
                        to={`/blog/${post.id}`}
                        className="portfolio-blog-card-cover"
                        onMouseEnter={() => prefetchBlogPost(post.id)}
                        onFocus={() => prefetchBlogPost(post.id)}
                      >
                        {cardImage}
                      </Link>
                    )}
                    <div className="portfolio-blog-card-body">
                      <p className="portfolio-blog-date">{post.published_at}</p>
                      {post.external_url ? (
                        <h3>
                          <a href={post.external_url} target="_blank" rel="noreferrer noopener">
                            {post.title}
                          </a>
                        </h3>
                      ) : (
                        <h3>
                          <Link to={`/blog/${post.id}`}>{post.title}</Link>
                        </h3>
                      )}
                      {post.description ? <p>{post.description}</p> : null}
                      {!post.external_url ? (
                        <p className="portfolio-blog-readmore">
                          <Link to={`/blog/${post.id}`}>Читать историю</Link>
                        </p>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          {rows.length > 0 && data.pages > 1 ? (
            <PaginationBar page={data.page} pages={data.pages} basePath="/blog" onPrefetchPage={prefetchBlogPage} />
          ) : null}
        </div>
      </section>
    </>
  );
}
