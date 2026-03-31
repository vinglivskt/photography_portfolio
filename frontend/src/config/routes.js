/** Подписи для title и хлебных крошек */
export const ROUTE_PAGE_TITLE = {
  "/": "Главная",
  "/collection": "Коллекция",
  "/about": "Обо мне",
  "/services": "Услуги",
  "/blog": "Блог",
  "/contact": "Контакты",
};

/** Возвращает заголовок страницы по pathname роутера. */
export function routeTitleForPath(pathname) {
  return ROUTE_PAGE_TITLE[pathname] || null;
}
