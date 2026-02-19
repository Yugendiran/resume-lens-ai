import useAuthStore from "~/store/auth";
import timePlugin from "~/plugins/time.js";

export default defineNuxtPlugin(async (_nuxtApp) => {
  const accessTokenName = "resumeLensAccessToken";
  const refreshTokenName = "resumeLensRefreshToke";
  const apiUrl = useRuntimeConfig().public.RESUME_LENS_API_URL;
  const loginPath = "/login";

  let accessToken = useCookie(accessTokenName);
  let refreshToken = useCookie(refreshTokenName);

  const isUrl = (path) => {
    return path.startsWith("http://") || path.startsWith("https://");
  };

  const MAX_RETRIES = 3;
  const NON_RETRYABLE_STATUSES = new Set([400, 401, 404]);

  let isRefreshing = false;
  let refreshSubscribers = [];

  async function onRefreshed(token) {
    await Promise.all(refreshSubscribers.map((callback) => callback(token)));
  }

  function addRefreshSubscriber(callback) {
    refreshSubscribers.push(callback);
  }

  const fetchWithRetry = async (path, options, retries = MAX_RETRIES) => {
    try {
      const res = await fetch(path, options);
      // Only retry if status code is not ok and not in non-retryable statuses
      if (!res.ok && !NON_RETRYABLE_STATUSES.has(res.status) && retries > 0) {
        // Add delay between retries to avoid overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return await fetchWithRetry(path, options, retries - 1);
      }
      return res;
    } catch (error) {
      if (retries > 0) {
        // Add delay between retries for network errors too
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return await fetchWithRetry(path, options, retries - 1);
      }
      throw error;
    }
  };

  // Helper function to normalize headers (case-insensitive)
  const normalizeHeaders = (headers = {}) => {
    const normalized = {};

    // Ensure headers is an object
    if (!headers || typeof headers !== "object") {
      headers = {};
    }

    // Copy all existing headers
    Object.entries(headers).forEach(([key, value]) => {
      if (value !== undefined) {
        normalized[key] = value;
      }
    });

    // Normalize Content-Type
    const contentType =
      headers.contentType || headers["Content-Type"] || headers["content-type"];
    if (contentType) {
      normalized["Content-Type"] = contentType;
      delete normalized.contentType;
      delete normalized["content-type"];
    } else {
      normalized["Content-Type"] = "application/json";
    }

    // Normalize Authorization
    const authorization =
      headers.authorization ||
      headers.Authorization ||
      headers["authorization"] ||
      headers["Authorization"];

    if (authorization) {
      normalized["Authorization"] = authorization;
    } else if (accessToken.value) {
      normalized["Authorization"] = `Bearer ${accessToken.value}`;
    }

    if (refreshToken.value) {
      normalized["X-Refresh-Token"] = "true";
    }

    return normalized;
  };

  // Helper function to handle authentication redirects
  const handleAuthRedirect = async (data, originalPath, originalOptions) => {
    if (data?.login === false) {
      if (refreshToken.value) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            let res = await useAuthStore().authenticateUserRefresh();
            isRefreshing = false;

            if (res?.success) {
              accessToken = useCookie(accessTokenName, {
                expires: new Date(
                  timePlugin().provide.utcToLocal(
                    res.accessTokenExp,
                    "YYYY-MM-DD HH:mm:ss",
                  ),
                ),
              });
              accessToken.value = res.accessToken;
              await onRefreshed(res.accessToken);
              refreshSubscribers = [];

              // Retry the original request with the new token
              const updatedOptions = {
                ...originalOptions,
                headers: {
                  ...originalOptions.headers,
                  Authorization: `Bearer ${res.accessToken}`,
                },
              };
              const url = `${
                isUrl(originalPath) ? "" : `${apiUrl + "/resume-lens/api"}`
              }${originalPath}`;
              const retryRes = await fetchWithRetry(url, updatedOptions);
              try {
                return await retryRes.json();
              } catch (error) {
                console.error("Failed to parse retry response:", error);
                return { error: "Invalid response format on retry" };
              }
            } else {
              // Clear subscribers on failed refresh
              refreshSubscribers = [];
              useRouter().push(loginPath);
            }
          } catch (error) {
            isRefreshing = false;
            refreshSubscribers = [];
            console.error("Token refresh failed:", error);
            useRouter().push(loginPath);
          }
        } else {
          return await new Promise((resolve) => {
            addRefreshSubscriber((token) => {
              const updatedOptions = {
                ...originalOptions,
                headers: {
                  ...originalOptions.headers,
                  Authorization: `Bearer ${token}`,
                },
              };
              const url = `${
                isUrl(originalPath) ? "" : `${apiUrl + "/resume-lens/api"}`
              }${originalPath}`;
              resolve(
                fetchWithRetry(url, updatedOptions).then((res) => {
                  try {
                    return res.json();
                  } catch (error) {
                    console.error(
                      "Failed to parse subscriber retry response:",
                      error,
                    );
                    return {
                      error: "Invalid response format on subscriber retry",
                    };
                  }
                }),
              );
            });
          });
        }
      } else {
        useRouter().push(loginPath);
      }
    }
  };

  // Generic request handler
  const makeRequest = async (method, path, body = null, headers = {}) => {
    const options = {
      method: method.toUpperCase(),
      headers: normalizeHeaders(headers),
    };

    // Add body for methods that support it
    if (body && ["POST", "PUT", "PATCH", "DELETE"].includes(options.method)) {
      options.body = JSON.stringify(body);
    }

    const url = `${isUrl(path) ? "" : `${apiUrl + "/resume-lens/api"}`}${path}`;
    const res = await fetchWithRetry(url, options);

    let data;
    data = await res.json();

    // Handle authentication redirects only for JSON responses
    if (typeof data === "object" && data !== null) {
      const authResult = await handleAuthRedirect(data, path, options);
      return authResult || data;
    }

    return data;
  };

  const http = {
    get: (path, headers) => makeRequest("GET", path, null, headers),
    post: (path, body, headers) => makeRequest("POST", path, body, headers),
    put: (path, body, headers) => makeRequest("PUT", path, body, headers),
    delete: (path, body, headers) => makeRequest("DELETE", path, body, headers),
    patch: (path, body, headers) => makeRequest("PATCH", path, body, headers),
  };

  return {
    provide: {
      http,
    },
  };
});
