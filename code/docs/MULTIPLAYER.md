# 🎡 Roue Multi-joueurs - Guide de lancement

## 🚀 Installation rapide

### 1. Installer Python (si pas déjà installé)
- Télécharge Python 3.8+ depuis https://www.python.org/downloads/
- Coche "Add Python to PATH" pendant l'installation

### 2. Installer les dépendances

Ouvre PowerShell dans le dossier du projet et tape :

```powershell
pip install -r requirements.txt
```

### 3. Lancer le serveur

```powershell
python server.py
```

Tu verras :
```
🎡 Serveur Roue Multi-joueurs
Serveur démarré sur: http://localhost:5000
```

### 4. Ouvrir dans le navigateur

Ouvre dans ton navigateur (ou plusieurs onglets/appareils) :
```
http://localhost:5000
```

## 🎮 Comment utiliser le mode multijoueur

### Pour le HOST (Créateur de la session)

1. Clique sur l'icône **hamburger** (menu) en haut à droite
2. Clique sur **🎮 Multijoueur**
3. Clique sur **Créer une session (Host)**
4. Entre ton nom
5. Un **code à 6 chiffres** s'affiche → partage-le aux autres joueurs
6. Définis l'**objectif** (ex: "Qui présente ?")
7. Attends que des participants rejoignent (tu les vois apparaître)
8. Clique sur **🚀 Lancer la roue** quand prêt

### Pour les PARTICIPANTS

1. Ouvre http://localhost:5000 sur ton appareil
2. Clique sur **hamburger** → **🎮 Multijoueur**
3. Entre le **code à 6 chiffres** reçu du host
4. Clique sur **Rejoindre une session**
5. Entre ton nom
6. Attends que le host lance la roue !

## 🎯 Que se passe-t-il quand la roue tourne ?

- **Tous les participants** voient la roue tourner en même temps
- **Le gagnant** voit un écran spécial : "🎉 C'EST TOI !"
- **Les autres** voient : "🎯 Le gagnant est : [Nom]"

## 🌐 Pour jouer avec des amis sur d'autres PC (même réseau WiFi)

### 1. Trouve ton adresse IP locale

PowerShell :
```powershell
ipconfig
```
Cherche "Adresse IPv4" (ex: 192.168.1.45)

### 2. Modifie `multiplayer.js`

Ligne 7, remplace :
```javascript
const serverUrl = 'http://localhost:5000';
```
par :
```javascript
const serverUrl = 'http://192.168.1.45:5000';  // Ton IP
```

### 3. Tes amis se connectent à

```
http://192.168.1.45:5000
```

(Remplace par ton IP)

## 🛑 Arrêter le serveur

Dans le terminal PowerShell, appuie sur **Ctrl + C**

## 🐛 Problèmes courants

### "pip n'est pas reconnu"
→ Réinstalle Python en cochant "Add to PATH"

### "Port 5000 déjà utilisé"
→ Change le port dans `server.py` ligne 100 : `port=5001`

### "Connexion refusée"
→ Vérifie que le serveur est bien lancé et que l'URL est correcte

### Les participants ne voient pas la roue tourner
→ Assure-toi que tous sont sur la même session (même code)

## 📱 Pour jouer depuis un smartphone

1. Le serveur doit tourner sur ton PC
2. Smartphone et PC sur le **même WiFi**
3. Utilise l'IP du PC (ex: http://192.168.1.45:5000)
4. Sur le smartphone, ouvre le navigateur et va sur cette adresse

## 🎨 Fonctionnalités

✅ Création de session avec code à 6 chiffres
✅ Rejoindre une session
✅ Liste des participants en temps réel
✅ Définir un objectif
✅ Synchronisation de la rotation de la roue
✅ Écran spécial pour le gagnant
✅ Écran résultat pour les autres

## 📝 Notes techniques

- **Backend** : Flask + Flask-SocketIO (Python)
- **Frontend** : Vanilla JS + Socket.IO client
- **Communication** : WebSocket temps réel
- **Stockage** : Mémoire serveur (sessions perdues au redémarrage)

## 🔜 Améliorations futures possibles

- Persistance des sessions (Redis/database)
- Historique des parties
- Mode tournoi
- Sons et animations améliorés
- Statistiques des joueurs
- Mode équipes

---

**Enjoy! 🎉**
