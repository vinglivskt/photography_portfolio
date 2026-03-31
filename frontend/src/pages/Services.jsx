import { useEffect, useState } from "react";
import { fetchJson } from "../api/client.js";
import PageHeader from "../components/PageHeader.jsx";

/** Демо-набор услуг, если API пока не заполнено. */
const STATIC_SERVICES = [
  {
    id: "static-1",
    title: "Оборудование",
    description: "Подбор техники под задачу: портрет, репортаж, студия.",
    icon_class: "flaticon-big-lens",
  },
  {
    id: "static-2",
    title: "Печать и ретушь",
    description: "Обработка, цвет, подготовка файлов к печати и альбомам.",
    icon_class: "flaticon-printing-photo",
  },
  {
    id: "static-3",
    title: "Фокус на клиенте",
    description: "Помогаю с позой, светом и настроением на съёмке.",
    icon_class: "flaticon-focusing-target",
  },
  {
    id: "static-4",
    title: "Студийные сессии",
    description: "Полный цикл в студии: свет, фон, несколько образов.",
    icon_class: "flaticon-camera",
  },
  {
    id: "static-5",
    title: "Серии и альбомы",
    description: "Love story, семейные истории, отбор и последовательность кадров.",
    icon_class: "flaticon-polaroid-pictures",
  },
  {
    id: "static-6",
    title: "Мероприятия",
    description: "Корпоративы, концерты, репортаж с площадки.",
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
        title="Услуги"
        subtitle="Форматы съемки и постобработка"
      />
      <section className="portfolio-section">
        <div className="portfolio-container">
        {items === null ? (
            <p className="text-muted text-center mb-0">Загрузка услуг…</p>
        ) : null}
          <div className={`portfolio-service-grid${items === null ? " d-none" : ""}`}>
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
            <p className="portfolio-muted-note">Можно подключить API-услуги, сейчас используется демонстрационный набор</p>
          ) : null}
              </div>
      </section>
    </>
  );
}
