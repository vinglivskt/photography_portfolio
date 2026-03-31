import { Link } from "react-router-dom";

/** Универсальная панель постраничной навигации для списков. */
export default function PaginationBar({ page, pages, basePath, searchParam = "page" }) {
  if (pages <= 1) return null;

  const makeHref = (p) => {
    const q = new URLSearchParams();
    if (p > 1) q.set(searchParam, String(p));
    const qs = q.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const nums = [];
  const push = (n) => {
    if (n >= 1 && n <= pages && !nums.includes(n)) nums.push(n);
  };
  push(1);
  push(page - 1);
  push(page);
  push(page + 1);
  push(pages);
  nums.sort((a, b) => a - b);

  return (
    <nav className="pagination-bar" aria-label="Постраничная навигация">
      {page > 1 ? (
        <Link className="portfolio-page-btn" to={makeHref(page - 1)}>
          &laquo;
        </Link>
      ) : null}
      {nums.map((n, index) => (
        <span key={`slot-${n}`}>
          {index > 0 && nums[index - 1] !== n - 1 ? (
            <span className="portfolio-page-ellipsis" aria-hidden="true">
              …
            </span>
          ) : null}
          {n === page ? (
            <button type="button" className="portfolio-page-btn portfolio-page-btn--active" disabled>
              {n}
            </button>
          ) : (
            <Link className="portfolio-page-btn" to={makeHref(n)}>
              {n}
            </Link>
          )}
        </span>
      ))}
      {page < pages ? (
        <Link className="portfolio-page-btn" to={makeHref(page + 1)}>
          &raquo;
        </Link>
      ) : null}
    </nav>
  );
}
