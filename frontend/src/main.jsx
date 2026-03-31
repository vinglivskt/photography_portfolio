import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

/** Скрывает прелоадер темы после инициализации React-приложения. */
const hideLoader = () => {
  const el = document.getElementById("ftco-loader");
  if (el) {
    el.classList.remove("show");
    el.setAttribute("aria-busy", "false");
    el.setAttribute("aria-hidden", "true");
    setTimeout(() => el.remove(), 400);
  }
};

window.addEventListener("load", hideLoader);
setTimeout(hideLoader, 2000);
