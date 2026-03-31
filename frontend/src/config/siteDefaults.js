/**
 * Значения как в исходном Django-шаблоне / сидах — подставляются, если в API пустые строки.
 */
export const SITE_DEFAULTS = {
  photographer_name: "Фотограф",
  page_title: "Портфолио фотографа",
  tagline: "Фотограф\nСнимаю портреты, истории и события",
  bio:
    "Снимаю портреты, love story, мероприятия и коммерческие проекты. Работаю с естественным светом и в студии, помогаю с позированием и настроением кадра.",
  signature: "Фотограф",
  about_image: "/static/images/vlad.jpg",
  hero_image_1: "/static/images/vlad2.jpg",
  hero_image_2: "/static/images/vlad.jpg",
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
  instagram_section_title: "Follow me on Instagram",
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
