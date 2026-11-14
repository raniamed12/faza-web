import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/figtree";
import "@fontsource/reem-kufi";
import "@fontsource/homemade-apple";
import "@fontsource/caveat";
import "@fontsource/titan-one";
import "@fontsource-variable/fraunces";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/pages.css";
import "./styles/benna.css";
import "./styles/deco.css";
import App from "./App.jsx";
import { AuthProvider, ToastProvider } from "./context.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider><AuthProvider><App /></AuthProvider></ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
