/**
 * Пути к файлам из theme/static/images (копируются в public/static при сборке).
 * Список совпадает с реальными autor/*.jpg и photo/* в репозитории.
 */
const img = (rel) => `/static/images/${rel}`;

const PHOTO_RELS = Array.from({ length: 30 }, (_, i) => {
  const n = i + 1;
  return n === 11 ? "photo/11.jpeg" : `photo/${n}.jpg`;
});

const AUTOR_RELS = Array.from({ length: 5 }, (_, i) => `autor/${i + 1}.jpg`);

export const THEME_IMAGES = {
  /** Портреты в autor/ */
  autor: AUTOR_RELS.map(img),
  /** Работы в photo/ */
  gallery: PHOTO_RELS.map(img),
};

export const GALLERY_LEN = THEME_IMAGES.gallery.length;

/** Слайдер главной, если в API не заданы кадры */
export const HOME_HERO_DEFAULTS = [img("photo/2.jpg"), img("photo/1.jpg")];

/** Полоса превью на главной, если коллекция из API пуста */
export const HOME_STRIP_FALLBACK = THEME_IMAGES.gallery.slice(0, 6);

/** Обложка блока «обо мне», если нет about_image */
export const ABOUT_PORTRAIT_FALLBACK = THEME_IMAGES.autor[0];

/** Доп. галерея на «Обо мне» */
export const ABOUT_GALLERY_STRIP = THEME_IMAGES.gallery.slice(0, 5);

/** Пустая коллекция — показать примеры кадров */
export const COLLECTION_EMPTY_MOSAIC = [
  ...THEME_IMAGES.gallery.slice(6, 12),
  ...THEME_IMAGES.autor.slice(0, 2),
];

/** Заглушки постов блога, если API пустой */
export const BLOG_FALLBACK_POST_URLS = THEME_IMAGES.gallery.slice(0, 4);
