import { useEffect, useState } from "react";
import { fetchJson } from "../api/client.js";
import PageHeader from "../components/PageHeader.jsx";

/** Демо-набор услуг, если API пока не заполнено. */
const STATIC_SERVICES = [
  {
    id: "static-1",
    title: "Индивидуальная съемка",
    description: "Портретная съемка в студии или на локации.",
    icon_class: "flaticon-big-lens",
  },
  {
    id: "static-2",
    title: "Парная съемка",
    description: "Love story и семейные кадры с живой подачей.",
    icon_class: "flaticon-printing-photo",
  },
  {
    id: "static-3",
    title: "Репортаж",
    description: "События, праздники, концерты и рабочие процессы.",
    icon_class: "flaticon-focusing-target",
  },
  {
    id: "static-4",
    title: "Контент для бренда",
    description: "Съемка для соцсетей, сайта и рекламных материалов.",
    icon_class: "flaticon-camera",
  },
  {
    id: "static-5",
    title: "Ретушь и цвет",
    description: "Базовая обработка всех кадров и аккуратная ретушь.",
    icon_class: "flaticon-polaroid-pictures",
  },
  {
    id: "static-6",
    title: "Подготовка к съемке",
    description: "Помощь с образом, референсами и таймингом.",
    icon_class: "flaticon-film",
  },
];

/** Страница списка услуг с приоритетом данных из API. */
export default function Services() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchJson("/api/services")
      .then((data) => {
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const display = items != null && items.length > 0 ? items : STATIC_SERVICES;
  const fromApi = items != null && items.length > 0;

  return (
    <>
      <PageHeader
        title="Форматы съемки"
        subtitle="Что можно снять и как проходит работа"
      />
      <section className="portfolio-section">
        <div className="portfolio-container">
          {items === null ? <p className="portfolio-loading-note">Загрузка услуг…</p> : null}
          <div className={`portfolio-service-grid${items === null ? " portfolio-service-grid--hidden" : ""}`}>
            {display.map((it) => (
              <article key={it.id} className="portfolio-service-card">
                <div className="portfolio-service-icon">
                  <span className={it.icon_class || "flaticon-camera"} aria-hidden="true" />
                </div>
                <h3>{it.title}</h3>
                <p>{it.description}</p>
              </article>
            ))}
          </div>
          {!fromApi && items != null ? (
            <p className="portfolio-muted-note">Сейчас показан базовый набор форматов</p>
          ) : null}
        </div>
      </section>
    </>
  );
}
