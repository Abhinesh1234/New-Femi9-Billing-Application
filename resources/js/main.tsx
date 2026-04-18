// ── Axios interceptors must be set up before any service imports ──────────────
import { setupAxios } from "./core/setupAxios";
setupAxios();
// ─────────────────────────────────────────────────────────────────────────────

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import store from "./core/redux/store";
import { base_path } from "./environment";
import ALLRoutes from "./routes/router";
import AuthProvider from "./routes/AuthProvider";
import DynamicTitle from "./routes/dynamicTitle";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@tabler/icons-webfont/dist/tabler-icons.css";
import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "react-quill-new/dist/quill.snow.css";
import "./index.scss";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter basename={base_path}>
        {/* AuthProvider verifies stored token on page load before rendering routes */}
        <AuthProvider>
          <ALLRoutes />
          <DynamicTitle />
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
