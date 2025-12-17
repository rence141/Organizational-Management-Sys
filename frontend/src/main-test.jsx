import React from "react";
import ReactDOM from "react-dom/client";

function App() {
  return React.createElement('div', null, 'Hello World - Basic Test');
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
