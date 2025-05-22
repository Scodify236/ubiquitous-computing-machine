import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import "./index.css";
import { useThemeStore, getEffectiveTheme } from "./store/themeStore";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// Initialize theme from stored preference or system
const initialTheme = useThemeStore.getState().theme;
const effectiveTheme = getEffectiveTheme(initialTheme);
document.documentElement.classList.add(effectiveTheme);

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);

// Register service worker for offline functionality and PWA features
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    if (registration && registration.waiting) {
      // When new content is available, and the user confirms, tell the service worker to take control
      if (window.confirm('New version available! Update now?')) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  },
  onSuccess: (registration) => {
    console.log('Velin is now available offline!', registration);
    
    // Force skip waiting to help with installation
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  },
  // Force registration even in development
  forceDev: true
});
