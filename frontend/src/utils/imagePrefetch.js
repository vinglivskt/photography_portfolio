import { prefetchJson, prefetchImageUrls } from "../api/client.js";
import { isPlaceholderAssetUrl } from "../config/siteDefaults.js";

export function collectionImageUrlsFromResponse(res) {
  if (!res?.items?.length) return [];
  return res.items
    .map((c) => c.image_url)
    .filter((u) => u && !isPlaceholderAssetUrl(u));
}

export function blogImageUrlsFromResponse(res) {
  if (!res?.items?.length) return [];
  return res.items
    .map((p) => p.image_url)
    .filter((u) => u && !isPlaceholderAssetUrl(u));
}

export function prefetchCollectionPage(page, perPage = 6) {
  prefetchJson(`/api/collections?page=${page}&per_page=${perPage}`).then((res) => {
    prefetchImageUrls(collectionImageUrlsFromResponse(res));
  });
}

export function prefetchBlogPage(page, perPage = 6) {
  prefetchJson(`/api/blog?page=${page}&per_page=${perPage}`).then((res) => {
    prefetchImageUrls(blogImageUrlsFromResponse(res));
  });
}
