import { describe, it, expect } from "vitest";
import { routeTitleForPath, ROUTE_PAGE_TITLE } from "./routes.js";

describe("routes", () => {
  it("ROUTE_PAGE_TITLE покрывает все публичные маршруты", () => {
    expect(ROUTE_PAGE_TITLE["/"]).toBeTruthy();
    expect(ROUTE_PAGE_TITLE["/contact"]).toBeTruthy();
  });

  it("routeTitleForPath возвращает подпись или null", () => {
    expect(routeTitleForPath("/blog")).toBe("Блог");
    expect(routeTitleForPath("/unknown")).toBeNull();
  });
});
