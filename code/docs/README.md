# Roue des prénoms – Démo

Un mini-site pour choisir aléatoirement un prénom via une roue. L'utilisateur saisit un objectif (ex: "Qui présente ?") et une liste de prénoms, puis clique sur "Tourner la roue".

## Fichiers
- `index.html` – Page principale (UI + chargement Tailwind CDN)
- `app.js` – Logique de la roue (canvas, animation, tirage, localStorage)
- `styles.css` – Styles légers (pointeur, détails)

## Utilisation
1. Ouvrez `index.html` dans votre navigateur.
2. Remplissez:
   - "Objectif" (texte libre)
   - "Prénoms" (un par ligne, ou séparés par des virgules)
3. Cliquez sur "Tourner la roue".
4. Le prénom sélectionné s'affiche sous la roue, avec l'objectif.

Les champs sont mémorisés dans votre navigateur (localStorage).

## Conseils
- Bouton "Mélanger": réordonne aléatoirement les prénoms.
- "Sauvegarder": force l'enregistrement des paramètres.
- "Effacer": vide les champs (et le stockage local).
- Options avancées: ajustez la durée de spin et le nombre minimum de tours.

## Lancer via un petit serveur local (optionnel)
Vous pouvez ouvrir le fichier directement, ou utiliser un serveur local pour éviter certains blocages liés au fichier `file://`.

### PowerShell (Windows)
- Python (si installé):
```powershell
python -m http.server 8080
```
Puis ouvrez http://localhost:8080/code/index.html

- VS Code Live Server (extension) fonctionne très bien également.

## Idées d'évolutions
- Sons (départ/arrêt/tiques)
- Exclure le dernier gagnant (ou pondérer les chances)
- Thèmes/couleurs par prénom
- Historique des tirages
- Export/import des listes

---
Dites-moi ce que vous souhaitez modifier (UI, règles de tirage, animation, etc.).