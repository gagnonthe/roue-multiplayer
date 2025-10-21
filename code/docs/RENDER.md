# 🚀 Déployer sur Render — Guide complet

Render est un hébergement gratuit qui supporte Flask et WebSockets (contrairement à PythonAnywhere gratuit).

---

## 📋 Prérequis

- Compte GitHub (gratuit) → https://github.com/signup
- Compte Render (gratuit) → https://render.com/register
- Ton code doit être sur GitHub (dépôt public ou privé)

---

## Étape 1️⃣ : Mettre ton code sur GitHub

### Si tu n'as pas encore de repo GitHub :

1. Va sur https://github.com/new
2. Nom du repo : `roue-multiplayer` (ou ce que tu veux)
3. Choisis **Public** (pour le plan gratuit Render)
4. Clique **Create repository**

### Depuis VS Code (recommandé) :

1. Ouvre le dossier `roue` dans VS Code
2. Ouvre le terminal (Ctrl+ù)
3. Tape ces commandes :

```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/roue-multiplayer.git
git push -u origin main
```

Remplace `TON_USERNAME` par ton nom d'utilisateur GitHub.

### Ou via GitHub Desktop (plus simple) :

1. Télécharge GitHub Desktop → https://desktop.github.com
2. File → Add Local Repository → Sélectionne le dossier `roue`
3. Clique "Publish repository"
4. Choisis le nom et clique "Publish"

---

## Étape 2️⃣ : Créer un compte Render

1. Va sur https://render.com/register
2. Clique **"Sign up with GitHub"**
3. Autorise Render à accéder à tes dépôts

---

## Étape 3️⃣ : Créer un Blueprint sur Render

1. Sur le dashboard Render, clique **"New +"** en haut à droite
2. Sélectionne **"Blueprint"**
3. Connecte ton dépôt GitHub `roue-multiplayer`
4. Render détecte automatiquement le fichier `render.yaml` à la racine
5. Clique **"Apply"**

---

## Étape 4️⃣ : Attendre le déploiement

1. Render va :
   - Installer Python
   - Installer les dépendances (`requirements.txt`)
   - Lancer le serveur avec gunicorn + eventlet
   
2. **Ça prend 2-5 minutes la première fois**

3. Tu verras les logs défiler en temps réel

4. Quand c'est fini, tu verras **"Live"** en vert

---

## Étape 5️⃣ : Récupérer ton URL publique

1. Sur la page de ton service, cherche la section **"roue-server"**
2. En haut, tu verras une URL du type :
   ```
   https://roue-server-xxxx.onrender.com
   ```
3. **Copie cette URL** 📋

---

## Étape 6️⃣ : Tester le serveur

1. Ouvre un nouvel onglet et va sur :
   ```
   https://roue-server-xxxx.onrender.com/health
   ```
2. Tu devrais voir :
   ```json
   {"status":"ok","time":"2025-10-21T..."}
   ```

✅ **Serveur opérationnel !**

❌ **Si erreur 503** : Le service est en train de démarrer, attends 30 secondes et recharge.

---

## Étape 7️⃣ : Connecter l'interface multijoueur

1. Ouvre `multiplayer.html` dans ton navigateur (Freebox ou local)
2. Clique sur **⚙️ Configuration serveur**
3. Colle ton URL Render :
   ```
   https://roue-server-xxxx.onrender.com
   ```
4. Clique **Enregistrer**
5. Clique **Tester** → devrait afficher "✅ OK"
6. Le bandeau en haut passe au vert : "✅ Connecté au serveur"

---

## Étape 8️⃣ : Jouer en multijoueur !

### Créer une session (Host)

1. Clique **👑 Créer une session**
2. Entre ton prénom
3. Un code à 6 chiffres s'affiche (ex: `123456`)
4. Partage ce code avec tes amis

### Rejoindre (Participants)

1. Tes amis ouvrent `multiplayer.html` sur leur appareil
2. Ils configurent aussi l'URL Render dans ⚙️ Configuration
3. Ils cliquent **🎮 Rejoindre**
4. Entrent leur prénom + le code
5. Ils apparaissent dans la liste !

### Lancer la roue

1. Le host entre un objectif
2. Clique **🚀 Lancer la roue**
3. Tout le monde voit l'animation en même temps
4. Le gagnant voit "🎉 C'EST TOI !"
5. Les autres voient "🎯 Le gagnant est [prénom]"

---

## 🔄 Mettre à jour le code

### Depuis VS Code :

1. Modifie ton code
2. Ouvre le terminal :
   ```powershell
   git add .
   git commit -m "Description de ta modif"
   git push
   ```
3. **Render redéploie automatiquement** (1-3 minutes)
4. L'URL reste la même, pas besoin de la reconfigurer

### Via GitHub web :

1. Va sur ton repo GitHub
2. Clique sur un fichier → icône crayon (Edit)
3. Modifie et clique "Commit changes"
4. Render redéploie automatiquement

---

## 🛠️ Dépannage

### ❌ Build Failed (rouge)

**Cause :** Erreur dans le code ou dépendances manquantes

**Solution :**
1. Clique sur le service → onglet **Logs**
2. Cherche les lignes en rouge (erreurs)
3. Souvent : faute de frappe dans `requirements.txt` ou `server.py`
4. Corrige sur GitHub ou VS Code
5. Push → Render re-build automatiquement

---

### ❌ Application Error / 503

**Causes :**
- Le service démarre (normal, attends 30-60s)
- Crash au démarrage (erreur Python)

**Solution :**
1. Va dans **Logs** (onglet en haut)
2. Cherche les erreurs Python (traceback en rouge)
3. Corrige le code et push

---

### ❌ "Déconnecté du serveur" sur l'interface

**Causes :**
- Mauvaise URL dans la config
- Service Render endormi (gratuit, dort après 15 min d'inactivité)

**Solutions :**
1. Vérifie l'URL (pas de `/` à la fin)
2. Clique **Tester** → si ❌, va sur Render et vérifie que le service est "Live"
3. Si endormi, ouvre l'URL dans un navigateur → ça le réveille (10-20s)

---

### ❌ Le service s'endort tout le temps (gratuit)

**Comportement normal :** Plan gratuit Render dort après **15 minutes sans requête**.

**Solutions :**
- **Pinger automatiquement** : Utilise UptimeRobot (gratuit) pour ping `/health` toutes les 5 min
- **Passer au plan payant** ($7/mois) → Always-on 24/7
- **Accepter le délai** : Premier accès après sleep = 10-20s (réveil auto)

---

### ❌ WebSocket connection failed dans la console

**Cause :** CORS ou configuration WebSocket

**Solution :**
1. Vérifie dans `server.py` :
   ```python
   socketio = SocketIO(app, cors_allowed_origins="*")
   ```
2. Si pas présent, ajoute-le
3. Commit et push

---

### ❌ L'URL change après redéploiement

**Cause :** Tu as supprimé et recréé le service

**Solution :**
- **Ne supprime jamais le service**, redéploie à la place
- L'URL reste stable tant que le service existe
- Si vraiment changée, recolle la nouvelle URL dans la config client

---

## 📱 Accès mobile

1. Sur ton téléphone, ouvre `multiplayer.html` (via Freebox ou hébergement web)
2. Configure l'URL Render dans ⚙️ Configuration
3. Teste et joue !

**Note :** L'URL Render est déjà en HTTPS, donc aucun problème de certificat sur iPhone.

---

## 💰 Plan gratuit Render — Limitations

- ✅ WebSockets supportés
- ✅ Déploiements illimités
- ✅ 750 heures/mois (suffisant pour 1 service 24/7)
- ⚠️ **Service s'endort après 15 min** d'inactivité
- ⚠️ Build time limité (assez pour Flask simple)

**Parfait pour :** Tests, démos, petits projets.

---

## 🎯 Checklist

- [ ] Code sur GitHub
- [ ] Compte Render créé et lié à GitHub
- [ ] Blueprint créé avec `render.yaml`
- [ ] Service déployé (statut "Live" vert)
- [ ] `/health` renvoie `{"status":"ok"}`
- [ ] URL copiée et testée dans l'interface
- [ ] Bouton "Tester" donne "✅ OK"
- [ ] Session créée avec succès
- [ ] Autre appareil peut rejoindre

---

## 📚 Ressources

- **Documentation Render** : https://render.com/docs
- **Support Render** : https://render.com/support
- **Flask-SocketIO** : https://flask-socketio.readthedocs.io

---

## ✅ Résumé

1. **Push sur GitHub** → Render détecte les changements
2. **Redéploie automatiquement** → 1-3 min
3. **URL stable** → Pas besoin de reconfigurer le client
4. **WebSockets OK** → Mode multijoueur fonctionne
5. **Gratuit** → Avec sleep après inactivité (acceptable)

Bon déploiement ! 🎡🎉
