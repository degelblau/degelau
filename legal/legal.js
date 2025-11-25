// js/legal.js
document.addEventListener("DOMContentLoaded", () => {
  const closeBtn = document.getElementById("legalCloseBtn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      // Ziel ggf. anpassen
      window.location.href = "/vivian/index.html";
    });
  }

  // Optional: Maximize-Button toggelt eine Klasse (falls du später was willst)
  const maxBtn = document.querySelector(".xp-legal-window .btn-max");
  const win    = document.getElementById("legalWindow");

  if (maxBtn && win) {
    maxBtn.addEventListener("click", () => {
      win.classList.toggle("legal-window-max");
      // aktuell keine andere Optik nötig, Fenster ist sowieso fullscreen
    });
  }

  // Minimieren kann hier einfach nichts tun oder history.back()
});

// Verhindert Rechtsklick und DevTools im Legal-Bereich

window.addEventListener('contextmenu', e => {
  e.preventDefault();
});

window.addEventListener('keydown', e => {
  if ((e.ctrlKey && e.shiftKey && e.key === 'I') || e.key === 'F12') {
    e.preventDefault();
  }
});