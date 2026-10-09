import { useState } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { installDragScroll } from "./lib/dragScroll";
import "./styles/app.css";
import "./styles/themes.css";

function Root() {
  const [sessionKey, setSessionKey] = useState(0);

  return (
    <ErrorBoundary onReset={() => setSessionKey((value) => value + 1)}>
      <App key={sessionKey} />
    </ErrorBoundary>
  );
}

const root = document.getElementById("root");
if (!root) {
  throw new Error("Missing root element.");
}

installDragScroll();
createRoot(root).render(<Root />);
