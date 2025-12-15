// React entry: mounts <App/> into #root in index.html
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css"; // Tailwind is imported here

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* StrictMode helps catch common mistakes during development */}
    <App />
  </React.StrictMode>
);