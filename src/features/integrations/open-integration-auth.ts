const DEFAULT_POPUP_WIDTH = 600;
const DEFAULT_POPUP_HEIGHT = 720;

type OpenIntegrationAuthWindowOptions = {
  keepOpener?: boolean;
  /** Open a centered popup instead of a full browser tab. */
  popup?: boolean;
  width?: number;
  height?: number;
};

function buildPopupFeatures(width: number, height: number): string {
  const dualScreenLeft =
    window.screenLeft ?? (window as Window & { screenX?: number }).screenX ?? 0;
  const dualScreenTop =
    window.screenTop ?? (window as Window & { screenY?: number }).screenY ?? 0;
  const viewportWidth =
    window.innerWidth ??
    document.documentElement.clientWidth ??
    window.screen.width;
  const viewportHeight =
    window.innerHeight ??
    document.documentElement.clientHeight ??
    window.screen.height;
  const left = Math.max(0, Math.round(dualScreenLeft + (viewportWidth - width) / 2));
  const top = Math.max(0, Math.round(dualScreenTop + (viewportHeight - height) / 2));

  return [
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
    "popup=yes",
    "resizable=yes",
    "scrollbars=yes",
  ].join(",");
}

export function openIntegrationAuthWindow(
  options?: OpenIntegrationAuthWindowOptions,
): Window | null {
  const width = options?.width ?? DEFAULT_POPUP_WIDTH;
  const height = options?.height ?? DEFAULT_POPUP_HEIGHT;
  const features = options?.popup === true ? buildPopupFeatures(width, height) : undefined;
  const target = options?.popup === true ? "integration-oauth" : "_blank";
  const authWindow = window.open("about:blank", target, features);

  if (authWindow && options?.keepOpener !== true) {
    authWindow.opener = null;
  }

  return authWindow;
}

export function navigateIntegrationAuthUrl(
  url: string,
  authWindow: Window | null,
  options?: Pick<OpenIntegrationAuthWindowOptions, "popup" | "width" | "height">,
): void {
  if (authWindow && !authWindow.closed) {
    authWindow.location.href = url;
    authWindow.focus?.();
    return;
  }

  const width = options?.width ?? DEFAULT_POPUP_WIDTH;
  const height = options?.height ?? DEFAULT_POPUP_HEIGHT;
  const features =
    options?.popup === true ? buildPopupFeatures(width, height) : "noopener,noreferrer";
  const target = options?.popup === true ? "integration-oauth" : "_blank";

  window.open(url, target, features);
}

export function closeIntegrationAuthWindow(authWindow: Window | null): void {
  authWindow?.close();
}
