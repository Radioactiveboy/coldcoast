import React from "react";
import { createRoot } from "react-dom/client";
import "./base.css";
import ColdCoast from "./ColdCoast.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ColdCoast />
  </React.StrictMode>
);
