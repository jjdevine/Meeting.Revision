const CACHE_NAME = "meeting-prep-v1";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/supabase-config.js",
  "/data/manifest.json",
  "/data/decks/architect-playbook.json",
  "/data/decks/domain-cheatsheet.json",
  "/data/decks/meeting-responses.json",
  "/data/decks/objection-handlers.json",
  "/data/decks/architecture-overreach.json",
  "/data/scenarios/platform-consolidation.json",
  "/data/scenarios/golden-source-debate.json",
  "/data/scenarios/realtime-everything.json",
  "/data/scenarios/ai-pitch.json",
  "/data/scenarios/one-workflow-engine.json",
  "/data/scenarios/single-pane-of-glass.json",
  "/data/scenarios/golden-source-programme.json",
  "/data/scenarios/identity-boundaries.json",
  "/data/scenarios/reporting-truth-fight.json",
  "/data/scenarios/shared-policy-hub.json",
  "/data/scenarios/workflow-platform-mandate.json",
  "/data/scenarios/expenses-module-activation.json",
  "/data/scenarios/expenses-claim-policy-enforcement.json",
  "/data/scenarios/expenses-ocr-receipts.json",
  "/data/scenarios/expenses-policy-guidance.json",
  "/data/scenarios/expenses-mileage-analytics-integrations.json",
  "/data/scenarios/expenses-rules-engine-and-extraction.json",
];

// Pre-cache all static assets on install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Remove old caches on activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

// Cache-first strategy; strip cache-busting query params before cache lookup
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Strip the cache-bust `v` param used by app.js so cache keys are stable
  url.searchParams.delete("v");
  const cacheKey = url.toString();

  event.respondWith(
    caches.match(cacheKey).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (!response || !response.ok) return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(cacheKey, clone));
          return response;
        })
        .catch(() => {
          // For navigation requests, serve the cached shell so the app loads offline
          if (event.request.mode === "navigate") {
            return caches.match("/index.html");
          }
          // For other requests (assets, API calls), signal a network failure
          return Response.error();
        });
    })
  );
});
