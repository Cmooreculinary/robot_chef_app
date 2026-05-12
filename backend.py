"""
Cap — Robot Chef Mentor | backend.py
Flask server — serves the frontend and proxies Gemini.
Run: python backend.py
"""

import os
import socket
import base64
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

# ── Init ──────────────────────────────────────────────────────
STATIC_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, static_folder=None)
CORS(app)

API_KEY = os.environ.get("GEMINI_API_KEY", "")
if not API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY environment variable is not set.\n"
        "Run:  export GEMINI_API_KEY=your_key_here"
    )

genai.configure(api_key=API_KEY)
MODEL = "gemini-2.0-flash"

# ── System prompts (mirrors app.js — single source of truth is here now) ──
SYSTEM_PROMPTS = {
    "kids": (
        "You are Cap, a friendly Robot Chef mentor for kids aged 7–12. "
        "Personality: warm, patient, wildly encouraging, safety-obsessed, uses simple everyday words. "
        "Teaching focus: kitchen safety rules first, ingredient identification, "
        "simple prep (washing, tearing, stirring, measuring). "
        "Format: MAX 2–3 sentences. End with a cheer or positive reinforcement. "
        "Camera images: briefly note one thing you see, then give ONE safety tip or observation. "
        'Never suggest knives, open flames, or raw meat without explicitly saying "ask a grown-up first!".'
    ),
    "teens": (
        "You are Cap, a knowledgeable Robot Chef mentor for teens aged 14+. "
        "Personality: practical, respectful, treats them as capable young chefs, passionate about global flavors. "
        "Teaching focus: global cuisines and flavor science, knife technique (with safety), "
        "restaurant-style mise en place, plating. "
        "Format: 3–4 sentences max. Use real culinary vocabulary they can grow into. "
        "Camera images: give specific technical feedback on technique, setup, or efficiency. "
        "Mention safety for hot/sharp tools but treat them as independent and capable."
    ),
}

AUTO_PROMPTS = {
    "kids": (
        "Look at this kitchen scene. Give one quick, friendly safety tip or "
        "encouraging comment in 1–2 sentences for a child."
    ),
    "teens": (
        "Look at this cooking scene. Give one brief, specific technical tip "
        "or observation in 1–2 sentences for a teen chef."
    ),
}


# ── Static file serving ───────────────────────────────────────
@app.route('/')
def index():
    return send_from_directory(STATIC_DIR, 'index.html')

@app.route('/app.js')
def app_js():
    return send_from_directory(STATIC_DIR, 'app.js')

@app.route('/cap.png')
def cap_png():
    return send_from_directory(STATIC_DIR, 'cap.png')


def _system(age: str) -> str:
    return SYSTEM_PROMPTS.get(age, SYSTEM_PROMPTS["kids"])


def _decode_frame(b64_string: str) -> bytes:
    """Strip optional data-URI header and decode base64."""
    if "," in b64_string:
        b64_string = b64_string.split(",", 1)[1]
    return base64.b64decode(b64_string)


# ── Health check ──────────────────────────────────────────────
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": MODEL})


# ── Auto-vision endpoint (called every 3 s by the capture loop) ───────────
@app.route("/api/coach/vision", methods=["POST"])
def vision():
    """
    Body: { "image": "<base64 jpeg>", "age": "kids"|"teens" }
    Returns: { "reply": "..." }
    """
    data = request.get_json(force=True)
    age  = data.get("age", "kids")
    img_b64 = data.get("image", "")

    if not img_b64:
        return jsonify({"error": "No image provided"}), 400

    try:
        img_bytes = _decode_frame(img_b64)
        model = genai.GenerativeModel(
            model_name=MODEL,
            system_instruction=_system(age),
        )
        response = model.generate_content(
            [
                {"mime_type": "image/jpeg", "data": img_bytes},
                AUTO_PROMPTS.get(age, AUTO_PROMPTS["kids"]),
            ],
            generation_config=genai.GenerationConfig(
                max_output_tokens=120,
                temperature=0.75,
            ),
        )
        return jsonify({"reply": response.text})

    except Exception as e:
        app.logger.error("vision error: %s", e)
        return jsonify({"error": str(e)}), 500


# ── Chat endpoint (user-initiated messages) ───────────────────
@app.route("/api/coach/chat", methods=["POST"])
def chat():
    """
    Body: {
      "message": "...",
      "age": "kids"|"teens",
      "history": [ {role, parts:[{text}]}, ... ],   // optional
      "image": "<base64 jpeg>"                       // optional
    }
    Returns: { "reply": "...", "history": [...] }
    """
    data    = request.get_json(force=True)
    age     = data.get("age", "kids")
    message = data.get("message", "").strip()
    history = data.get("history", [])   # [{role, parts:[{text}]}]
    img_b64 = data.get("image")

    if not message:
        return jsonify({"error": "No message provided"}), 400

    try:
        model = genai.GenerativeModel(
            model_name=MODEL,
            system_instruction=_system(age),
        )

        # Rebuild conversation history for the SDK
        # History entries are text-only; current turn may include a frame
        sdk_history = []
        for turn in history:
            role  = turn.get("role")
            parts = [p["text"] for p in turn.get("parts", []) if "text" in p]
            if role and parts:
                sdk_history.append({"role": role, "parts": parts})

        chat_session = model.start_chat(history=sdk_history)

        # Build the current user turn
        user_parts = []
        if img_b64:
            try:
                user_parts.append(
                    {"mime_type": "image/jpeg", "data": _decode_frame(img_b64)}
                )
            except Exception:
                pass  # frame decode failed — send text only
        user_parts.append(message)

        response = chat_session.send_message(
            user_parts,
            generation_config=genai.GenerationConfig(
                max_output_tokens=180,
                temperature=0.78,
                top_p=0.92,
            ),
        )

        reply_text = response.text

        # Return updated history (text-only — keep frames out of history)
        updated_history = history + [
            {"role": "user",  "parts": [{"text": message}]},
            {"role": "model", "parts": [{"text": reply_text}]},
        ]

        # Trim to 16 entries (8 pairs)
        if len(updated_history) > 16:
            updated_history = updated_history[-16:]

        return jsonify({"reply": reply_text, "history": updated_history})

    except Exception as e:
        app.logger.error("chat error: %s", e)
        return jsonify({"error": str(e)}), 500


# ── Run ───────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    # Get LAN IP so the user knows what to open on iPad
    try:
        lan_ip = socket.gethostbyname(socket.gethostname())
    except Exception:
        lan_ip = "your-mac-ip"
    print(f"\n🤖  Cap is running!")
    print(f"    Local:  https://localhost:{port}")
    print(f"    iPad:   https://{lan_ip}:{port}")
    print(f"\n    ⚠️  First visit: tap 'Advanced' → 'Proceed' to accept the self-signed cert.\n")
    app.run(host="0.0.0.0", port=port, debug=False, ssl_context="adhoc")
