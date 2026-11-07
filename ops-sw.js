/* Vroombrite staff app: phone alerts for new bookings. Nothing is cached here, so the app always loads fresh. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("push", e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) { d = { title: "Vroombrite", body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "Vroombrite", {
    body: d.body || "", tag: d.tag || undefined, renotify: !!d.tag, icon: "apple-touch-icon.png", badge: "apple-touch-icon.png",
    data: { url: d.url || "ops.html" }
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "ops.html", self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    for (const c of list) if (c.url.split("#")[0] === url.split("#")[0] && "focus" in c) { c.navigate(url); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
