import React from "react";
import { createRoot } from "react-dom/client";
import { Portfolio } from "@/components/portfolio/Portfolio";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing #root element for Le Quai des Écritures.");
}

createRoot(root).render(
  <React.StrictMode>
    <Portfolio />
  </React.StrictMode>,
);
