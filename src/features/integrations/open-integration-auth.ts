export function openIntegrationAuthWindow(): Window | null {
  return window.open("about:blank", "_blank", "noopener,noreferrer");
}

export function navigateIntegrationAuthUrl(
  url: string,
  authWindow: Window | null,
): void {
  if (authWindow && !authWindow.closed) {
    authWindow.location.href = url;
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

export function closeIntegrationAuthWindow(authWindow: Window | null): void {
  authWindow?.close();
}
