/**
 * Utility functions for sanitizing and validating image URLs
 */

export function sanitizeImageUrl(url) {
  if (!url || typeof url !== "string") return "";
  let cleanUrl = url.trim();

  // Return immediately for Base64 Data URLs and local static paths
  if (cleanUrl.startsWith("data:image/") || cleanUrl.startsWith("/")) {
    return cleanUrl;
  }

  try {
    const urlObj = new URL(
      cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")
        ? cleanUrl
        : `https://${cleanUrl}`
    );

    // 1. Google Images Search Result (e.g. https://www.google.com/imgres?q=...&imgurl=https%3A%2F%2F...&imgrefurl=...)
    if (
      (urlObj.hostname.includes("google.") || urlObj.hostname.includes("googleusercontent.")) &&
      urlObj.pathname.includes("/imgres")
    ) {
      const imgurl = urlObj.searchParams.get("imgurl");
      if (imgurl) {
        return sanitizeImageUrl(decodeURIComponent(imgurl));
      }
    }

    // 2. Google Redirect URL (e.g. https://www.google.com/url?url=... or ?q=...)
    if (urlObj.hostname.includes("google.") && urlObj.pathname.includes("/url")) {
      const targetUrl = urlObj.searchParams.get("url") || urlObj.searchParams.get("q");
      if (targetUrl) {
        return sanitizeImageUrl(decodeURIComponent(targetUrl));
      }
    }

    // 3. Bing Image Search Result (e.g. https://www.bing.com/images/search?...&mediaurl=https%3A%2F%2F...)
    if (urlObj.hostname.includes("bing.com") && urlObj.pathname.includes("/images")) {
      const mediaurl = urlObj.searchParams.get("mediaurl");
      if (mediaurl) {
        return sanitizeImageUrl(decodeURIComponent(mediaurl));
      }
    }

    return urlObj.toString();
  } catch {
    return cleanUrl;
  }
}
