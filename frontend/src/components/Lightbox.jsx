import { useEffect } from "react";

/** Модальное окно просмотра изображений с клавиатурной навигацией. */
export default function Lightbox({ items, index, onClose, onPrev, onNext }) {
  const current = items[index];

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrev();
      if (event.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, onPrev, onNext]);

  if (!current) return null;

  return (
    <div className="portfolio-lightbox" role="dialog" aria-modal="true" aria-label="Просмотр фотографии">
      <button type="button" className="portfolio-lightbox-backdrop" onClick={onClose} aria-label="Закрыть просмотр" />
      <div className="portfolio-lightbox-content">
        <button
          type="button"
          className="portfolio-lightbox-btn portfolio-lightbox-btn--close"
          onClick={onClose}
          aria-label="Закрыть"
        >
          <svg className="portfolio-lightbox-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M6 6L18 18M18 6L6 18" />
          </svg>
        </button>
        <button
          type="button"
          className="portfolio-lightbox-btn portfolio-lightbox-btn--prev"
          onClick={onPrev}
          aria-label="Предыдущая фотография"
        >
          <svg className="portfolio-lightbox-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M15 6L9 12L15 18" />
          </svg>
        </button>
        <img src={current.src} alt={current.alt} />
        <button
          type="button"
          className="portfolio-lightbox-btn portfolio-lightbox-btn--next"
          onClick={onNext}
          aria-label="Следующая фотография"
        >
          <svg className="portfolio-lightbox-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M9 6L15 12L9 18" />
          </svg>
        </button>
        <p className="portfolio-lightbox-caption">{current.caption}</p>
      </div>
    </div>
  );
}
