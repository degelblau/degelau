// Helpers
const $  = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

let z = 10; // z-index

// Desktop icons
$$('.icon').forEach(ic=>{
  ic.addEventListener('dblclick',()=>openWindow(ic.dataset.open));
  ic.addEventListener('keydown',e=>{ if(e.key==='Enter') openWindow(ic.dataset.open) });
  ic.tabIndex = 0;
});

// Open/close/minimize
function openWindow(sel){
  const win = $(sel);
  if(!win) return;
  show(win); bringToFront(win); ensureTask(win);
}
function closeWindow(win){
  hide(win); removeTask(win.id);
}
function minimizeWindow(win){
  hide(win);
  const task = $('#task-'+win.id);
  if(task) task.classList.add('pulse');
}

// Show/Hide/Front
function show(el){ el.classList.remove('hidden'); }
function hide(el){ el.classList.add('hidden'); }
function bringToFront(win){ win.style.zIndex = ++z; }

// Init windows
$$('.window').forEach(win=>{
  win.addEventListener('mousedown',()=>bringToFront(win));

  // drag
  const bar = $('[data-drag]', win);
  let dragging=false, startX=0, startY=0, startL=0, startT=0;

  bar.addEventListener('mousedown',e=>{
    dragging=true;
    startX=e.clientX; startY=e.clientY;
    const rect=win.getBoundingClientRect();
    startL=rect.left; startT=rect.top;
    bringToFront(win);
    e.preventDefault();
  });
  document.addEventListener('mousemove',e=>{
    if(!dragging) return;
    const dx=e.clientX-startX, dy=e.clientY-startY;
    win.style.left = Math.max(0, startL+dx) + 'px';
    win.style.top  = Math.max(0, startT+dy) + 'px';
  });
  document.addEventListener('mouseup',()=>dragging=false);

  // resize
  const res = $('[data-resize]', win);
  if(res){
    let resizing=false, sX=0, sY=0, sW=0, sH=0;
    res.addEventListener('mousedown',e=>{
      resizing=true;
      const r=win.getBoundingClientRect();
      sX=e.clientX; sY=e.clientY; sW=r.width; sH=r.height; 
      bringToFront(win);
      e.preventDefault();
    });
    document.addEventListener('mousemove',e=>{
      if(!resizing) return;
      const dx=e.clientX-sX, dy=e.clientY-sY;
      win.style.width  = Math.max(300, sW+dx) + 'px';
      win.style.height = Math.max(180, sH+dy) + 'px';
    });
    document.addEventListener('mouseup',()=>resizing=false);
  }

  // buttons
  $('[data-close]', win)?.addEventListener('click',()=>closeWindow(win));
  $('[data-minimize]', win)?.addEventListener('click',()=>minimizeWindow(win));
});

// Taskbar
const tasks = $('#tasks');
function ensureTask(win){
  const id = 'task-'+win.id;
  if($('#'+id)){ $('#'+id).classList.remove('pulse'); return; }
  const el = document.createElement('button');
  el.className = 'task'; el.id = id;
  el.textContent = win.querySelector('.titlebar .title').innerText;
  el.addEventListener('click',()=>{
    if(win.classList.contains('hidden')) show(win);
    bringToFront(win);
  });
  tasks.appendChild(el);
}
function removeTask(winId){
  $('#task-'+winId)?.remove();
}

// Start button
$('#btnStart')?.addEventListener('click',()=>{
  const user = document.documentElement.getAttribute('data-user') || 'unbekannt';
  const msg = `Angemeldet als ${user}\n\nStartmenü (Demo):\n• Über mich\n• Projekte\n• Kontakt\n• Abmelden (zur Startseite)`;
  if(confirm(msg)) location.href = 'index.html';
});

// Clock
function tick(){
  const d = new Date();
  const n = d.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});
  $('#clock') && ($('#clock').textContent = n);
  setTimeout(tick, 1000);
}
tick();

// Quick open default window
window.addEventListener('load',()=>{
  // öffnet automatisch „Über“ beim Einstieg
  const about = $('#win-about');
  if(about){ openWindow('#win-about'); }
});