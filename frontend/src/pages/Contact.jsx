import { useEffect, useMemo, useState } from "react";
import { useSiteSettings } from "../context/SettingsContext.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { fetchJson } from "../api/client.js";
import SocialIcons from "../components/SocialIcons.jsx";

/** Контакты: портрет и каналы слева, форма справа — редакционная вёрстка. */
export default function Contact() {
  const s = useSiteSettings();
  const authorPhoto = (s.about_image || "").trim();
  const [subject, setSubject] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const who = (s.public_short_name || s.photographer_name || "").trim() || "автора";

  const detailRows = useMemo(() => {
    const rows = [];
    const addr = (s.address || "").trim();
    const phone = (s.phone || "").trim();
    const mail = (s.email_public || "").trim();
    if (addr) rows.push({ key: "addr", label: "Адрес", value: addr, href: null });
    if (phone) rows.push({ key: "phone", label: "Телефон", value: phone, href: `tel:${phone.replace(/\s/g, "")}` });
    if (mail) rows.push({ key: "mail", label: "Email", value: mail, href: `mailto:${mail}` });
    return rows;
  }, [s.address, s.phone, s.email_public]);

  useEffect(() => {
    const t = (s.page_title || s.photographer_name || "").trim();
    document.title = t ? `Контакты — ${t}` : "Контакты";
  }, [s.page_title, s.photographer_name]);

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
      <PageHeader title="Связаться со мной" subtitle="Коротко опишите задачу — отвечу в удобном для вас канале" />
      <section className="portfolio-section portfolio-section--contact">
        <div className="portfolio-container portfolio-contact-layout">
          <aside className="portfolio-contact-aside">
            <figure className="portfolio-contact-figure">
              {authorPhoto ? (
                <img src={authorPhoto} alt={`Фото ${who}`} loading="lazy" />
              ) : (
                <div className="portfolio-contact-photo-empty" role="img" aria-label="Фото из настроек сайта" />
              )}
            </figure>
            <div className="portfolio-contact-aside-body">
              <p className="portfolio-kicker portfolio-contact-aside-kicker">Контакты</p>
              <h2 className="portfolio-contact-aside-title">Прямой контакт</h2>
              <SocialIcons vkUrl={s.vk_url} telegramUrl={s.telegram_url} className="portfolio-contact-social" />
              {detailRows.length > 0 ? (
                <dl className="portfolio-contact-details">
                  {detailRows.map((row) => (
                    <div key={row.key} className="portfolio-contact-details-row">
                      <dt>{row.label}</dt>
                      <dd>
                        {row.href ? (
                          <a href={row.href}>{row.value}</a>
                        ) : (
                          row.value
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
          </aside>

          <div className="portfolio-form-wrap portfolio-contact-form-card">
            <header className="portfolio-contact-form-head">
              <p className="portfolio-kicker portfolio-contact-form-kicker">Сообщение</p>
              <h2 className="portfolio-contact-form-title">Заявка</h2>
              <p className="portfolio-contact-form-lead">
                Заполните поля — я отвечу по email. Для быстрого ответа можно написать в Telegram или ВКонтакте.
              </p>
            </header>
            {status?.type === "ok" ? (
              <div className="alert alert-success site-alert portfolio-contact-alert" role="status">
                {status.text}
              </div>
            ) : null}
            {status?.type === "err" ? (
              <div className="alert alert-danger site-alert portfolio-contact-alert" role="alert">
                {status.text}
              </div>
            ) : null}
            <form onSubmit={onSubmit} className="site-form portfolio-contact-form-fields">
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
                  placeholder="Например: семейная съёмка, май"
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
                  placeholder="Цель съёмки, дата, локация"
                />
              </div>
              <button type="submit" className="portfolio-btn portfolio-btn--primary portfolio-contact-submit" disabled={loading}>
                {loading ? "Отправка…" : "Отправить заявку"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
