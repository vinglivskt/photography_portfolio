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
          <span aria-hidden="true">×</span>
        </button>
        <button
          type="button"
          className="portfolio-lightbox-btn portfolio-lightbox-btn--prev"
          onClick={onPrev}
          aria-label="Предыдущая фотография"
        >
          <span aria-hidden="true">‹</span>
        </button>
        <img src={current.src} alt={current.alt} />
        <button
          type="button"
          className="portfolio-lightbox-btn portfolio-lightbox-btn--next"
          onClick={onNext}
          aria-label="Следующая фотография"
        >
          <span aria-hidden="true">›</span>
        </button>
        <p className="portfolio-lightbox-caption">{current.caption}</p>
      </div>
    </div>
  );
}
