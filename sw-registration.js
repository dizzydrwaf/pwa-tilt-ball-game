if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js")
    .then(() => console.log("✅ PWA ready"))
    .catch(err => console.log("❌ SW registration failed:", err));
}
