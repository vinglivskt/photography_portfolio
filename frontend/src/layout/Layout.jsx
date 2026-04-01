import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { routeTitleForPath } from "../config/routes.js";
import { useSiteSettings } from "../context/SettingsContext.jsx";
import { prefetchImageUrls } from "../api/client.js";
import { ABOUT_GALLERY_STRIP, ABOUT_PORTRAIT_FALLBACK } from "../config/themeImages.js";
import { prefetchBlogPage, prefetchCollectionPage } from "../utils/imagePrefetch.js";

const THEME_KEY = "portfolio-theme";
const ROUTE_PREFETCHERS = {
  "/": () => import("../pages/Home.jsx"),
  "/collection": () => import("../pages/Collection.jsx"),
  "/about": () => import("../pages/About.jsx"),
  "/services": () => import("../pages/Services.jsx"),
  "/blog": () => import("../pages/Blog.jsx"),
  "/contact": () => import("../pages/Contact.jsx"),
};
const PREFETCHED_ROUTES = new Set();

/** Нормализует текст описания для meta description с ограничением длины. */
function metaDescription(text) {
  const t = (text || "").replace(/\s+/g, " ").trim();
  return t.length > 160 ? `${t.slice(0, 157)}…` : t;
}

/** Определяет итоговую тему интерфейса с учетом системной настройки. */
function resolveTheme(themeMode) {
  if (themeMode === "light" || themeMode === "dark") return themeMode;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Предзагружает JS-модуль страницы для более быстрого перехода. */
function prefetchRouteModule(path) {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection?.saveData) return;
  const networkType = String(connection?.effectiveType || "");
  if (networkType.includes("2g")) return;
  const run = ROUTE_PREFETCHERS[path];
  if (!run || PREFETCHED_ROUTES.has(path)) return;
  PREFETCHED_ROUTES.add(path);
  run().catch(() => {
    PREFETCHED_ROUTES.delete(path);
  });
}

/** Прогревает JSON и превью фото для страниц с галереей. */
function prefetchRouteGallery(path) {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection?.saveData) return;
  const networkType = String(connection?.effectiveType || "");
  if (networkType.includes("2g")) return;
  if (path === "/collection") prefetchCollectionPage(1);
  if (path === "/blog") prefetchBlogPage(1);
  if (path === "/about") prefetchImageUrls([ABOUT_PORTRAIT_FALLBACK, ...ABOUT_GALLERY_STRIP]);
}

function prefetchRoute(path) {
  prefetchRouteModule(path);
  prefetchRouteGallery(path);
}

/** Основной каркас приложения: шапка, навигация, контент и футер. */
export default function Layout() {
  const s = useSiteSettings();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem(THEME_KEY) || "system");

  const navItems = useMemo(
    () => [
      { to: "/", label: "Главная", end: true },
      { to: "/collection", label: "Портфолио" },
      { to: "/about", label: "Обо мне" },
      { to: "/services", label: "Услуги" },
      { to: "/blog", label: "Блог" },
      { to: "/contact", label: "Контакты" },
    ],
    []
  );

  useEffect(() => {
    const routePart = routeTitleForPath(pathname);
    const name = s.photographer_name || s.page_title || "Портфолио";
    if (routePart) {
      document.title = `${routePart} — ${name}`;
    } else {
      document.title = s.page_title || name;
    }
  }, [pathname, s.page_title, s.photographer_name]);

  useEffect(() => {
    let el = document.querySelector('meta[name="description"]');
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("name", "description");
      document.head.appendChild(el);
    }
    el.setAttribute("content", metaDescription(s.bio || s.tagline || ""));
  }, [s.bio, s.tagline]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMenuOpen(false);
    const mainEl = document.getElementById("colorlib-main");
    if (mainEl && typeof mainEl.focus === "function") {
      mainEl.focus();
    }
  }, [pathname]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const effectiveTheme = resolveTheme(themeMode);
      document.documentElement.setAttribute("data-theme", effectiveTheme);
      document.documentElement.style.colorScheme = effectiveTheme;
    };

    const onChange = () => {
      if (themeMode === "system") applyTheme();
    };

    applyTheme();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [themeMode]);

  const effectiveThemeLabel = themeMode === "system" ? "Системная" : themeMode === "dark" ? "Тёмная" : "Светлая";

  const toggleTheme = () => {
    const next = themeMode === "dark" ? "light" : "dark";
    setThemeMode(next);
    localStorage.setItem(THEME_KEY, next);
  };

  return (
    <div className="portfolio-app-shell" id="colorlib-page">
      <a className="portfolio-skip-link" href="#colorlib-main">
        Перейти к содержимому
      </a>
      <header className="portfolio-header" role="banner">
        <div className="portfolio-container portfolio-header-inner">
          <NavLink to="/" className="portfolio-brand" aria-label="На главную">
            <span className="portfolio-brand-name">{s.photographer_name}</span>
            <span className="portfolio-brand-tagline">{(s.tagline || "Фотограф").split("\n")[0]}</span>
          </NavLink>
          <div className="portfolio-header-controls">
            <button
              type="button"
              className="portfolio-theme-toggle"
              onClick={toggleTheme}
              aria-label={`Переключить тему. Сейчас: ${effectiveThemeLabel}`}
              title={`Тема: ${effectiveThemeLabel}`}
            >
              {themeMode === "dark" ? "Светлая тема" : "Тёмная тема"}
            </button>
          </div>
          <button
            type="button"
            className="portfolio-menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="portfolio-primary-nav"
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>
          <nav
            id="portfolio-primary-nav"
            className={`portfolio-nav ${menuOpen ? "portfolio-nav--open" : ""}`}
            aria-label="Основная навигация"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onMouseEnter={() => prefetchRoute(item.to)}
                onFocus={() => prefetchRoute(item.to)}
                className={({ isActive }) => (isActive ? "portfolio-nav-link portfolio-nav-link--active" : "portfolio-nav-link")}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main id="colorlib-main" tabIndex={-1} className="portfolio-main" role="main">
        <div className="portfolio-main-content">
          <Outlet />
        </div>
        <footer className="portfolio-footer">
          <div className="portfolio-container portfolio-footer-inner">
            <div>
              <p className="portfolio-footer-title">Навигация</p>
              <div className="portfolio-footer-nav">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onMouseEnter={() => prefetchRoute(item.to)}
                    onFocus={() => prefetchRoute(item.to)}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
            <address className="portfolio-footer-contacts">
              <p className="portfolio-footer-title">Контакты</p>
              {s.address ? <p>{s.address}</p> : null}
              {s.phone ? <a href={`tel:${s.phone.replace(/\s/g, "")}`}>{s.phone}</a> : null}
              {s.email_public ? <a href={`mailto:${s.email_public}`}>{s.email_public}</a> : null}
            </address>
          </div>
        </footer>
      </main>
    </div>
  );
}
