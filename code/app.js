// Roue des prénoms – logique principale
(function(){
  const LS_PREFIX = 'roue_demo';

  const els = {
    goalInput: document.getElementById('goalInput'),
    namesInput: document.getElementById('namesInput'),
    durationInput: document.getElementById('durationInput'),
    minSpinsInput: document.getElementById('minSpinsInput'),
    shuffleNames: document.getElementById('shuffleNames'),
    saveBtn: document.getElementById('saveBtn'),
    clearBtn: document.getElementById('clearBtn'),
    spinBtn: document.getElementById('spinBtn'),
    goalPreview: document.getElementById('goalPreview'),
    resultCard: document.getElementById('resultCard'),
    resultName: document.getElementById('resultName'),
    resultGoal: document.getElementById('resultGoal'),
    statusBadge: document.getElementById('statusBadge'),
    canvas: document.getElementById('wheelCanvas')
  };

  // Etat
  let names = [];
  let angle = 0; // radians
  let spinning = false;
  let deviceRatio = Math.min(window.devicePixelRatio || 1, 2);

  function normalizeNames(text){
    if (!text) return [];
    // Supporte lignes et virgules
    const raw = text
      .replace(/\r/g, '\n')
      .split(/[,\n]/)
      .map(s => s.trim())
      .filter(Boolean);
    // Uniques, garde ordre d'apparition
    const seen = new Set();
    const out = [];
    for (const n of raw){ if (!seen.has(n.toLowerCase())) { seen.add(n.toLowerCase()); out.push(n); } }
    return out;
  }

  function saveState(){
    localStorage.setItem(LS_PREFIX+':goal', els.goalInput.value || '');
    localStorage.setItem(LS_PREFIX+':names', els.namesInput.value || '');
    localStorage.setItem(LS_PREFIX+':duration', String(parseFloat(els.durationInput.value||'5')));
    localStorage.setItem(LS_PREFIX+':minSpins', String(parseInt(els.minSpinsInput.value||'5',10)));
    flashStatus('Sauvegardé');
  }

  function loadState(){
    const goal = localStorage.getItem(LS_PREFIX+':goal');
    const list = localStorage.getItem(LS_PREFIX+':names');
    const dur  = localStorage.getItem(LS_PREFIX+':duration');
    const spins= localStorage.getItem(LS_PREFIX+':minSpins');
    if (goal !== null) els.goalInput.value = goal;
    if (list !== null) els.namesInput.value = list;
    if (dur  !== null) els.durationInput.value = dur;
    if (spins!== null) els.minSpinsInput.value = spins;
    names = normalizeNames(els.namesInput.value);
    updateGoalPreview();
    draw();
  }

  function updateGoalPreview(){
    els.goalPreview.textContent = els.goalInput.value.trim() || '—';
  }

  function flashStatus(text){
    els.statusBadge.textContent = text;
    els.statusBadge.classList.add('ring-1','ring-pink-500');
    setTimeout(()=>{
      els.statusBadge.textContent = 'Prête';
      els.statusBadge.classList.remove('ring-1','ring-pink-500');
    }, 1000);
  }

  // Dessin de la roue
  function draw(){
    const canvas = els.canvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.clientWidth; // carré via aspect-ratio
    const padding = 12;
    const W = Math.max(200, size);
    const H = W;
    canvas.width = Math.floor(W * deviceRatio);
    canvas.height = Math.floor(H * deviceRatio);
    ctx.scale(deviceRatio, deviceRatio);

    ctx.clearRect(0,0,W,H);
    const cx = W/2, cy = H/2;
    const radius = (Math.min(W,H)/2) - padding;

    // Cercle de fond
    ctx.save();
    const grad = ctx.createRadialGradient(cx, cy, radius*0.2, cx, cy, radius);
    grad.addColorStop(0,'#fce7f3');
    grad.addColorStop(1,'#fbcfe8');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    const n = names.length || 1; // évite NaN
    const slice = (Math.PI*2) / n;
    const palette = ['#f472b6','#60a5fa','#34d399','#f59e0b','#a78bfa','#fb7185','#22d3ee','#84cc16'];

    for (let i=0; i<n; i++){
      const start = angle + i*slice;
      const end   = start + slice;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = palette[i % palette.length];
      ctx.globalAlpha = 0.92;
      ctx.fill();
      ctx.globalAlpha = 1;

      // texte
      const label = names[i] || '—';
      ctx.save();
      ctx.translate(cx, cy);
      const mid = start + slice/2;
      ctx.rotate(mid);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#111827';
      ctx.font = '600 16px system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
      ctx.fillText(label, radius - 14, 6);
      ctx.restore();
    }

    // Cercle intérieur
    ctx.beginPath();
    ctx.arc(cx, cy, radius*0.16, 0, Math.PI*2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  function shuffle(arr){
    for (let i=arr.length-1; i>0; i--){
      const j = Math.floor(Math.random()*(i+1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function pickIndex(finalAngle){
    // Le pointeur est en haut (angle = -PI/2). Trouvons l'index sous le pointeur.
    const n = names.length;
    if (n === 0) return -1;
    const slice = (Math.PI*2) / n;
    // Angle de référence du pointeur
    const pointerAngle = -Math.PI/2;
    // Angle de la roue opposé: quelle tranche recouvre pointerAngle ?
    let a = pointerAngle - finalAngle; // angle relatif
    a = (a % (Math.PI*2) + Math.PI*2) % (Math.PI*2); // wrap [0, 2PI)
    const idx = Math.floor(a / slice);
    return idx;
  }

  function spin(){
    if (spinning) return;
    names = normalizeNames(els.namesInput.value);
    if (names.length < 2){
      flashStatus('Ajoutez au moins 2 prénoms');
      return;
    }
    spinning = true;
    els.spinBtn.disabled = true;
    els.resultCard.classList.add('hidden');

    const duration = Math.max(2, Math.min(12, parseFloat(els.durationInput.value||'5')));
    const minSpins = Math.max(3, Math.min(15, parseInt(els.minSpinsInput.value||'5',10)));

    // destination aléatoire: plusieurs tours + un offset pour un prénom choisi aléatoirement
    const n = names.length;
    const targetIndex = Math.floor(Math.random()*n);
    const slice = (Math.PI*2)/n;
    const targetCenter = targetIndex*slice + slice/2;
    // Nous voulons que pointerAngle (-PI/2) tombe sur targetCenter après spin.
    // Donc finalAngle = pointerAngle - targetCenter (mod 2PI)
    let finalAngle = (-Math.PI/2) - targetCenter;
    // Ajoute des tours complets
    const extra = minSpins * (Math.PI*2);
    const startAngle = angle;
    const delta = extra + ((finalAngle - startAngle) % (Math.PI*2));
    const totalAngle = startAngle + delta;

    const start = performance.now();
    const end = start + duration*1000;

    function easeOutCubic(t){ return 1 - Math.pow(1-t, 3); }

    const tick = (now)=>{
      const p = Math.min(1, (now - start) / (duration*1000));
      const eased = easeOutCubic(p);
      angle = startAngle + eased * delta;
      draw();
      if (p < 1){ requestAnimationFrame(tick); }
      else {
        spinning = false;
        els.spinBtn.disabled = false;
        angle = totalAngle % (Math.PI*2);
        const idx = pickIndex(angle);
        const name = names[idx] || '—';
        els.resultName.textContent = name;
        els.resultGoal.textContent = els.goalInput.value.trim() || '—';
        els.resultCard.classList.remove('hidden');
        flashStatus('Terminé');
      }
    };
    requestAnimationFrame(tick);
  }

  // Events
  els.goalInput.addEventListener('input', ()=>{ updateGoalPreview(); });
  els.namesInput.addEventListener('input', ()=>{ names = normalizeNames(els.namesInput.value); draw(); });
  els.shuffleNames.addEventListener('click', ()=>{
    const arr = normalizeNames(els.namesInput.value);
    shuffle(arr);
    els.namesInput.value = arr.join('\n');
    names = arr; draw();
  });
  els.saveBtn.addEventListener('click', saveState);
  els.clearBtn.addEventListener('click', ()=>{
    els.goalInput.value = '';
    els.namesInput.value = '';
    updateGoalPreview();
    names = [];
    draw();
    localStorage.removeItem(LS_PREFIX+':goal');
    localStorage.removeItem(LS_PREFIX+':names');
  });
  els.spinBtn.addEventListener('click', spin);

  // Resize handling
  const ro = new ResizeObserver(()=>{ draw(); });
  ro.observe(els.canvas);

  // init
  loadState();
  if (!els.namesInput.value){
    // exemple par défaut
    els.namesInput.value = 'Alice\nBob\nCarla\nDavid\nEmma\nFarid';
    names = normalizeNames(els.namesInput.value);
    draw();
  }
})();
