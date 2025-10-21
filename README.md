# 🎡 Roue des Prénoms

Une application web interactive pour sélectionner aléatoirement une personne dans un groupe.

## 📁 Structure du projet

```
code/
├── 📄 index.html              # Page principale (mode solo)
├── 📄 multiplayer.html        # Page multijoueur
├── 📄 app.js                  # Logique de la roue (solo)
├── 📄 multiplayer-page.js     # Logique multijoueur
├── 📄 styles.css              # Styles CSS
│
├── 📁 server/                 # Serveur Python
│   ├── server.py              # Serveur Flask-SocketIO
│   ├── requirements.txt       # Dépendances Python
│   ├── generate_cert.py       # Génération certificat SSL
│   ├── cert.pem               # Certificat SSL
│   ├── key.pem                # Clé privée SSL
│   └── start.bat              # Lancement rapide (Windows)
│
└── 📁 docs/                   # Documentation
    ├── README.md              # Guide solo
    ├── MULTIPLAYER.md         # Guide multijoueur
    ├── FIXES.md               # Historique des corrections
    └── TEST.md                # Guide de test
```

## 🚀 Démarrage rapide

### Mode Solo (sans serveur)
Ouvre simplement `index.html` dans ton navigateur.

### Mode Multijoueur

1. **Installer Python** (3.8+)

2. **Lancer le serveur :**
   ```bash
   cd code/server
   python server.py
   ```
   Ou double-clic sur `start.bat` (Windows)

3. **Accéder au jeu :**
   - Local : `https://localhost:5000/multiplayer.html`
   - Réseau : `https://192.168.1.7:5000/multiplayer.html`

4. **Accepter le certificat** au premier lancement

## ✨ Fonctionnalités

### Mode Solo
- ✅ Roue interactive avec animation
- ✅ Gestion de la liste de prénoms
- ✅ Objectif personnalisable
- ✅ Sauvegarde automatique (localStorage)
- ✅ Options avancées (durée, tours minimums)
- ✅ Dark mode

### Mode Multijoueur
- ✅ Session partagée avec code à 6 chiffres
- ✅ Host et participants
- ✅ Synchronisation en temps réel
- ✅ Animation simultanée pour tous
- ✅ Écran différencié gagnant/perdants
- ✅ Connexion HTTPS sécurisée

## 🛠️ Technologies

- **Frontend :** HTML5, Tailwind CSS, Vanilla JavaScript, Canvas API
- **Backend :** Python, Flask, Flask-SocketIO
- **Communication :** WebSocket (Socket.IO)
- **Sécurité :** HTTPS avec certificat auto-signé

## 📖 Documentation complète

Consulte les fichiers dans `docs/` :
- `MULTIPLAYER.md` - Instructions détaillées multijoueur
- `FIXES.md` - Bugs corrigés et solutions
- `TEST.md` - Procédures de test

## 🎮 Utilisation

### Créer une session (Host)
1. Va sur `multiplayer.html`
2. Clique "Créer une session"
3. Entre ton prénom
4. Partage le code 6 chiffres

### Rejoindre une session (Participant)
1. Va sur `multiplayer.html`
2. Clique "Rejoindre"
3. Entre ton prénom et le code

### Lancer la roue
Le host clique sur "🚀 Lancer la roue" quand tout le monde est prêt.

## 🌐 Hébergement

Le site peut être hébergé :
- En local (`file://`)
- Sur Freebox (HTTPS)
- Sur n'importe quel serveur web

Le serveur Python doit tourner sur le réseau local pour le mode multijoueur.

## ⚙️ Configuration

L'adresse du serveur peut être changée dans l'interface (accordéon "Configuration serveur").

Par défaut : `https://192.168.1.7:5000`

## 📝 Notes

- Le mode solo fonctionne **sans serveur**
- Le mode multijoueur nécessite le **serveur Python actif**
- Les sessions sont **en mémoire** (perdues au redémarrage)
- Le certificat SSL est **auto-signé** (accepter l'avertissement)

## 🐛 Problèmes connus

Si la connexion échoue :
1. Vérifie que le serveur est lancé
2. Accepte le certificat SSL (va sur `https://192.168.1.7:5000`)
3. Vérifie l'IP dans la configuration

---

Fait avec ❤️ pour la sélection aléatoire équitable !
