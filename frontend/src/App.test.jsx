import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App.jsx";
import { stubFetchApi } from "./test/testUtils.jsx";

describe("App", () => {
  beforeEach(() => {
    stubFetchApi();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("после загрузки настроек показывает layout и главную", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("navigation", { name: /основная навигация/i })).toBeInTheDocument();
    });

    expect(screen.getAllByText("Тест Фотограф").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /перейти к содержимому/i })).toBeInTheDocument();
    expect(document.getElementById("colorlib-main")).toBeTruthy();
  });

  it("не уходит в белый экран при ошибке /api/settings", async () => {
    vi.stubGlobal("fetch", (input) => {
      const url = typeof input === "string" ? input : input.url;
      if (url.includes("/api/settings")) {
        return Promise.resolve({
          ok: false,
          status: 502,
          text: () => Promise.resolve("bad gateway"),
        });
      }
      if (url.includes("/api/collections")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ items: [], page: 1, pages: 1, total: 0, per_page: 6 }),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      });
    });

    render(
      <MemoryRouter initialEntries={["/collection"]}>
        <App />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("navigation", { name: /основная навигация/i })).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /(моя коллекция|портфолио)/i })).toBeInTheDocument();
    });
  });
});
