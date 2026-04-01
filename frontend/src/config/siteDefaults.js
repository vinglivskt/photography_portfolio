/**
 * Текстовые дефолты, если в API пустые строки. Картинки — в themeImages.js и фолбэках страниц.
 */
export const SITE_DEFAULTS = {
  photographer_name: "Фотограф",
  page_title: "Портфолио фотографа",
  tagline: "Фотограф\nПортреты, пары, события",
  bio:
    "Снимаю портреты, пары и события. Помогаю с позированием и делаю естественную обработку без перегруза.",
  signature: "Фотограф",
  about_image: "",
  hero_image_1: "",
  hero_image_2: "",
  vk_url: "",
  telegram_url: "",
  instagram_url: "",
  phone: "",
  email_public: "",
  address: "",
  website_url: "",
  counter_equipment: 120,
  counter_studio: 150,
  counter_sessions: 200,
  counter_clients: 200,
  instagram_section_title: "Избранные работы",
};

/**
 * Объединяет данные API с безопасными значениями по умолчанию.
 */
export function mergeSiteSettings(api) {
  if (!api) return { ...SITE_DEFAULTS };
  const out = { ...SITE_DEFAULTS };
  for (const key of Object.keys(SITE_DEFAULTS)) {
    const v = api[key];
    if (key.startsWith("counter_")) {
      if (typeof v === "number" && !Number.isNaN(v)) out[key] = v;
      continue;
    }
    if (v != null && String(v).trim() !== "") {
      out[key] = v;
    }
  }
  return out;
}

export const PLACEHOLDER_MEDIA_SUBSTR = "/placeholders/";

/**
 * Проверяет, что URL указывает на встроенный placeholder.
 */
export function isPlaceholderAssetUrl(url) {
  return typeof url === "string" && url.includes(PLACEHOLDER_MEDIA_SUBSTR);
}
