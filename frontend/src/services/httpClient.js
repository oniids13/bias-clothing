// Centralized, safer HTTP client for the frontend

const normalizeOrigin = (url) => (url ? url.replace(/\/$/, "") : url);

export const ORIGIN = normalizeOrigin(import.meta.env.VITE_API_URL || "");
export const API_BASE_URL = `${ORIGIN}/api`;
export const AUTH_BASE_URL = `${ORIGIN}/auth`;

let cachedCsrfToken = null;
let csrfAttempted = false;

async function fetchCsrfToken() {
  if (cachedCsrfToken || csrfAttempted) return cachedCsrfToken;
  csrfAttempted = true;
  try {
    const res = await fetch(`${ORIGIN}/csrf-token`, {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return null; // likely CSRF disabled on server
    const data = await res.json().catch(() => ({}));
    cachedCsrfToken = data?.csrfToken || null;
    return cachedCsrfToken;
  } catch {
    return null;
  }
}

function buildHeaders(inputHeaders, hasBody, isFormData) {
  const headers = new Headers(inputHeaders || {});
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (hasBody && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return headers;
}

async function withTimeout(fetchPromise, ms = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetchPromise(controller.signal);
    return res;
  } finally {
    clearTimeout(id);
  }
}

async function coreFetch(baseUrl, path, options = {}) {
  const url = `${baseUrl}${path}`;
  const method = (options.method || "GET").toUpperCase();
  const isUnsafe = !["GET", "HEAD", "OPTIONS"].includes(method);

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  const hasBody = Boolean(options.body);
  const headers = buildHeaders(options.headers, hasBody, isFormData);

  // Attach CSRF token for unsafe methods when available
  if (isUnsafe) {
    const token = await fetchCsrfToken();
    if (token && !headers.has("X-CSRF-Token"))
      headers.set("X-CSRF-Token", token);
  }

  // Auto-JSON stringify for plain objects
  let bodyToSend = options.body;
  if (hasBody && !isFormData && typeof bodyToSend === "object") {
    bodyToSend = JSON.stringify(bodyToSend);
  }

  const doFetch = (signal) =>
    fetch(url, {
      ...options,
      method,
      headers,
      body: bodyToSend,
      credentials: options.credentials || "include",
      cache: options.cache || "no-store",
      signal,
    });

  const response = await withTimeout(doFetch, options.timeoutMs || 15000);

  let data = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json().catch(() => null);
  } else if (contentType && contentType.includes("application/pdf")) {
    data = await response.blob();
  } else {
    data = await response.text().catch(() => null);
  }

  if (!response.ok) {
    const message =
      (data && (data.message || data.error)) || `HTTP ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const apiFetch = (path, options) =>
  coreFetch(API_BASE_URL, path, options);
export const authFetch = (path, options) =>
  coreFetch(AUTH_BASE_URL, path, options);
