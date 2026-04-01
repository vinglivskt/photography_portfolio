import { vi } from "vitest";
import { mockSettingsResponse } from "./fixtures/api.js";

/** Подменяет fetch в тестах и возвращает предсказуемые ответы API. */
export function stubFetchApi(options = {}) {
  const collections = options.collections ?? { items: [] };
  const settings = options.settings ?? mockSettingsResponse;

  vi.stubGlobal("fetch", (input) => {
    const url = typeof input === "string" ? input : input.url;
    if (url.includes("/api/settings")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(settings),
      });
    }
    if (url.includes("/api/collections")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(collections),
      });
    }
    const blogPath = url.split("?")[0];
    if (/\/api\/blog\/\d+$/.test(blogPath)) {
      return Promise.resolve({
        ok: false,
        status: 404,
        text: () => Promise.resolve("not found"),
      });
    }
    if (url.includes("/api/blog")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ items: [], page: 1, pages: 1, total: 0, per_page: 6 }),
      });
    }
    if (url.includes("/api/services")) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve([
            {
              id: 1,
              title: "Услуга",
              description: "Описание",
              icon_class: "flaticon-camera",
              booking_url: "https://t.me/test",
              sort_order: 10,
            },
          ]),
      });
    }
    return Promise.resolve({
      ok: false,
      status: 404,
      text: () => Promise.resolve("not found"),
    });
  });
}
