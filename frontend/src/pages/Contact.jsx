import { useEffect, useState } from "react";
import { THEME_IMAGES } from "../config/themeImages.js";
import { useSiteSettings } from "../context/SettingsContext.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { fetchJson } from "../api/client.js";

/** Страница контактов и отправки заявки через форму обратной связи. */
export default function Contact() {
  const s = useSiteSettings();
  const authorPhoto = (s.about_image && s.about_image.trim()) || THEME_IMAGES.portraits.vlad0;
  const [subject, setSubject] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = `Мои контакты — ${s.page_title || s.photographer_name}`;
  }, [s.page_title, s.photographer_name]);

  /** Отправляет форму и обновляет состояние интерфейса по результату запроса. */
  async function onSubmit(e) {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      await fetchJson("/api/feedback", {
        method: "POST",
        body: JSON.stringify({ subject, email, content }),
      });
      setStatus({ type: "ok", text: "Сообщение отправлено. Я свяжусь с вами." });
      setSubject("");
      setEmail("");
      setContent("");
    } catch (err) {
      setStatus({ type: "err", text: err.message || "Не удалось отправить" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Контакты"
        subtitle="Коротко опишите задачу, и я предложу формат"
      />
      <section className="portfolio-section">
        <div className="portfolio-container portfolio-contact-layout">
          <aside className="portfolio-contact-panel">
            <h2>Связаться напрямую</h2>
            <p>Обычно отвечаю в течение дня.</p>
            {s.address ? <p><strong>Адрес:</strong> {s.address}</p> : null}
            {s.phone ? <p><strong>Телефон:</strong> <a href={`tel:${s.phone.replace(/\s/g, "")}`}>{s.phone}</a></p> : null}
            {s.email_public ? <p><strong>Email:</strong> <a href={`mailto:${s.email_public}`}>{s.email_public}</a></p> : null}
            {s.telegram_url ? (
              <p>
                <strong>Telegram:</strong>{" "}
                <a href={s.telegram_url} target="_blank" rel="noreferrer noopener">
                  Написать в Telegram
                </a>
              </p>
            ) : null}
            <img src={authorPhoto} alt={`Фото автора ${s.photographer_name}`} loading="lazy" />
          </aside>
          <div className="portfolio-form-wrap">
            <h2>Заявка на съемку</h2>
            {status?.type === "ok" ? (
              <div className="alert alert-success site-alert" role="status">
                {status.text}
              </div>
            ) : null}
            {status?.type === "err" ? (
              <div className="alert alert-danger site-alert" role="alert">
                {status.text}
              </div>
            ) : null}
            <form onSubmit={onSubmit} className="site-form">
              <div className="form-group mb-3">
                <label className="form-label" htmlFor="fb-subject">
                  Тема
                </label>
                <input
                  id="fb-subject"
                  className="form-control"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  maxLength={255}
                  autoComplete="off"
                  placeholder="Например: семейная съемка, май"
                />
              </div>
              <div className="form-group mb-3">
                <label className="form-label" htmlFor="fb-email">
                  Email
                </label>
                <input
                  id="fb-email"
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>
              <div className="form-group mb-3">
                <label className="form-label" htmlFor="fb-content">
                  Сообщение
                </label>
                <textarea
                  id="fb-content"
                  className="form-control"
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  maxLength={8000}
                  placeholder="Цель съемки, дата, локация"
                />
              </div>
              <button type="submit" className="portfolio-btn portfolio-btn--primary" disabled={loading}>
                {loading ? "Отправка..." : "Отправить заявку"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
