import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "react-phone-number-input/style.css";
import "./index.css";
import { BrowserRouter } from "react-router";

import { App } from "@/app/app";
import { FeatureProviders } from "@/app/feature-providers";
import { RootProviders } from "@/app/root-providers";
import "@/i18n";
import { initDayJs } from "@/utils/date-time";
import "@vidstack/react/player/styles/base.css";
import "@vidstack/react/player/styles/plyr/theme.css";

initDayJs();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootProviders>
      <BrowserRouter>
        <FeatureProviders>
          <App />
        </FeatureProviders>
      </BrowserRouter>
    </RootProviders>
  </StrictMode>,
);
