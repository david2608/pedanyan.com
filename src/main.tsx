import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/archivo/400.css";
import "@fontsource/archivo/500.css";
import "@fontsource/archivo/700.css";
import "@fontsource/archivo/800.css";
import "@fontsource/archivo/900.css";
import "@fontsource/permanent-marker/400.css";
import "@fontsource-variable/inter";
import { AppRouter } from "./davit-wireframe/DavitWireframe";
import "./davit-wireframe/davitWireframe.css";

// A release marker makes each publish unambiguous to browser caches.
document.documentElement.dataset.release = "2026-09-12.2";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>
);
