import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchJson, prefetchImageUrls } from "../api/client.js";
import PageHeader from "../components/PageHeader.jsx";

/** Страница одной истории блога (полный текст из БД). */
export default function BlogPost() {
  const { postId } = useParams();
  const id = Number(postId);
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!Number.isFinite(id) || id < 1) {
      setError("not_found");
      return;
    }
    let cancelled = false;
    setError(null);
    setPost(null);
    fetchJson(`/api/blog/${id}`)
      .then((data) => {
        if (cancelled) return;
        setPost(data);
        if (data?.image_url) prefetchImageUrls([data.image_url]);
      })
      .catch(() => {
        if (!cancelled) setError("not_found");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error === "not_found") {
    return (
      <>
        <PageHeader title="Не найдено" subtitle="Такой записи нет" />
        <section className="portfolio-section">
          <div className="portfolio-container">
            <p className="portfolio-empty-hint">
              <Link to="/blog">← К списку блога</Link>
            </p>
          </div>
        </section>
      </>
    );
  }

  if (!post) {
    return <PageHeader title="Блог" subtitle="Загрузка…" />;
  }

  if (post.external_url) {
    return (
      <>
        <PageHeader title={post.title} subtitle={String(post.published_at || "")} />
        <section className="portfolio-section">
          <div className="portfolio-container">
            <p className="portfolio-blog-back">
              <Link to="/blog">← Все записи</Link>
            </p>
            <p>
              <a href={post.external_url} target="_blank" rel="noreferrer noopener">
                Открыть публикацию
              </a>
            </p>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader title={post.title} subtitle={String(post.published_at || "")} />
      <article className="portfolio-section">
        <div className="portfolio-container portfolio-blog-article">
          <p className="portfolio-blog-back">
            <Link to="/blog">← Все записи</Link>
          </p>
          {post.image_url ? (
            <figure className="portfolio-blog-figure">
              <img src={post.image_url} alt="" loading="lazy" />
            </figure>
          ) : null}
          {post.description ? <p className="portfolio-blog-lead">{post.description}</p> : null}
          {post.body ? (
            <div className="portfolio-blog-body">{post.body}</div>
          ) : (
            <p className="portfolio-muted-note">Полный текст можно добавить в поле body записи в базе.</p>
          )}
        </div>
      </article>
    </>
  );
}
