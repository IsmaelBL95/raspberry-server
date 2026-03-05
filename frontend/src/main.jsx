import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Entry point for the React application.  It mounts the App component
// into the root DOM node.  React.StrictMode is used to highlight
// potential issues in development.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);