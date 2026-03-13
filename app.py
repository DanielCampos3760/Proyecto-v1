from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
from pymongo import MongoClient
from bson.objectid import ObjectId
import os
import requests
import json

load_dotenv()

app = Flask(__name__)
# Permitimos CORS para que el frontend pueda hablar con el backend en dominios distintos
CORS(app) 
bcrypt = Bcrypt(app) 

# CONFIGURACIÓN
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MONGO_URI = os.getenv("MONGO_URI")

if not GEMINI_API_KEY or not MONGO_URI:
    print("⚠️ ADVERTENCIA: Faltan variables de entorno. Configúralas en el panel de Render.")

GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"

# CONEXIÓN A MONGODB
try:
    client = MongoClient(MONGO_URI)
    db = client['abraham_os_db']
    users_collection = db['users']             
    hardware_collection = db['hardware_profiles'] 
    profiles_collection = db['profiles'] 
    client.admin.command('ping')
    print("✅ Conectado a MongoDB Atlas")
except Exception as e:
    print(f"❌ Error en MongoDB: {e}")

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({"status": "error", "message": "Faltan credenciales"}), 400
    if users_collection.find_one({"username": username}):
        return jsonify({"status": "error", "message": "El usuario ya existe"}), 409
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    users_collection.insert_one({"username": username, "password": hashed_password})
    return jsonify({"status": "success", "message": "Usuario registrado"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    user = users_collection.find_one({"username": username})
    if user and bcrypt.check_password_hash(user['password'], password):
        return jsonify({"status": "success", "username": username}), 200
    return jsonify({"status": "error", "message": "Credenciales inválidas"}), 401

@app.route('/update-system-info', methods=['POST'])
def update_info():
    try:
        data_req = request.json
        username = data_req.get('username')
        hardware_data = data_req.get('hardware')
        if not username or not hardware_data:
            return jsonify({"status": "error", "message": "Faltan datos"}), 400
        hardware_collection.update_one({"username": username}, {"$set": {"hardware": hardware_data}}, upsert=True)
        return jsonify({"status": "success", "message": "Hardware sincronizado"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/ask-ai', methods=['POST'])
def ask_ai():
    try:
        data = request.json
        command = data.get('command')
        username = data.get('username')
        
        # Buscamos el perfil del usuario
        user_profile = hardware_collection.find_one({"username": username})
        # Si no hay hardware, usamos un diccionario vacío para no romper el código
        hardware = user_profile.get("hardware", {}) if user_profile and "hardware" in user_profile else {"Nota": "Hardware no detectado"}

        prompt_text = f"Contexto Hardware: {json.dumps(hardware)}. Usuario dice: {command}. Responde únicamente en formato JSON con estas llaves: tema, explicacion (usa markdown), codigo_limpio."

        payload = {"contents": [{"parts": [{"text": prompt_text}]}]}
        response = requests.post(GEMINI_URL, json=payload, timeout=30)
        res_json = response.json()
        
        # Extraemos el texto y limpiamos posibles bloques de código que ensucian el JSON
        ai_text = res_json['candidates'][0]['content']['parts'][0]['text'].strip()
        ai_text = ai_text.replace('```json', '').replace('```', '').strip()
        
        return jsonify({"status": "success", "data": json.loads(ai_text)})
    except Exception as e:
        print(f"❌ Error en ask-ai: {e}") # Esto aparecerá en tus logs de Render
        return jsonify({"status": "error", "response": "La IA tardó mucho o los datos son inválidos"}), 500

@app.route('/save-profile', methods=['POST'])
def save_profile():
    data = request.json
    profiles_collection.insert_one(data)
    return jsonify({"status": "success"}), 201

@app.route('/get-profiles', methods=['POST'])
def get_profiles():
    username = request.json.get('username')
    profiles = list(profiles_collection.find({"username": username}))
    for p in profiles: p['_id'] = str(p['_id'])
    return jsonify({"status": "success", "profiles": profiles})

@app.route('/delete-profile', methods=['POST'])
def delete_profile():
    data = request.json
    profiles_collection.delete_one({"_id": ObjectId(data.get('profile_id'))})
    return jsonify({"status": "success"})

if __name__ == '__main__':
    # CRÍTICO: Render requiere que escuches en 0.0.0.0 y en el puerto de la variable PORT
    port = int(os.environ.get("PORT", 5000))

    app.run(host='0.0.0.0', port=port)
