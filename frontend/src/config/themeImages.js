/**
 * Все файлы из theme/static/images — единая точка правды, ничего не «теряется».
 * Пути отдаются как /static/images/... (Nginx или Vite public).
 */
/** Формирует абсолютный путь к изображению из theme/static/images. */
const img = (file) => `/static/images/${file}`;

export const THEME_IMAGES = {
  portraits: {
    vlad: img("vlad.jpg"),
    vlad2: img("vlad2.jpg"),
    vlad3: img("vlad3.jpg"),
    vlad0: img("vlad_0.jpg"),
  },
  authors: {
    author: img("author.jpg"),
    author2: img("author-2.jpg"),
  },
  backgrounds: {
    bg1: img("bg_1.jpg"),
    bg4: img("bg_4.jpg"),
  },
  /** image_1.jpg … image_12.jpg */
  gallery: Array.from({ length: 12 }, (_, i) => img(`image_${i + 1}.jpg`)),
  team: [img("person_1.jpg"), img("person_2.jpg"), img("person_3.jpg"), img("person_4.jpg")],
  other: {
    ddd: img("ddd.jpg"),
    loc: img("loc.png"),
  },
};

/** Слайдер главной, если в API не заданы кадры */
export const HOME_HERO_DEFAULTS = [THEME_IMAGES.portraits.vlad2, THEME_IMAGES.portraits.vlad];

/** Полоса превью на главной, если коллекция из API пуста */
export const HOME_STRIP_FALLBACK = THEME_IMAGES.gallery.slice(0, 6);

/** Аватар в сайдбаре, если в настройках нет about_image */
export const SIDEBAR_AVATAR_FALLBACK = THEME_IMAGES.portraits.vlad3;

/** Обложка блока «обо мне», если нет about_image */
export const ABOUT_PORTRAIT_FALLBACK = THEME_IMAGES.portraits.vlad;

/** Фон счётчиков на странице «Обо мне» */
export const ABOUT_COUNTER_BG = THEME_IMAGES.backgrounds.bg1;

/** Доп. галерея на «Обо мне» (как в исходном шаблоне) */
export const ABOUT_GALLERY_STRIP = THEME_IMAGES.gallery.slice(0, 5);

/** Вторая полоса на «Обо мне» */
export const ABOUT_GALLERY_STRIP_2 = THEME_IMAGES.gallery.slice(5, 10);

/** Пустая коллекция — показать примеры кадров */
export const COLLECTION_EMPTY_MOSAIC = [
  ...THEME_IMAGES.gallery.slice(6, 12),
  THEME_IMAGES.portraits.vlad0,
  THEME_IMAGES.authors.author,
];
