@echo off
echo ================================================
echo   POUSSER LES MODIFICATIONS SUR GITHUB/RENDER
echo ================================================
echo.

REM Ajouter tous les fichiers modifies
echo [1/3] Ajout des fichiers modifies...
git add .

REM Demander le message de commit
echo.
set /p message="Message du commit (ex: Ajout animation gagnant): "

REM Créer le commit
echo.
echo [2/3] Creation du commit...
git commit -m "%message%"

REM Pousser sur GitHub
echo.
echo [3/3] Envoi vers GitHub (Render se met a jour automatiquement)...
git push

echo.
echo ================================================
echo   TERMINE ! Attends 1-2 min pour le deploiement
echo ================================================
echo.
pause
