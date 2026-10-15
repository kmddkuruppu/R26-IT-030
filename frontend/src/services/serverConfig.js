
const STORAGE_KEY = "letter_helper_server_url";

const DEFAULT_SERVER_URL =
  process.env.REACT_APP_API_URL ||
  process.env.REACT_APP_API_BASE_URL ||
  "https://localhost:8080";

export function getServerUrl() {
  const savedUrl = localStorage.getItem(STORAGE_KEY);
  return savedUrl || DEFAULT_SERVER_URL;
}

export function saveServerUrl(url) {
  const cleanUrl = url.trim().replace(/\/+$/, "");

  const parsedUrl = new URL(cleanUrl);

  if (parsedUrl.protocol !== "https:") {
    throw new Error("Server URL must use HTTPS.");
  }

  if (
    parsedUrl.username ||
    parsedUrl.password ||
    parsedUrl.pathname !== "/" ||
    parsedUrl.search ||
    parsedUrl.hash
  ) {
    throw new Error("Enter only the server address and port.");
  }

  localStorage.setItem(STORAGE_KEY, parsedUrl.origin);

  return parsedUrl.origin;
}

export function resetServerUrl() {
  localStorage.removeItem(STORAGE_KEY);
}
