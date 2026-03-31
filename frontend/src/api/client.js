const BASE = import.meta.env.VITE_API_BASE ?? "";
const GET_RESPONSE_CACHE = new Map();
const IN_FLIGHT_REQUESTS = new Map();

function cacheKey(url, options) {
  const method = (options.method || "GET").toUpperCase();
  return `${method}:${url}`;
}

function cloneJson(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

/**
 * Выполняет HTTP-запрос к API и возвращает JSON.
 */
export async function fetchJson(path, options = {}) {
  const url = `${BASE}${path}`;
  const method = (options.method || "GET").toUpperCase();
  const shouldCache = method === "GET" && !options.noCache;
  const key = cacheKey(url, options);

  if (shouldCache && GET_RESPONSE_CACHE.has(key)) {
    return cloneJson(GET_RESPONSE_CACHE.get(key));
  }
  if (shouldCache && IN_FLIGHT_REQUESTS.has(key)) {
    return cloneJson(await IN_FLIGHT_REQUESTS.get(key));
  }

  const headers = { ...(options.headers || {}) };
  if (options.body != null && headers["Content-Type"] === undefined) {
    headers["Content-Type"] = "application/json";
  }
  const requestPromise = (async () => {
    const res = await fetch(url, {
      ...options,
      headers,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || res.statusText);
    }
    if (res.status === 204) return null;
    const data = await res.json();
    if (shouldCache) {
      GET_RESPONSE_CACHE.set(key, cloneJson(data));
    }
    return data;
  })();

  if (shouldCache) {
    IN_FLIGHT_REQUESTS.set(key, requestPromise);
  }
  try {
    return await requestPromise;
  } finally {
    IN_FLIGHT_REQUESTS.delete(key);
  }
}

/** Прогревает кэш GET-запроса без обязательного ожидания в UI. */
export function prefetchJson(path) {
  return fetchJson(path).catch(() => null);
}
