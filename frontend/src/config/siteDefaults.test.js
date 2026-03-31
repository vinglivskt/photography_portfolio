import { describe, it, expect } from "vitest";
import { mergeSiteSettings, isPlaceholderAssetUrl, SITE_DEFAULTS } from "./siteDefaults.js";

describe("mergeSiteSettings", () => {
  it("возвращает дефолты при отсутствии api", () => {
    const m = mergeSiteSettings(null);
    expect(m.photographer_name).toBe(SITE_DEFAULTS.photographer_name);
    expect(m.counter_equipment).toBe(SITE_DEFAULTS.counter_equipment);
  });

  it("подставляет непустые поля из API", () => {
    const m = mergeSiteSettings({
      ...SITE_DEFAULTS,
      photographer_name: "Иван",
      bio: "Новое био",
      counter_equipment: 99,
    });
    expect(m.photographer_name).toBe("Иван");
    expect(m.bio).toBe("Новое био");
    expect(m.counter_equipment).toBe(99);
  });

  it("игнорирует пустые строки и оставляет дефолт", () => {
    const m = mergeSiteSettings({
      ...SITE_DEFAULTS,
      photographer_name: "   ",
      vk_url: "",
    });
    expect(m.photographer_name).toBe(SITE_DEFAULTS.photographer_name);
  });
});

describe("isPlaceholderAssetUrl", () => {
  it("определяет заглушки media/placeholders", () => {
    expect(isPlaceholderAssetUrl("/media/placeholders/x.svg")).toBe(true);
    expect(isPlaceholderAssetUrl("/static/images/a.jpg")).toBe(false);
    expect(isPlaceholderAssetUrl("")).toBe(false);
  });
});
