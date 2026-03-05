const views = {
  connected: document.getElementById("connected"),
  empty: document.getElementById("empty"),
  error: document.getElementById("error-view"),
};

function show(name) {
  for (const [key, el] of Object.entries(views)) {
    el.style.display = key === name ? "block" : "none";
  }
}

function updateStatus() {
  chrome.storage.local.get(["lastSync", "dsid", "lastError"], (data) => {
    if (data.lastSync && !data.lastError) {
      show("connected");
      document.getElementById("dsid").textContent = data.dsid || "—";
      document.getElementById("last-sync").textContent = formatTimeAgo(data.lastSync);
    } else if (data.lastError) {
      show("error");
      document.getElementById("error-text").textContent = data.lastError.replace(/\. (?=[A-Z])/g, ".\n");
    } else {
      show("empty");
    }
  });
}

function doSync(btn) {
  const label = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Syncing...";
  chrome.runtime.sendMessage({ action: "sync" }, () => {
    btn.disabled = false;
    btn.textContent = label;
    updateStatus();
  });
}

document.querySelectorAll(".sync-btn").forEach((btn) => {
  btn.addEventListener("click", function () { doSync(this); });
});

function formatTimeAgo(ts) {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return Math.floor(sec / 60) + "m ago";
  if (sec < 86400) return Math.floor(sec / 3600) + "h ago";
  return Math.floor(sec / 86400) + "d ago";
}

updateStatus();
