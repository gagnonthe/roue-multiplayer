#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Serveur Flask-SocketIO pour la roue multi-joueurs
Lancer avec: python server.py
"""

from flask import Flask, send_from_directory, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
import random
import string
from datetime import datetime
import os
import ssl

# Le serveur est dans code/server/, les fichiers web sont dans code/
app = Flask(__name__, static_folder='..', static_url_path='')
CORS(app)
app.config['SECRET_KEY'] = 'roue-secret-key-2024'
socketio = SocketIO(app, cors_allowed_origins="*")

# Stockage des sessions en mémoire
sessions = {}
# Format: { 'CODE123': { 'host': 'socket_id', 'objective': '', 'participants': [{'id': 'sid', 'name': 'Alice'}], 'spinning': False } }

def generate_code():
    """Génère un code de session unique à 6 chiffres"""
    while True:
        code = ''.join(random.choices(string.digits, k=6))
        if code not in sessions:
            return code

@app.route('/')
def index():
    """Sert la page principale"""
    return send_from_directory('..', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Sert les fichiers statiques"""
    return send_from_directory('..', path)

@app.route('/health')
def health():
    """Simple healthcheck endpoint for cloud providers."""
    return {"status": "ok", "time": datetime.utcnow().isoformat() + "Z"}

@socketio.on('connect')
def handle_connect():
    """Connexion d'un client"""
    print(f'Client connecté: {request.sid}')
    emit('connected', {'message': 'Connexion établie'})

@socketio.on('disconnect')
def handle_disconnect():
    """Déconnexion d'un client"""
    sid = request.sid
    print(f'Client déconnecté: {sid}')
    
    # Retirer le participant de toutes les sessions
    for code, session in list(sessions.items()):
        # Si c'est le host qui se déconnecte, supprimer la session
        if session['host'] == sid:
            socketio.emit('session_closed', {'code': code}, room=code)
            del sessions[code]
            print(f'Session {code} fermée (host déconnecté)')
        else:
            # Retirer le participant
            session['participants'] = [p for p in session['participants'] if p['id'] != sid]
            socketio.emit('participant_left', {
                'participants': session['participants']
            }, room=code)

@socketio.on('create_session')
def handle_create_session(data):
    """Créer une nouvelle session (Host)"""
    code = generate_code()
    host_name = data.get('host_name', data.get('name', 'Host'))  # Fix: chercher host_name
    
    sessions[code] = {
        'host': request.sid,
        'host_name': host_name,
        'objective': '',
        'participants': [{'id': request.sid, 'name': host_name, 'is_host': True}],
        'spinning': False,
        'result': None
    }
    
    join_room(code)
    
    emit('session_created', {
        'code': code,
        'host_name': host_name
    })
    
    print(f'Session créée: {code} par {host_name}')

@socketio.on('join_session')
def handle_join_session(data):
    """Rejoindre une session existante"""
    code = data.get('code', '').strip()
    name = data.get('participant_name', data.get('name', 'Anonyme'))  # Fix: chercher participant_name
    
    if code not in sessions:
        emit('error', {'message': 'Code de session invalide'})
        return
    
    session = sessions[code]
    
    # Vérifier si déjà dans la session
    existing = next((p for p in session['participants'] if p['id'] == request.sid), None)
    if existing:
        existing['name'] = name
    else:
        session['participants'].append({'id': request.sid, 'name': name, 'is_host': False})
    
    join_room(code)
    
    emit('session_joined', {
        'code': code,
        'objective': session['objective'],
        'participants': session['participants']
    })
    
    # Notifier tous les participants
    socketio.emit('participant_joined', {
        'participants': session['participants']
    }, room=code)
    
    print(f'{name} a rejoint la session {code}')

@socketio.on('update_objective')
def handle_update_objective(data):
    """Mettre à jour l'objectif (Host uniquement)"""
    code = data.get('code')
    objective = data.get('objective', '')
    
    if code not in sessions:
        return
    
    session = sessions[code]
    
    if request.sid != session['host']:
        emit('error', {'message': 'Seul le host peut modifier l\'objectif'})
        return
    
    session['objective'] = objective
    
    # Notifier tous les participants
    socketio.emit('objective_updated', {
        'objective': objective
    }, room=code)

@socketio.on('spin_wheel')
def handle_spin_wheel(data):
    """Lancer la roue (Host uniquement)"""
    code = data.get('code')
    
    if code not in sessions:
        return
    
    session = sessions[code]
    
    if request.sid != session['host']:
        emit('error', {'message': 'Seul le host peut lancer la roue'})
        return
    
    if len(session['participants']) < 1:
        emit('error', {'message': 'Aucun participant'})
        return
    
    session['spinning'] = True
    
    # Notifier tous que la roue commence à tourner
    socketio.emit('wheel_spinning', {
        'participants': session['participants'],
        'objective': session['objective']
    }, room=code)
    
    print(f'Roue lancée dans la session {code}')

@socketio.on('wheel_result')
def handle_wheel_result(data):
    """Envoyer le résultat de la roue (Host uniquement)"""
    code = data.get('code')
    winner_name = data.get('winner')
    
    if code not in sessions:
        return
    
    session = sessions[code]
    
    if request.sid != session['host']:
        return
    
    session['spinning'] = False
    session['result'] = winner_name
    
    # Notifier tous du résultat
    for participant in session['participants']:
        is_winner = participant['name'] == winner_name
        socketio.emit('wheel_result', {
            'winner': winner_name,
            'is_winner': is_winner
        }, room=participant['id'])
    
    print(f'Gagnant de la session {code}: {winner_name}')

if __name__ == '__main__':
    # Mode local: utiliser éventuellement SSL auto-signé si présent OU si USE_SSL=true
    port = int(os.environ.get('PORT', '5000'))
    use_ssl_env = os.environ.get('USE_SSL', 'false').lower() in ('1', 'true', 'yes')

    cert_file = 'cert.pem'
    key_file = 'key.pem'
    have_certs = os.path.exists(cert_file) and os.path.exists(key_file)
    use_ssl = use_ssl_env and have_certs

    print('=' * 60)
    print('🎡 Serveur Roue Multi-joueurs')
    print('=' * 60)
    if use_ssl:
        print('🔒 HTTPS local activé (certificat auto-signé)')
        socketio.run(app, host='0.0.0.0', port=port, debug=False, ssl_context=(cert_file, key_file))
    else:
        print('🌐 HTTP (local/dev). En production (Render), utilisez gunicorn -k eventlet.')
        socketio.run(app, host='0.0.0.0', port=port, debug=False)
