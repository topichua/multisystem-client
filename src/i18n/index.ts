import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/i18n/locales/en.json";
import uk from "@/i18n/locales/uk.json";

export const LOCALE_STORAGE_KEY = "multisale-locale";

function storedLng(): string {
  try {
    const v = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (v === "uk" || v === "en") {
      return v;
    }
  } catch {
    /* private mode etc. */
  }
  return "en";
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    uk: { translation: uk },
  },
  lng: storedLng(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  try {
    localStorage.setItem(
      LOCALE_STORAGE_KEY,
      lng.startsWith("uk") ? "uk" : "en",
    );
  } catch {
    /* ignore */
  }
});

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== LOCALE_STORAGE_KEY || !event.newValue) return;

    const lng = event.newValue === "uk" ? "uk" : "en";
    const current = i18n.language.startsWith("uk") ? "uk" : "en";

    if (current !== lng) {
      void i18n.changeLanguage(lng);
    }
  });
}

export default i18n;
