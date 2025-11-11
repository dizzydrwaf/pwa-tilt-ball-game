if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/pwa-tilt-ball-game/service-worker.js")
    .then(() => console.log("✅ PWA ready"))
    .catch(err => console.log("❌ SW registration failed:", err));
}
