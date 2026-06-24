export function openIntegrationAuthWindow(): Window | null {
  const authWindow = window.open("about:blank", "_blank");

  if (authWindow) {
    authWindow.opener = null;
  }

  return authWindow;
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
