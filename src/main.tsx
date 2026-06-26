import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "@/App";
import "@/styles/index.css";

if (import.meta.env.PROD) {
  // registerType "autoUpdate" installs a new service worker silently in the
  // background, but an already-open tab keeps running the OLD cached bundle
  // until something reloads it. Force one reload when the new SW takes control.
  let refreshing = false;
  navigator.serviceWorker?.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  registerSW({ immediate: true });
} else {
  navigator.serviceWorker?.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => void registration.unregister());
  });
}

createRoot(document.getElementById("root")!).render(<App />);
