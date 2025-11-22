// Icons doppelklick zum Öffnen
document.querySelectorAll(".xp-icon").forEach(icon => {
  icon.addEventListener("dblclick", () => {
    const id = icon.getAttribute("data-window");
    if (!id) return;
    const win = document.getElementById(id);
    if (win) {
      win.hidden = false;
      win.style.zIndex = Date.now(); // sehr simple Reihenfolge
    }
  });
});

// Close Buttons
document.querySelectorAll(".xp-window-close").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.getAttribute("data-close");
    const win = document.getElementById(id);
    if (win) {
      win.hidden = true;
    }
  });
});

// Uhr in der Taskleiste
function updateXpClock() {
  const el = document.getElementById("xpClock");
  if (!el) return;
  const now = new Date();
  const options = { hour: "numeric", minute: "2-digit" };
  el.textContent = now.toLocaleTimeString("en-US", options);
}
updateXpClock();
setInterval(updateXpClock, 30000);