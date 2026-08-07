export function openExportDownload(
  url: string,
  fileName?: string | null,
): void {
  const anchor = document.createElement("a");
  anchor.href = url;
  if (fileName) {
    anchor.download = fileName;
  }
  anchor.rel = "noopener noreferrer";
  anchor.target = "_blank";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
