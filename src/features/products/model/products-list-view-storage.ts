export type ProductsListViewMode = "list" | "grid";

const STORAGE_KEY = "multisale.productsListViewMode";

export function readStoredProductsListViewMode(): ProductsListViewMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "grid") {
      return "grid";
    }
    if (raw === "list") {
      return "list";
    }
  } catch {
    /* ignore */
  }
  return "list";
}

export function writeStoredProductsListViewMode(
  mode: ProductsListViewMode,
): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}
