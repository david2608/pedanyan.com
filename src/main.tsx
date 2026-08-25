import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/archivo/400.css";
import "@fontsource/archivo/500.css";
import "@fontsource/archivo/700.css";
import "@fontsource/archivo/800.css";
import "@fontsource/archivo/900.css";
import { AppRouter } from "./davit-wireframe/DavitWireframe";
import "./davit-wireframe/davitWireframe.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>
);
