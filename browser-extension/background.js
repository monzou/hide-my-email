const HOST_NAME = "com.hide_my_email.native";
const DEBOUNCE_MS = 3000;

let syncTimer = null;
let isSyncing = false;
let lastIconState = null;

// --- Cookie extraction -------------------------------------------------------

async function getICloudCookies() {
  const cookies = await chrome.cookies.getAll({ domain: ".icloud.com" });
  if (cookies.length === 0) return "";
  const seen = new Map();
  for (const c of cookies) {
    seen.set(c.name, c.value);
  }
  return [...seen.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

// --- Sync --------------------------------------------------------------------

async function syncCookies() {
  if (isSyncing) return;
  isSyncing = true;
  try {
    await doSync();
  } finally {
    isSyncing = false;
  }
}

async function doSync() {
  const cookieString = await getICloudCookies();
  if (!cookieString.toUpperCase().includes("X-APPLE")) {
    setStatus("none");
    return;
  }

  // Skip if cookies haven't changed since last successful sync
  const stored = await chrome.storage.local.get(["lastCookieString"]);
  if (stored.lastCookieString === cookieString) {
    return;
  }

  try {
    const response = await chrome.runtime.sendNativeMessage(HOST_NAME, {
      action: "setup",
      cookies: cookieString,
    });
    if (response && response.success) {
      setStatus("ok");
      await chrome.storage.local.set({
        lastSync: Date.now(),
        dsid: response.dsid,
        lastError: null,
        lastCookieString: cookieString,
      });
    } else {
      const error = (response && response.error) || "Unknown error";
      setStatus("error");
      await chrome.storage.local.set({ lastError: error });
    }
  } catch (e) {
    setStatus("error");
    await chrome.storage.local.set({ lastError: e.message });
  }
}

function scheduleSync() {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    syncTimer = null;
    syncCookies();
  }, DEBOUNCE_MS);
}

// --- Icon --------------------------------------------------------------------

function setStatus(state) {
  if (state === lastIconState) return;
  lastIconState = state;
  drawIcon(state);
  chrome.action.setBadgeText({ text: "" });
}

function drawIcon(state) {
  const size = 32;
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Envelope body
  ctx.fillStyle = state === "ok" ? "#fff" : "#888";
  ctx.beginPath();
  ctx.roundRect(3, 8, 26, 18, 3);
  ctx.fill();

  // Envelope flap (V line)
  ctx.strokeStyle = state === "ok" ? "#999" : "#555";
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(4, 9);
  ctx.lineTo(16, 19);
  ctx.lineTo(28, 9);
  ctx.stroke();

  // Status dot (bottom-right corner)
  const colors = { ok: "#50e3c2", error: "#ee5555", none: "#666" };
  ctx.beginPath();
  ctx.arc(26, 22, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#000";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(26, 22, 4, 0, Math.PI * 2);
  ctx.fillStyle = colors[state] || colors.none;
  ctx.fill();

  const imageData = ctx.getImageData(0, 0, size, size);
  chrome.action.setIcon({ imageData: { 32: imageData } });
}

// --- Event listeners ---------------------------------------------------------

// Sync when iCloud page finishes loading
chrome.webNavigation.onCompleted.addListener(
  (details) => {
    if (details.frameId !== 0) return;
    scheduleSync();
  },
  { url: [{ hostSuffix: ".icloud.com" }] }
);

// Sync when iCloud cookies change (debounced)
chrome.cookies.onChanged.addListener((changeInfo) => {
  if (changeInfo.removed) return;
  if (!changeInfo.cookie.domain.includes("icloud.com")) return;
  scheduleSync();
});

// Sync on extension install/update
chrome.runtime.onInstalled.addListener(() => {
  syncCookies();
});

// Restore icon state on service worker startup
chrome.storage.local.get(["lastSync", "lastError"], (data) => {
  if (data.lastSync && !data.lastError) {
    setStatus("ok");
  } else if (data.lastError) {
    setStatus("error");
  } else {
    setStatus("none");
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === "sync") {
    syncCookies().then(() => sendResponse({ done: true }));
    return true;
  }
});
