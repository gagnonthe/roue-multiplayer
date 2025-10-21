// === Configuration ===
// URL du serveur par défaut
function getDefaultServerUrl() {
  // URL Render déployée
  return 'https://roue-server-6z57.onrender.com';
}

let serverUrl = document.getElementById('serverUrlInput')?.value || getDefaultServerUrl();
let socket = null;
let isHost = false;
let currentSessionCode = null;
let playerName = null;

// === Éléments DOM ===
const choiceScreen = document.getElementById('choiceScreen');
const hostScreen = document.getElementById('hostScreen');
const participantScreen = document.getElementById('participantScreen');
const connectionStatus = document.getElementById('connectionStatus');

// === Initialisation configuration serveur (override persistant) ===
(() => {
  const input = document.getElementById('serverUrlInput');
  const current = document.getElementById('serverUrlCurrent');
  const saved = localStorage.getItem('serverUrlOverride');

  if (saved) {
    serverUrl = saved;
    if (input) input.value = saved;
  } else {
    // Synchroniser l'UI avec l'auto-détection, pas la valeur codée en dur dans le HTML
    const autodetected = getDefaultServerUrl();
    serverUrl = autodetected;
    if (input) input.value = autodetected;
  }

  if (current) current.textContent = serverUrl;
})();

// === Initialisation Socket.IO ===
function connectToServer() {
  // Préférer la valeur choisie (override) si présente, sinon l'entrée; puis retomber sur la valeur courante
  const inputVal = document.getElementById('serverUrlInput')?.value?.trim();
  const saved = localStorage.getItem('serverUrlOverride');
  serverUrl = saved || inputVal || serverUrl;
  const current = document.getElementById('serverUrlCurrent');
  if (current) current.textContent = serverUrl;
  
  socket = io(serverUrl, {
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log('✅ Connecté au serveur');
    connectionStatus.innerHTML = '✅ Connecté au serveur';
    connectionStatus.className = 'p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-sm text-center';
    // Cacher le lien d'aide si connexion OK
    const helpLink = document.getElementById('helpLink');
    if (helpLink) helpLink.classList.add('hidden');
  });

  socket.on('disconnect', () => {
    console.log('❌ Déconnecté');
    connectionStatus.innerHTML = '❌ Déconnecté du serveur';
    connectionStatus.className = 'p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-sm text-center';
  });

  socket.on('connect_error', (err) => {
    console.error('Erreur connexion:', err);
    connectionStatus.innerHTML = '⚠️ Impossible de se connecter au serveur';
    connectionStatus.className = 'p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-sm text-center';
    // Afficher le lien d'aide après 2 secondes
    setTimeout(() => {
      const helpLink = document.getElementById('helpLink');
      if (helpLink) helpLink.classList.remove('hidden');
    }, 2000);
    connectionStatus.className = 'p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-sm text-center';
  });

  // === Événements serveur ===
  socket.on('session_created', (data) => {
    console.log('Session créée:', data);
    currentSessionCode = data.code;
    isHost = true;
    showHostScreen(data.code);
  });

  socket.on('session_joined', (data) => {
    console.log('Session rejointe:', data);
    currentSessionCode = data.code;
    isHost = false;
    showParticipantScreen(data);
  });

  socket.on('participant_joined', (data) => {
    console.log('Participant rejoint:', data);
    updateParticipantLists(data.participants);
  });

  socket.on('participant_left', (data) => {
    console.log('Participant parti:', data);
    updateParticipantLists(data.participants);
  });

  socket.on('objective_updated', (data) => {
    console.log('Objectif mis à jour:', data.objective);
    if (!isHost) {
      document.getElementById('displayObjective').textContent = data.objective || 'Aucun objectif défini';
    }
  });

  socket.on('wheel_spinning', (data) => {
    console.log('🎡 La roue tourne!', data);
    // Désactiver le bouton de lancement pendant l'animation
    const launchBtn = document.getElementById('launchWheelBtn');
    if (launchBtn) launchBtn.disabled = true;
    showWheel(data.participants, data.objective);
  });

  socket.on('wheel_result', (data) => {
    console.log('🎯 Résultat:', data);
    setTimeout(() => {
      // Afficher une animation pour tout le monde, avec un texte adapté
      if (data.is_winner) {
        showWinnerScreen(data.winner);
      } else {
        showResultScreen(data.winner);
      }
      // Réactiver le bouton de lancement côté host
      const launchBtn = document.getElementById('launchWheelBtn');
      if (launchBtn) launchBtn.disabled = false;
    }, 5000);
  });

  socket.on('error', (data) => {
    alert('❌ ' + data.message);
  });
}

// === Enregistrement de l'URL serveur ===
document.getElementById('saveServerUrlBtn')?.addEventListener('click', () => {
  const input = document.getElementById('serverUrlInput');
  const current = document.getElementById('serverUrlCurrent');
  const val = (input?.value || '').trim();

  if (!val) {
    localStorage.removeItem('serverUrlOverride');
    serverUrl = getDefaultServerUrl();
    if (input) input.value = serverUrl;
  } else {
    try {
      // Valide minimalement l'URL
      new URL(val);
    } catch (e) {
      alert('URL invalide. Exemple: https://192.168.1.7:5000');
      return;
    }
    localStorage.setItem('serverUrlOverride', val);
    serverUrl = val;
  }

  if (current) current.textContent = serverUrl;

  // Reconnexion avec la nouvelle URL
  try { socket?.disconnect(); } catch (e) {}
  connectToServer();
});

// === Test de connexion (ping /health) ===
document.getElementById('testServerUrlBtn')?.addEventListener('click', async () => {
  const input = document.getElementById('serverUrlInput');
  const statusEl = document.getElementById('testServerStatus');
  const raw = (input?.value || serverUrl).trim();
  if (!raw) return;
  const base = raw.replace(/\/$/, '');
  const url = base + '/health';
  if (statusEl) {
    statusEl.textContent = 'Test…';
    statusEl.className = 'ml-2 text-xs text-gray-500';
  }
  try {
    const res = await fetch(url, { mode: 'cors', cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    await res.json().catch(() => ({}));
    if (statusEl) {
      statusEl.textContent = '✅ OK';
      statusEl.className = 'ml-2 text-xs font-semibold text-green-600 dark:text-green-400';
    }
  } catch (e) {
    if (statusEl) {
      statusEl.textContent = '❌ Échec';
      statusEl.className = 'ml-2 text-xs font-semibold text-red-600 dark:text-red-400';
    }
  }
});

// === Affichage des écrans ===
function showChoiceScreen() {
  choiceScreen.classList.remove('hidden');
  hostScreen.classList.add('hidden');
  participantScreen.classList.add('hidden');
  document.getElementById('wheelContainer').classList.add('hidden');
  currentSessionCode = null;
  isHost = false;
}

function showHostScreen(code) {
  choiceScreen.classList.add('hidden');
  hostScreen.classList.remove('hidden');
  participantScreen.classList.add('hidden');
  document.getElementById('sessionCode').textContent = code;
}

function showParticipantScreen(data) {
  choiceScreen.classList.add('hidden');
  hostScreen.classList.add('hidden');
  participantScreen.classList.remove('hidden');
  document.getElementById('joinedSessionCode').textContent = data.code;
  document.getElementById('displayObjective').textContent = data.objective || 'En attente de l\'objectif...';
  updateParticipantLists(data.participants);
}

// === Gestion des participants ===
function updateParticipantLists(participants) {
  const list1 = document.getElementById('participantList');
  const list2 = document.getElementById('participantList2');
  const count1 = document.getElementById('participantCount');
  const count2 = document.getElementById('participantCount2');
  const noParticipants = document.getElementById('noParticipants');
  const launchBtn = document.getElementById('launchWheelBtn');

  const html = participants.map(p => `
    <div class="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg p-3 border border-pink-200/50 dark:border-pink-800/50">
      <div class="flex items-center gap-2">
        ${p.is_host ? '<span class="text-xl">👑</span>' : '<span class="text-xl">🎮</span>'}
        <div class="flex-1 min-w-0">
          <p class="font-semibold truncate text-sm">${escapeHtml(p.name)}</p>
          ${p.is_host ? '<p class="text-xs text-pink-600 dark:text-pink-400">Host</p>' : ''}
        </div>
      </div>
    </div>
  `).join('');

  if (list1) list1.innerHTML = html;
  if (list2) list2.innerHTML = html;
  if (count1) count1.textContent = participants.length;
  if (count2) count2.textContent = participants.length;
  
  if (noParticipants) {
    noParticipants.style.display = participants.length > 0 ? 'none' : 'block';
  }
  
  if (launchBtn) {
    launchBtn.disabled = participants.length < 2;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// === Création de session ===
document.getElementById('createSessionBtn')?.addEventListener('click', () => {
  const name = document.getElementById('hostNameInput').value.trim();
  if (!name) {
    alert('Entre ton prénom !');
    return;
  }
  playerName = name;
  socket.emit('create_session', { host_name: name });
});

// === Rejoindre session ===
document.getElementById('joinSessionBtn')?.addEventListener('click', () => {
  const name = document.getElementById('playerNameInput').value.trim();
  const code = document.getElementById('joinCodeInput').value.trim();
  
  if (!name) {
    alert('Entre ton prénom !');
    return;
  }
  if (!code || code.length !== 6) {
    alert('Entre un code à 6 chiffres !');
    return;
  }
  
  playerName = name;
  socket.emit('join_session', { code: code, participant_name: name });
});

// === Mise à jour objectif ===
document.getElementById('multiObjective')?.addEventListener('input', (e) => {
  if (isHost && currentSessionCode) {
    socket.emit('update_objective', { 
      code: currentSessionCode, 
      objective: e.target.value 
    });
  }
});

// === Lancement de la roue ===
document.getElementById('launchWheelBtn')?.addEventListener('click', () => {
  if (!isHost || !currentSessionCode) return;
  
  const objective = document.getElementById('multiObjective').value.trim();
  socket.emit('spin_wheel', { code: currentSessionCode, objective: objective });
});

// === Quitter session ===
function leaveSession() {
  if (currentSessionCode) {
    socket.emit('leave_session', { code: currentSessionCode });
  }
  showChoiceScreen();
}

document.getElementById('leaveSessionBtn')?.addEventListener('click', leaveSession);
document.getElementById('leaveSessionBtn2')?.addEventListener('click', leaveSession);

// === Affichage de la roue ===
function showWheel(participants, objective) {
  const wheelContainer = document.getElementById('wheelContainer');
  wheelContainer.classList.remove('hidden');
  
  // Récupérer les noms
  const names = participants.map(p => p.name);
  
  // Créer le canvas si nécessaire
  const existingCanvas = document.getElementById('wheelCanvas');
  if (!existingCanvas) {
    wheelContainer.innerHTML = `
      <div class="absolute top-4 left-4 z-50">
        <button id="backFromWheelBtn" class="px-4 py-2 rounded-lg bg-white/90 text-gray-800 font-semibold shadow hover:shadow-md transition">
          ⬅️ Retour
        </button>
      </div>
      <div class="text-center">
        <div class="relative mx-auto max-w-[500px] w-full aspect-square">
          <canvas id="wheelCanvas" class="w-full h-full"></canvas>
          <div class="wheel-pointer" aria-hidden="true"></div>
        </div>
        <p class="text-white text-2xl font-bold mt-6 animate-pulse">La roue tourne...</p>
      </div>
    `;

    // Bouton retour pour fermer l'animation et pouvoir relancer
    document.getElementById('backFromWheelBtn')?.addEventListener('click', () => {
      resetAfterSpin();
    });
  }
  
  // Lancer l'animation
  setTimeout(() => {
    spinWheel(names);
  }, 500);
}

// === Animation de la roue ===
function spinWheel(names) {
  const canvas = document.getElementById('wheelCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const size = 500;
  canvas.width = size;
  canvas.height = size;
  
  let angle = 0;
  const duration = 5; // secondes
  const minSpins = 5;
  
  // Destination aléatoire
  const n = names.length;
  const targetIndex = Math.floor(Math.random() * n);
  const slice = (Math.PI * 2) / n;
  const targetCenter = targetIndex * slice + slice / 2;
  let finalAngle = (-Math.PI / 2) - targetCenter;
  const extra = minSpins * (Math.PI * 2);
  const startAngle = 0;
  const delta = extra + ((finalAngle - startAngle) % (Math.PI * 2));
  const totalAngle = startAngle + delta;
  
  const start = performance.now();
  
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  
  function draw(currentAngle) {
    ctx.clearRect(0, 0, size, size);
    
    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.42;
    
    // Fond gradient
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, '#fce7f3');
    grad.addColorStop(1, '#f3e8ff');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Segments
    const palette = ['#f472b6','#60a5fa','#34d399','#f59e0b','#a78bfa','#fb7185','#22d3ee','#84cc16'];
    
    for (let i = 0; i < n; i++) {
      const start = currentAngle + i * slice;
      const end = start + slice;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = palette[i % palette.length];
      ctx.globalAlpha = 0.92;
      ctx.fill();
      ctx.globalAlpha = 1;
      
      // Texte
      const label = names[i] || '—';
      ctx.save();
      ctx.translate(cx, cy);
      const mid = start + slice / 2;
      ctx.rotate(mid);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#111827';
      ctx.font = '600 16px system-ui, sans-serif';
      ctx.fillText(label, radius - 14, 6);
      ctx.restore();
    }
    
    // Cercle central
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.16, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  
  function tick(now) {
    const p = Math.min(1, (now - start) / (duration * 1000));
    const eased = easeOutCubic(p);
    angle = startAngle + delta * eased;
    draw(angle);
    
    if (p < 1) {
      requestAnimationFrame(tick);
    } else {
      // Animation terminée
      console.log('Animation terminée');
    }
  }
  
  requestAnimationFrame(tick);
}

// === Écran gagnant ===
function showWinnerScreen(winnerName) {
  // ID Google Drive fourni par l'utilisateur
  const DRIVE_ID = '19NBtyvqr0yCtXFUS6oQCRlDu9eWX_Cfb';
  // Essaye l'autoplay muet pour augmenter les chances d'autoplay sur mobile
  const EMBED_URL = `https://drive.google.com/file/d/${DRIVE_ID}/preview?autoplay=1&mute=1`;

  document.getElementById('wheelContainer').innerHTML = `
    <div class="text-center winner-screen">
      <div class="winner-media">
        <iframe
          class="winner-iframe"
          src="${EMBED_URL}"
          width="640"
          height="480"
          allow="autoplay; encrypted-media"
          allowfullscreen
          loading="eager"
          referrerpolicy="no-referrer"
        ></iframe>
      </div>
      <div class="winner-content">
        <h2 class="text-7xl font-black text-white mb-4 animate-bounce">TU AS ÉTÉ CHOISI !</h2>
        <p class="text-4xl text-white/90 mb-8 font-bold">${escapeHtml(winnerName)}</p>
        <div class="text-9xl mb-6 animate-pulse">🎉</div>
        <div class="flex items-center justify-center gap-3">
          <button id="replayBtnWin" class="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-xl hover:scale-105 transition-transform shadow-2xl">
            Rejouer
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('replayBtnWin')?.addEventListener('click', () => {
    resetAfterSpin();
  });
}

// === Écran résultat (pour les perdants) ===
function showResultScreen(winnerName) {
  const DRIVE_ID = '19NBtyvqr0yCtXFUS6oQCRlDu9eWX_Cfb';
  const EMBED_URL = `https://drive.google.com/file/d/${DRIVE_ID}/preview?autoplay=1&mute=1`;
  document.getElementById('wheelContainer').innerHTML = `
    <div class="text-center winner-screen">
      <div class="winner-media">
        <iframe
          class="winner-iframe"
          src="${EMBED_URL}"
          width="640"
          height="480"
          allow="autoplay; encrypted-media"
          allowfullscreen
          loading="eager"
          referrerpolicy="no-referrer"
        ></iframe>
      </div>
      <div class="winner-content">
        <h2 class="text-5xl font-bold text-white mb-4">Le gagnant est</h2>
        <p class="text-6xl font-black text-yellow-300 mb-8">${escapeHtml(winnerName)}</p>
        <div class="flex items-center justify-center gap-3">
          <button id="replayBtnLose" class="px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-xl hover:scale-105 transition-transform">
            Rejouer
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('replayBtnLose')?.addEventListener('click', () => {
    resetAfterSpin();
  });
}

// === Réinitialiser l'affichage après un lancer ===
function resetAfterSpin() {
  const wheelContainer = document.getElementById('wheelContainer');
  // Cacher l'overlay
  wheelContainer.classList.add('hidden');
  // Réactiver le bouton de lancement côté host pour rejouer
  const launchBtn = document.getElementById('launchWheelBtn');
  if (launchBtn) launchBtn.disabled = false;
  // Pas de rechargement de page: on garde la session et les participants
}

// === Theme Toggle ===
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

function updateThemeIcon() {
  const isDark = html.classList.contains('dark');
  themeToggle.querySelector('span').textContent = isDark ? '☀️' : '🌙';
}

themeToggle?.addEventListener('click', () => {
  html.classList.toggle('dark');
  localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
  updateThemeIcon();
});

// Charger le thème
if (localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  html.classList.add('dark');
}
updateThemeIcon();

// === Connexion au chargement ===
connectToServer();
