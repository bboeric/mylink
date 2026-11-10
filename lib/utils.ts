export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").slice(0, 24);
}

export function checkUsername(username: string): boolean {
  return /^[a-z0-9_]{3,24}$/.test(username);
}

export function normalizeWebUrl(raw: string): string {
  const value = raw.trim();
  if (!value) throw new Error("URL을 입력해 주세요.");
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  let result: URL;
  try { result = new URL(candidate); } catch { throw new Error("올바른 주소를 입력해 주세요."); }
  if (!["https:", "http:"].includes(result.protocol) || !result.hostname.includes(".")) {
    throw new Error("http 또는 https 웹사이트 주소만 사용할 수 있어요.");
  }
  return result.toString();
}

export function prettyHost(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}

export function messageOf(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "작업 중 오류가 발생했어요.";
}
