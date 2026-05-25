import os
import base64
import sqlite3
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from google import genai
from google.genai import types

BASE_DIR = Path(__file__).parent
# Correctly point static assets to the React build output folder
FRONTEND_BUILD = BASE_DIR / "frontend" / "build"

app = Flask(__name__, static_folder=str(FRONTEND_BUILD), static_url_path="")
CORS(app, resources={r"/api/*": {"origins": "*"}})

MODEL = "gemini-2.0-flash"
DB_PATH = BASE_DIR / "culinary_chef.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('CREATE TABLE IF NOT EXISTS users (user_id TEXT PRIMARY KEY, name TEXT, age_group TEXT DEFAULT "apprentice")')
    cursor.execute('CREATE TABLE IF NOT EXISTS chat_history (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, role TEXT, message TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)')
    conn.commit()
    conn.close()

init_db()

def _get_client():
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key:
        raise EnvironmentError("GEMINI_API_KEY is not set")
    return genai.Client(api_key=key)

SYSTEM_PROMPTS = {
    "apprentice": (
        "You are Cap, an AI robot chef mentor. Mouthless, benevolent, warm, patient, and deeply knowledgeable. "
        "Your pedagogical style is that of a CIA-trained chef with 40 years of professional experience tracking an apprentice. "
        "Target: Kids aged 10–12. Focus on knife skills, basic technique, simple recipes, and kitchen safety. "
        "Be present and supervisory, but never condescend, use baby talk, or assume failure. Keep culinary vocabulary real "
        "(e.g., mirepoix, mise en place). End responses by offering self-paced control: 'Ready to keep going, or do you have a question?'"
    ),
    "cook": (
        "You are Cap, an AI robot chef mentor with the pedigree of a CIA-trained veteran of 40 years. "
        "Target: Teens aged 13–15. Focus on full meals, baking, hot prep, and station management. "
        "Pull back slightly compared to the apprentice level—ask more diagnostic questions to encourage independent critical thinking. "
        "Honor them as capable learners. Vocabulary is strictly professional. End responses inviting their direction."
    ),
    "operator": (
        "You are Cap, acting as a peer-mentor culinary veteran to older teens aged 16–18. "
        "Focus: Pop-ups, food trucks, restaurant simulations, kitchen management, business, and ingredient costing. "
        "Treat them completely as young industry professionals. Speak with precise technical accuracy and strategic business mindset."
    )
}

AUTO_PROMPTS = {
    "apprentice": "Look at this kitchen scene. Give a precise, professional safety tip or observation regarding technique or mise en place for a 10-12 year old apprentice.",
    "cook": "Look at this cooking setup. Provide professional feedback on station management or preparation technique for a 13-15 year old cook.",
    "operator": "Look at this culinary scenario. Provide high-level professional feedback regarding efficiency, presentation, or operational execution."
}

def _decode_frame(b64_string):
    if "," in b64_string:
        b64_string = b64_string.split(",", 1)[1]
    return base64.b64decode(b64_string)

# Main route serves the built React frontend
@app.route("/")
def index():
    return send_from_directory(FRONTEND_BUILD, "index.html")

@app.route("/api/health")
def health():
    key_set = bool(os.environ.get("GEMINI_API_KEY", "").strip())
    return jsonify({"status": "ok", "model": MODEL, "key_configured": key_set, "database": "sqlite_connected", "sdk": "modern_v1"})

@app.route("/api/coach/vision", methods=["POST"])
def vision():
    data = request.get_json(force=True)
    age = data.get("age", "apprentice")
    img_b64 = data.get("image", "")
    if not img_b64: return jsonify({"error": "No image provided"}), 400
    try:
        client = _get_client()
        image_part = types.Part.from_bytes(data=_decode_frame(img_b64), mime_type="image/jpeg")
        
        response = client.models.generate_content(
            model=MODEL,
            contents=[image_part, AUTO_PROMPTS.get(age, AUTO_PROMPTS["apprentice"])],
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPTS.get(age, SYSTEM_PROMPTS["apprentice"]),
                max_output_tokens=150,
                temperature=0.7
            )
        )
        return jsonify({"reply": response.text})
    except Exception as e: return jsonify({"error": str(e)}), 500

@app.route("/api/coach/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True)
    age = data.get("age", "apprentice")
    message = data.get("message", "").strip()
    user_id = data.get("user_id", "default_chef")
    img_b64 = data.get("image")
    if not message: return jsonify({"error": "No message provided"}), 400
    
    try:
        client = _get_client()

        # 🛡️ Dual-Path Intent Classification Layer
        router_prompt = (
            "You are an Intent and Risk Router for a child-facing cooking platform. "
            "Analyze the user message. If it contains language indicating prayer, grief, death, severe fear, "
            "pastoral prompts, or spiritual distress, output exactly the word 'PATHWAY'. "
            "Otherwise, output exactly the word 'TEACHING'. Do not include any other text.\n\n"
            f"User message: {message}"
        )
        
        route_decision = client.models.generate_content(
            model=MODEL,
            contents=router_prompt
        ).text.strip().upper()

        if "PATHWAY" in route_decision:
            ccp_reply = (
                "I am so sorry. Losing something or feeling this way can really hurt. We can pray, and I also want "
                "you to tell a grown-up you trust so they can sit with you and help you feel cared for. \n\n"
                "Dear Jesus, please comfort this child right now. Thank You for being near to them. Help them feel Your "
                "nearness and help their family care for each other while they are sad. Amen."
            )
            return jsonify({"reply": ccp_reply})

        # 🍳 Standard Core Teaching Path with History
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT role, message FROM chat_history WHERE user_id = ? ORDER BY timestamp DESC LIMIT 10", (user_id,))
        rows = cursor.fetchall()
        conn.close()
        
        history_contents = []
        for row in reversed(rows):
            history_contents.append(
                types.Content(role="user" if row[0] == "user" else "model", parts=[types.Part.from_text(text=row[1])])
            )
            
        current_parts = []
        if img_b64:
            try: current_parts.append(types.Part.from_bytes(data=_decode_frame(img_b64), mime_type="image/jpeg"))
            except: pass
        current_parts.append(types.Part.from_text(text=message))
        
        full_contents = history_contents + [types.Content(role="user", parts=current_parts)]

        response = client.models.generate_content(
            model=MODEL,
            contents=full_contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPTS.get(age, SYSTEM_PROMPTS["apprentice"]),
                max_output_tokens=180,
                temperature=0.75
            )
        )
        reply_text = response.text
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO chat_history (user_id, role, message) VALUES (?, 'user', ?)", (user_id, message))
        cursor.execute("INSERT INTO chat_history (user_id, role, message) VALUES (?, 'model', ?)", (user_id, reply_text))
        conn.commit()
        conn.close()
        
        return jsonify({"reply": reply_text})
    except Exception as e: return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"\n🤖 Cap Master Engine Modern SDK [Dual-Path Capable] loaded → http://localhost:{port}\n")
    app.run(host="0.0.0.0", port=port, debug=False)
