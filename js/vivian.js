// =========================
// XP SOUNDS, MOBILE OVERLAY & BOOT FLOW
// =========================

// Hauptsounds
const soundStart        = document.getElementById('xpSoundStart');
const soundShutdown     = document.getElementById('xpSoundShutdown');
const errorSound        = document.getElementById('xpErrorSound');        // Boot-Error
const lockedErrorSound  = document.getElementById('xpLockedErrorSound');  // Lock-Error
const dingSound         = document.getElementById('xpDingSound');
const balloonSound      = document.getElementById('xp-balloon-sound');

// Mobile Overlay
const mobileTapOverlay = document.getElementById('mobileTapOverlay');
const mobileTapButton  = document.getElementById('mobileTapButton');

// Error Dialog (Boot-Error)
const errorOverlay   = document.getElementById('xpErrorOverlay');
const errorOkBtn     = document.getElementById('xpErrorOk');
const errorCloseBtn  = document.querySelector('.xp-error-close');

// Balloon-Elemente
const balloon      = document.getElementById('xp-balloon');
const balloonClose = document.querySelector('.xp-balloon-close');

// Lock-Dialog (für gesperrte Programme)
const lockedOverlay   = document.getElementById('xpLockedOverlay');
const lockedOkBtn     = document.getElementById('xpLockedOk');
const lockedCloseBtn  = document.querySelector('.xp-locked-close');

let bootPlayed           = false;  // ob Startsound schon gespielt wurde
let bootSequenceStarted  = false;  // ob mobile Boot-Sequenz gestartet wurde
let desktopFlowStarted   = false;  // ob Error + Balloon-Timer laufen
let errorDialogOpen      = false;
let lockedDialogOpen     = false;
let currentLockedWindow  = null;


// =========================
// AUDIO UNLOCK – für alle außer Startsound
// =========================

function unlockExtraAudio() {
  const sounds = [
    soundShutdown,
    errorSound,
    lockedErrorSound,
    dingSound,
    balloonSound
  ].filter(Boolean);

  sounds.forEach(a => {
    a.muted = true;
    const p = a.play();
    if (p && p.then) {
      p.then(() => {
        a.pause();
        a.currentTime = 0;
        a.muted = false;
      }).catch(() => {
        a.muted = false;
      });
    } else {
      a.muted = false;
    }
  });
}


// =========================
// BOOT-ERROR DIALOG (nach 5s)
// =========================

function openErrorDialog() {
  if (!errorOverlay) return;

  errorOverlay.setAttribute('aria-hidden', 'false');
  errorDialogOpen = true;

  if (errorSound) {
    errorSound.currentTime = 0;
    errorSound.play().catch(() => {});
  }

  if (navigator.vibrate) {
    navigator.vibrate([120, 60, 120]);
  }
}

function closeErrorDialog() {
  if (!errorOverlay) return;

  errorOverlay.setAttribute('aria-hidden', 'true');
  errorDialogOpen = false;
}

if (errorOkBtn) {
  errorOkBtn.addEventListener('click', closeErrorDialog);
}
if (errorCloseBtn) {
  errorCloseBtn.addEventListener('click', closeErrorDialog);
}

// Klicks außerhalb vom Boot-Error → Ding + Shake
document.addEventListener(
  'click',
  (e) => {
    if (!errorDialogOpen) return;

    const modal = document.querySelector('.xp-error-modal');

    if (e.target.closest('.xp-error-modal')) {
      return; // Klick im Dialog erlauben
    }

    e.stopPropagation();
    e.preventDefault();

    if (modal) {
      modal.classList.remove('shake');
      void modal.offsetWidth; // Reflow
      modal.classList.add('shake');
    }

    if (dingSound) {
      dingSound.currentTime = 0;
      dingSound.play().catch(() => {});
    }

    if (navigator.vibrate) {
      navigator.vibrate(80);
    }
  },
  true
);


// =========================
// LOCKED DIALOG (für gesperrte Sachen)
// =========================

function openLockedDialog(win) {
  if (!lockedOverlay) return;

  // Fenster merken, das gesperrt ist
  currentLockedWindow = win || null;

  lockedOverlay.setAttribute('aria-hidden', 'false');
  lockedDialogOpen = true;

  if (lockedErrorSound) {
    lockedErrorSound.currentTime = 0;
    lockedErrorSound.play().catch(() => {});
  }

  if (navigator.vibrate) {
    navigator.vibrate([80, 40, 80]);
  }
}

function closeLockedDialog() {
  if (!lockedOverlay) return;

  lockedOverlay.setAttribute('aria-hidden', 'true');
  lockedDialogOpen = false;

  // wenn ein gesperrtes Fenster zu diesem Dialog gehört → schließen
  if (currentLockedWindow) {
    closeWindow(currentLockedWindow);
    currentLockedWindow = null;
  }
}

if (lockedOkBtn) {
  lockedOkBtn.addEventListener('click', closeLockedDialog);
}
if (lockedCloseBtn) {
  lockedCloseBtn.addEventListener('click', closeLockedDialog);
}

// Klicks außerhalb vom Locked-Dialog → Ding + Shake
document.addEventListener(
  'click',
  (e) => {
    if (!lockedDialogOpen) return;

    if (e.target.closest('.xp-error-modal')) {
      return;
    }

    e.stopPropagation();
    e.preventDefault();

    const modal = lockedOverlay ? lockedOverlay.querySelector('.xp-error-modal') : null;
    if (modal) {
      modal.classList.remove('shake');
      void modal.offsetWidth;
      modal.classList.add('shake');
    }

    if (dingSound) {
      dingSound.currentTime = 0;
      dingSound.play().catch(() => {});
    }

    if (navigator.vibrate) {
      navigator.vibrate(60);
    }
  },
  true
);


// =========================
// BALLOON-NOTIFICATION
// =========================

function showXPBalloon() {
  if (!balloon) return;

  if (balloonSound) {
    balloonSound.currentTime = 0;
    balloonSound.play().catch(() => {});
  }

  balloon.setAttribute('aria-hidden', 'false');

  setTimeout(() => {
    hideXPBalloon();
  }, 10000);
}

function hideXPBalloon() {
  if (!balloon) return;
  balloon.setAttribute('aria-hidden', 'true');
}

if (balloonClose) {
  balloonClose.addEventListener('click', hideXPBalloon);
}


// =========================
// DESKTOP-FLOW (Boot-Error + Balloon)
// =========================

function startDesktopFlow() {
  if (desktopFlowStarted) return;
  desktopFlowStarted = true;

  setTimeout(openErrorDialog, 5000);   // Boot-Error
  setTimeout(showXPBalloon, 15000);    // Balloon
}


// =========================
// MOBILE BOOT SEQUENCE
// =========================

function beginMobileBoot() {
  if (!mobileTapOverlay) return;
  if (bootSequenceStarted) return;
  bootSequenceStarted = true;

  mobileTapOverlay.setAttribute('aria-hidden', 'true');

  if (soundStart) {
    soundStart.currentTime = 0;
    const playPromise = soundStart.play();
    const fallbackDelay = 8000;

    const scheduleAfterBoot = () => {
      const dur = soundStart.duration;
      const delay = dur && !isNaN(dur) && dur > 0 ? dur * 1000 : fallbackDelay;
      setTimeout(() => startDesktopFlow(), delay);
    };

    if (playPromise && playPromise.then) {
      playPromise
        .then(() => {
          bootPlayed = true;
          unlockExtraAudio();

          soundStart.onended = () => startDesktopFlow();
          scheduleAfterBoot();
        })
        .catch(() => {
          unlockExtraAudio();
          setTimeout(startDesktopFlow, 500);
        });
    } else {
      bootPlayed = true;
      unlockExtraAudio();
      soundStart.onended = () => startDesktopFlow();
      scheduleAfterBoot();
    }
  } else {
    unlockExtraAudio();
    startDesktopFlow();
  }
}

if (mobileTapButton) {
  mobileTapButton.addEventListener('click', beginMobileBoot);
}


// =========================
// DOMCONTENTLOADED: DESKTOP vs. MOBILE
// =========================

window.addEventListener('DOMContentLoaded', () => {
  const isTouch  = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmall  = window.innerWidth <= 900;
  const isMobile = isTouch && isSmall;

  if (isMobile) {
    if (mobileTapOverlay) {
      mobileTapOverlay.setAttribute('aria-hidden', 'false');
    }
  } else {
    if (soundStart && !bootPlayed) {
      soundStart.currentTime = 0;
      soundStart.play().catch(() => {});
      bootPlayed = true;
    }

    unlockExtraAudio();
    startDesktopFlow();
  }
});


// =========================
// UHR IM TRAY (24h)
// =========================

function updateClock() {
  const el = document.getElementById('xpClock');
  if (!el) return;

  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');

  el.textContent = `${h}:${m}`;
}

updateClock();
setInterval(updateClock, 10000);


// =========================
// VOLLBILD-BUTTON IM TRAY
// =========================

const fullscreenBtn = document.querySelector('.xp-tray-fullscreen');

function toggleFullscreen() {
  const doc = document;
  const docEl = document.documentElement;

  if (!doc.fullscreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    if (docEl.requestFullscreen) {
      docEl.requestFullscreen();
    } else if (docEl.webkitRequestFullscreen) {
      docEl.webkitRequestFullscreen();
    } else if (docEl.msRequestFullscreen) {
      docEl.msRequestFullscreen();
    }
  } else {
    if (doc.exitFullscreen) {
      doc.exitFullscreen();
    } else if (doc.webkitExitFullscreen) {
      doc.webkitExitFullscreen();
    } else if (doc.msExitFullscreen) {
      doc.msExitFullscreen();
    }
  }
}

if (fullscreenBtn) {
  fullscreenBtn.addEventListener('click', toggleFullscreen);
}


// =========================
// WINDOW & TASKBAR-LOGIK
// =========================

const windows = Array.from(document.querySelectorAll('.xp-window'));
const icons   = Array.from(document.querySelectorAll('.xp-icon'));
const taskButtonsContainer = document.getElementById('taskButtons');

let zCounter = 10;
const taskButtons = new Map();

function bringToFront(win) {
  zCounter += 1;
  win.style.zIndex = zCounter;
  const id = win.id;
  taskButtons.forEach((btn, key) => {
    btn.classList.toggle('active', key === id);
  });
}

// Icon/Taskbar Icon anwenden
function applyWindowIcon(win, btn) {
  const iconPath = win.dataset.icon;
  if (!iconPath) return;

  const hdrIcon = win.querySelector('.xp-window-icon');
  if (hdrIcon) hdrIcon.src = iconPath;

  if (btn) {
    const iconImg = document.createElement('img');
    iconImg.src = iconPath;
    iconImg.className = 'xp-task-button-icon';

    const text = btn.textContent;
    btn.textContent = '';
    btn.appendChild(iconImg);

    const span = document.createElement('span');
    span.textContent = text;
    btn.appendChild(span);
  }
}

// Fenster öffnen (inkl. Locked-Handling)
function openWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;

  const isLocked = win.dataset.locked === 'true';

  // Fenster sichtbar machen
  win.removeAttribute('aria-hidden');

  let btn = taskButtons.get(id);
  if (!btn) {
    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'xp-task-button active';
    btn.textContent = win.dataset.title || 'Window';

    taskButtons.set(id, btn);
    taskButtonsContainer.appendChild(btn);

    applyWindowIcon(win, btn);

    btn.addEventListener('click', () => {
      const hidden = win.getAttribute('aria-hidden') === 'true';
      if (hidden) win.setAttribute('aria-hidden', 'false');
      bringToFront(win);
    });
  }

  applyWindowIcon(win, btn);
  bringToFront(win);

  // Wenn gesperrt: nach kurzer Zeit Locked-Dialog öffnen
  if (isLocked) {
    setTimeout(() => {
      openLockedDialog(win);
    }, 800); // 0,8s; bei Bedarf anpassen
  }
}

function closeWindow(win) {
  win.setAttribute('aria-hidden', 'true');
  const id = win.id;
  const btn = taskButtons.get(id);
  if (btn) {
    btn.remove();
    taskButtons.delete(id);
  }
}

// Desktop Icons: Doppelklick
icons.forEach(icon => {
  const winId = icon.dataset.window;
  if (!winId) return;

  icon.addEventListener('dblclick', () => {
    openWindow(winId);
  });
});

// Buttons im Fenster (Close/Min/Max) + Drag + Resize
windows.forEach(win => {
  const closeBtn = win.querySelector('.btn-close');
  const minBtn   = win.querySelector('.btn-min');
  const maxBtn   = win.querySelector('.btn-max');

  if (closeBtn) {
    closeBtn.addEventListener('click', () => closeWindow(win));
  }

  if (minBtn) {
    minBtn.addEventListener('click', () => {
      win.setAttribute('aria-hidden', 'true');
    });
  }

  if (maxBtn) {
    let maximized = false;
    const original = {
      top: win.style.top,
      left: win.style.left,
      width: win.style.width,
      height: win.style.height
    };

    maxBtn.addEventListener('click', () => {
      if (!maximized) {
        original.top = win.style.top;
        original.left = win.style.left;
        original.width = win.style.width;
        original.height = win.style.height;

        win.style.top = '10px';
        win.style.left = '10px';
        win.style.width = (window.innerWidth - 30) + 'px';
        win.style.height = (window.innerHeight - 60) + 'px';
        maximized = true;
      } else {
        win.style.top = original.top;
        win.style.left = original.left;
        win.style.width = original.width;
        win.style.height = original.height;
        maximized = false;
      }
      bringToFront(win);
    });
  }

  win.addEventListener('mousedown', () => bringToFront(win));

  // Dragging über Header
  const header = win.querySelector('.xp-window-header');
  if (header) {
    let isDragging = false;
    let startX, startY, startLeft, startTop;

    header.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      isDragging = true;
      bringToFront(win);
      startX = e.clientX;
      startY = e.clientY;
      const rect = win.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      let newLeft = startLeft + dx;
      let newTop  = startTop + dy;

      const margin = 10;
      newLeft = Math.max(margin - win.offsetWidth + 80, Math.min(newLeft, window.innerWidth - margin));
      newTop  = Math.max(0, Math.min(newTop, window.innerHeight - 80));

      win.style.left = newLeft + 'px';
      win.style.top  = newTop + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      document.body.style.userSelect = '';
    });
  }

  // Resize über Ecke
  const handle = win.querySelector('.xp-window-resize');
  if (handle) {
    let resizing = false;
    let startX, startY, startW, startH;

    handle.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      resizing = true;
      bringToFront(win);
      const rect = win.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      startW = rect.width;
      startH = rect.height;
      e.preventDefault();
      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
      if (!resizing) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const newW = Math.max(260, startW + dx);
      const newH = Math.max(150, startH + dy);
      win.style.width  = newW + 'px';
      win.style.height = newH + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (!resizing) return;
      resizing = false;
      document.body.style.userSelect = '';
    });
  }
});


// =========================
// GLOBALER FADE (Graustufen) FÜR SHUTDOWN
// =========================

const fadeTargets = document.querySelectorAll(
  '.xp-wallpaper, .xp-window, .xp-taskbar, .xp-start-menu, .xp-icons'
);

function startGlobalFade() {
  fadeTargets.forEach(el => {
    el.style.transition = 'filter 4s ease';
    el.style.filter = 'grayscale(0) brightness(1)';
    void el.offsetWidth;
    el.style.filter = 'grayscale(1) brightness(0.5)';
  });
}

function resetGlobalFade() {
  fadeTargets.forEach(el => {
    el.style.transition = 'filter 2s ease';
    el.style.filter = 'grayscale(0) brightness(1)';
  });
}


// =========================
// START MENU & LOGOFF
// =========================

const startBtn  = document.querySelector('.xp-start-btn');
const startMenu = document.getElementById('xpStartMenu');
let startOpen   = false;

function setStartOpen(open) {
  startOpen = open;
  if (!startMenu || !startBtn) return;
  startMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
  startBtn.classList.toggle('active', open);
  startBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
}

if (startBtn && startMenu) {
  startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setStartOpen(!startOpen);
  });

  document.addEventListener('click', (e) => {
    if (!startOpen) return;
    if (!startMenu.contains(e.target) && !startBtn.contains(e.target)) {
      setStartOpen(false);
    }
  });
}

// Startmenü-Einträge (inkl. Alle Programme / Zuletzt verwendet)
const startItems = document.querySelectorAll(
  '.xp-start-item[data-window], .xp-all-programs-item[data-window]'
);

startItems.forEach(item => {
  const winId = item.dataset.window;
  if (!winId) return;

  item.addEventListener('click', () => {
    openWindow(winId);
    setStartOpen(false);
  });
});

// Logoff
const logoffBtn = document.querySelector('.xp-start-logoff');
if (logoffBtn) {
  logoffBtn.addEventListener('click', () => {
    if (soundShutdown) {
      soundShutdown.currentTime = 0;
      soundShutdown.play().catch(() => {
        window.location.href = 'index.html';
      });
      soundShutdown.onended = () => {
        window.location.href = 'index.html';
      };
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 6000);
    } else {
      window.location.href = 'index.html';
    }
  });
}


// =========================
// SHUTDOWN / STANDBY / RESTART
// =========================

const shutdownBtn      = document.querySelector('.xp-start-shutdown');
const shutdownOverlay  = document.getElementById('xpShutdown');
const shutdownCancel   = document.getElementById('xpShutdownCancel');

const standbyBtn       = document.querySelector('.xp-shutdown-standby');
const turnoffBtn       = document.querySelector('.xp-shutdown-turnoff');
const restartBtn       = document.querySelector('.xp-shutdown-restart');

const blackScreen      = document.getElementById('xpBlackScreen');
const screensaver      = document.getElementById('xpScreensaver');
const screensaverVideo = document.getElementById('xpScreensaverVideo');

function openShutdownDialog() {
  if (!shutdownOverlay) return;
  shutdownOverlay.setAttribute('aria-hidden', 'false');
}

function closeShutdownDialog() {
  if (!shutdownOverlay) return;
  shutdownOverlay.setAttribute('aria-hidden', 'true');
}

// Turn Off Computer Button im Startmenü
if (shutdownBtn) {
  shutdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setStartOpen(false);
    startGlobalFade();
    openShutdownDialog();
  });
}

// Cancel
if (shutdownCancel) {
  shutdownCancel.addEventListener('click', () => {
    closeShutdownDialog();
    resetGlobalFade();
  });
}

if (shutdownOverlay) {
  shutdownOverlay.addEventListener('click', (e) => {
    if (e.target === shutdownOverlay) {
      closeShutdownDialog();
      resetGlobalFade();
    }
  });
}

// Stand By
if (standbyBtn && screensaver && screensaverVideo) {
  standbyBtn.addEventListener('click', () => {
    closeShutdownDialog();
    screensaver.setAttribute('aria-hidden', 'false');
    screensaverVideo.currentTime = 0;
    screensaverVideo.play().catch(() => {});
  });

  screensaver.addEventListener('click', () => {
    screensaver.setAttribute('aria-hidden', 'true');
    screensaverVideo.pause();
    resetGlobalFade();
  });
}

// Turn Off
if (turnoffBtn && blackScreen) {
  turnoffBtn.addEventListener('click', () => {
    closeShutdownDialog();

    if (soundShutdown) {
      soundShutdown.currentTime = 0;
      soundShutdown.play().catch(() => {});
    }

    blackScreen.setAttribute('aria-hidden', 'false');
  });

  blackScreen.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
}

// Restart
if (restartBtn) {
  restartBtn.addEventListener('click', () => {
    closeShutdownDialog();

    if (soundShutdown) {
      soundShutdown.currentTime = 0;
      soundShutdown.play().catch(() => {
        window.location.href = 'index.html';
      });

      soundShutdown.onended = () => {
        window.location.href = 'index.html';
      };

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 6000);
    } else {
      window.location.href = 'index.html';
    }
  });
}


// =========================
// PROJECTS EXPLORER
// =========================

const projectsOverview = document.querySelector('.xp-projects-overview');
const projectPanels    = document.querySelectorAll('.xp-project-detail');
const projectFolders   = document.querySelectorAll('.xp-project-folder');
const addrInput        = document.getElementById('xpAddress');
const navBackBtn       = document.querySelector('.xp-nav-back');

function showProjectsOverview() {
  if (projectsOverview) projectsOverview.hidden = false;
  projectPanels.forEach(p => p.hidden = true);
  if (addrInput) addrInput.value = 'Meine Projekte';
}

projectFolders.forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.project;
    const panel = document.getElementById(id);
    if (!panel) return;

    if (projectsOverview) projectsOverview.hidden = true;
    projectPanels.forEach(p => p.hidden = (p !== panel));
    if (addrInput) addrInput.value = `Meine Projekte/${btn.textContent.trim()}`;
  });
});

document.querySelectorAll('[data-project-back]').forEach(btn => {
  btn.addEventListener('click', showProjectsOverview);
});

if (navBackBtn) {
  navBackBtn.addEventListener('click', showProjectsOverview);
}


// =========================
// KONTAKT – FORMSPREE + XP SUCCESS DIALOG
// =========================

const contactForm     = document.getElementById('contactForm');
const successOverlay  = document.getElementById('xpSuccessOverlay');
const successOkBtn    = document.getElementById('xpSuccessOk');
const successCloseBtn = document.querySelector('.xp-success-close');
const successSound    = document.getElementById('xpSuccessSound');

function openSuccessDialog() {
  if (!successOverlay) return;

  successOverlay.setAttribute('aria-hidden', 'false');

  if (successSound) {
    successSound.currentTime = 0;
    successSound.play().catch(() => {});
  }

  if (navigator.vibrate) {
    navigator.vibrate([80, 40, 80]);
  }
}

function closeSuccessDialog() {
  if (!successOverlay) return;
  successOverlay.setAttribute('aria-hidden', 'true');
}

if (successOkBtn) {
  successOkBtn.addEventListener('click', closeSuccessDialog);
}
if (successCloseBtn) {
  successCloseBtn.addEventListener('click', closeSuccessDialog);
}

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Browser soll NICHT zur Formspree Seite navigieren

    const formData = new FormData(contactForm);

    try {
      const response = await fetch('https://formspree.io/f/xgvqkrbq', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });

      if (response.ok) {
        // Formularfelder zurücksetzen, "An" bleibt ja readonly
        contactForm.reset();

        // XP Erfolg Dialog öffnen
        openSuccessDialog();
      } else {
        alert('Es ist ein Fehler beim Versenden aufgetreten. Du kannst mich alternativ direkt unter vivian@degelau.com erreichen.');
      }
    } catch (err) {
      alert('Es gab ein Netzwerkproblem beim Versenden. Bitte probiere es später noch einmal oder schreibe direkt an vivian@degelau.com.');
    }
  });
}



window.addEventListener('contextmenu', e => {
  e.preventDefault();
});

window.addEventListener('keydown', e => {
  if ((e.ctrlKey && e.shiftKey && e.key === 'I') || e.key === 'F12') {
    e.preventDefault();
  }
});