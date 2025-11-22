// Boot -> Login Transition
const boot        = document.getElementById('boot');
const loginHeader = document.getElementById('loginHeader');
const loginMain   = document.getElementById('loginMain');
const loginFooter = document.getElementById('loginFooter');

// Respektiert reduzierte Bewegungen
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// etwas kürzer, damit es sich flüssiger anfühlt
const BOOT_TIME = prefersReduced ? 600 : 2000; // ms

function showLogin() {
  if (!boot) return;

  // Fade-Out starten
  boot.classList.add('fade-out');

  // nach Ende des Fades: Boot ausblenden, Login zeigen
  setTimeout(() => {
    boot.style.display = 'none';
    [loginHeader, loginMain, loginFooter].forEach(el => {
      if (el) el.hidden = false;
    });
  }, 800); // muss zu deiner CSS-Animation .boot.fade-out passen
}

// Sobald alles geladen ist, Bootscreen kurz anzeigen, dann rüber zum Login
window.addEventListener('load', () => {
  setTimeout(showLogin, BOOT_TIME);
});




window.addEventListener('contextmenu', e => {
  e.preventDefault();
});

window.addEventListener('keydown', e => {
  if ((e.ctrlKey && e.shiftKey && e.key === 'I') || e.key === 'F12') {
    e.preventDefault();
  }
});