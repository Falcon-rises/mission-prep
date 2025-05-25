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

# Get data for a specific profile
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

# Save data for a specific profile
@app.route('/api/data/<profile>', methods=['POST'])
def save_profile_data(profile):
    profile_data = request.json
    data = load_data()
    data[profile] = profile_data
    save_data(data)
    return jsonify({"status": "success", "message": f"Data saved for {profile}"}), 200

# Serve other assets like JS if needed
@app.route('/<path:path>')
def serve_static_file(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

