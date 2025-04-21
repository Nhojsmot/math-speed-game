from flask import Flask, render_template, request, jsonify
from datetime import datetime
import os, json

app = Flask(__name__)
DATA_FILE = 'scores.json'

def load_scores():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_scores(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/save_score', methods=['POST'])
def save_score():
    data = request.json
    all_scores = load_scores()
    all_scores.append(data)
    save_scores(all_scores)
    return jsonify({"status": "success"})

@app.route('/get_scores')
def get_scores():
    today = datetime.now().strftime('%Y-%m-%d')
    all_scores = load_scores()
    today_scores = [s for s in all_scores if s['date'] == today]
    return jsonify(today_scores)

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=10000)

	