import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "@/App";
import "@/styles/index.css";

// registerType "autoUpdate" installs a new service worker silently in the
// background, but an already-open tab keeps running the OLD cached bundle
// until something reloads it — so a fresh deploy could look "not updated"
// even though the new build is live. Force one reload the moment the new SW
// takes control, so a deploy is visible without manually clearing cache.
let refreshing = false;
navigator.serviceWorker?.addEventListener("controllerchange", () => {
  if (refreshing) return;
  refreshing = true;
  window.location.reload();
});

registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(<App />);
