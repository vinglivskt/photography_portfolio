/**
 * Минимальные дефолты до ответа API (только если поле в API пустое).
 * Весь контент сайта задаётся в БД.
 */
export const SITE_DEFAULTS = {
  photographer_name: "",
  public_short_name: "",
  page_title: "",
  tagline: "",
  hero_subtitle: "",
  bio: "",
  signature: "",
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
  counter_equipment: 0,
  counter_studio: 0,
  counter_sessions: 0,
  counter_clients: 0,
  instagram_section_title: "",
  author_images: [],
};

/**
 * Объединяет данные API с безопасными значениями по умолчанию.
 */
export function mergeSiteSettings(api) {
  if (!api) return { ...SITE_DEFAULTS };
  const out = { ...SITE_DEFAULTS };
  for (const key of Object.keys(SITE_DEFAULTS)) {
    if (key === "author_images") {
      if (Array.isArray(api.author_images) && api.author_images.length > 0) {
        out.author_images = api.author_images.filter(Boolean);
      }
      continue;
    }
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
