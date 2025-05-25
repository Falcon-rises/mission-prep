from flask import Flask, jsonify, request, send_from_directory
import json
import os

app = Flask(__name__)

DATA_FILE = 'data.json'

def load_data():
    if not os.path.exists(DATA_FILE):
        return {}
    with open(DATA_FILE, 'r') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {}

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

@app.route('/')
def index():
    # Serve frontend (index1.html) as static file from current folder
    return send_from_directory('.', 'index1.html')

@app.route('/style.css')
def serve_css():
    return send_from_directory('.', 'style.css')

@app.route('/api/data/<profile>', methods=['GET'])
def get_profile_data(profile):
    data = load_data()
    profile_data = data.get(profile, {
        "syllabus": [],
        "cycle": [],
        "purchase": [],
        "packing": [],
        "registration": []
    })
    return jsonify(profile_data)

@app.route('/api/data/<profile>', methods=['POST'])
def save_profile_data(profile):
    data = load_data()
    profile_data = request.json
    data[profile] = profile_data
    save_data(data)
    return jsonify({"status": "success", "message": f"Data saved for {profile}"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
