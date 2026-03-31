import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchJson } from "../api/client.js";
import { mergeSiteSettings } from "../config/siteDefaults.js";

const SettingsContext = createContext(null);

/** Загружает настройки сайта и предоставляет их всему приложению. */
export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => mergeSiteSettings(null));
  const [rawSettings, setRawSettings] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let retryId = null;

    const loadSettings = async () => {
      try {
        const data = await fetchJson("/api/settings");
        if (cancelled) return;
        setRawSettings(data);
        setSettings(mergeSiteSettings(data));
      } catch {
        if (cancelled) return;
        // API может быть недоступен в первые секунды старта контейнера.
        // Оставляем дефолтные значения и пробуем снова.
        retryId = window.setTimeout(loadSettings, 1500);
      }
    };

    loadSettings();
    return () => {
      cancelled = true;
      if (retryId) window.clearTimeout(retryId);
    };
  }, []);

  const value = useMemo(() => {
    return {
      settings,
      rawSettings,
      reload: () => window.location.reload(),
    };
  }, [settings, rawSettings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

/** Возвращает только публичные настройки сайта из контекста. */
export function useSiteSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSiteSettings вне SettingsProvider");
  return ctx.settings;
}
