from flask import Flask, jsonify, request, render_template, send_from_directory
import json
import os

app = Flask(__name__)

@app.route('/')
def home():
    return "Mission Prep is live!"

if __name__ == "__main__":
    app.run()
DATA_FILE = 'data.json'

# Load data from file or initialize empty structure
def load_data():
    if not os.path.exists(DATA_FILE):
        return {}
    with open(DATA_FILE, 'r') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {}

# Save data back to file
def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

@app.route('/')
def index():
    return render_template('index1.html')  # changed here

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

    # Validate data here if needed

    data[profile] = profile_data
    save_data(data)
    return jsonify({"status": "success", "message": f"Data saved for {profile}"}), 200

if __name__ == '__main__':
app.run(host='0.0.0.0', port=5000)

