import LZString from "lz-string";

export function buildShareUrl(rle: string, themeKey: string): string {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set("rle", LZString.compressToEncodedURIComponent(rle));
  url.searchParams.set("theme", themeKey);
  return url.toString();
}

export function decodeSharedPattern(param: string): string {
  if (!param) return "";
  const decompressed = LZString.decompressFromEncodedURIComponent(param);
  return decompressed || "";
}
