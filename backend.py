"""
Cap — Robot Chef Mentor | backend.py

Local:  python backend.py   (http://localhost:5000)
Render: gunicorn backend:app --bind 0.0.0.0:$PORT --workers 2 --timeout 60
"""

import os
import base64
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import google.generativeai as genai

# ── Init ──────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent
app = Flask(__name__, static_folder=None)

# CORS only needed when the frontend is opened as file:// locally.
# When served by Flask itself (Render / python backend.py) requests are same-origin.
CORS(app, origins=["null", "file://", "http://localhost:*", "http://127.0.0.1:*"])

MODEL = "gemini-2.0-flash"


def _api_key() -> str:
    """Return the API key or raise a clean 503 — checked per-request so the
    health endpoint and static files still work before the key is configured."""
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key:
        raise EnvironmentError("GEMINI_API_KEY is not set")
    return key


# ── System prompts ────────────────────────────────────────────
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


def _system(age: str) -> str:
    return SYSTEM_PROMPTS.get(age, SYSTEM_PROMPTS["kids"])


def _decode_frame(b64_string: str) -> bytes:
    if "," in b64_string:
        b64_string = b64_string.split(",", 1)[1]
    return base64.b64decode(b64_string)


# ── Static frontend files ─────────────────────────────────────
@app.route("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/app.js")
def frontend_js():
    return send_from_directory(BASE_DIR, "app.js")


@app.route("/cap.png")
def cap_image():
    if (BASE_DIR / "cap.png").exists():
        return send_from_directory(BASE_DIR, "cap.png")
    return "", 404


# ── Health check ──────────────────────────────────────────────
@app.route("/api/health")
def health():
    key_set = bool(os.environ.get("GEMINI_API_KEY", "").strip())
    return jsonify({"status": "ok", "model": MODEL, "key_configured": key_set})


# ── Auto-vision endpoint ──────────────────────────────────────
@app.route("/api/coach/vision", methods=["POST"])
def vision():
    """Body: { image: <base64 jpeg>, age: "kids"|"teens" }"""
    data    = request.get_json(force=True)
    age     = data.get("age", "kids")
    img_b64 = data.get("image", "")

    if not img_b64:
        return jsonify({"error": "No image provided"}), 400

    try:
        key = _api_key()
        genai.configure(api_key=key)
        model = genai.GenerativeModel(
            model_name=MODEL,
            system_instruction=_system(age),
        )
        response = model.generate_content(
            [
                {"mime_type": "image/jpeg", "data": _decode_frame(img_b64)},
                AUTO_PROMPTS.get(age, AUTO_PROMPTS["kids"]),
            ],
            generation_config=genai.GenerationConfig(
                max_output_tokens=120,
                temperature=0.75,
            ),
        )
        return jsonify({"reply": response.text})

    except EnvironmentError as e:
        return jsonify({"error": str(e)}), 503
    except Exception as e:
        app.logger.error("vision error: %s", e)
        return jsonify({"error": str(e)}), 500


# ── Chat endpoint ─────────────────────────────────────────────
@app.route("/api/coach/chat", methods=["POST"])
def chat():
    """
    Body: { message, age, history?: [{role, parts:[{text}]}], image?: <base64> }
    Returns: { reply, history }
    """
    data    = request.get_json(force=True)
    age     = data.get("age", "kids")
    message = data.get("message", "").strip()
    history = data.get("history", [])
    img_b64 = data.get("image")

    if not message:
        return jsonify({"error": "No message provided"}), 400

    try:
        key = _api_key()
        genai.configure(api_key=key)
        model = genai.GenerativeModel(
            model_name=MODEL,
            system_instruction=_system(age),
        )

        sdk_history = []
        for turn in history:
            role  = turn.get("role")
            parts = [p["text"] for p in turn.get("parts", []) if "text" in p]
            if role and parts:
                sdk_history.append({"role": role, "parts": parts})

        chat_session = model.start_chat(history=sdk_history)

        user_parts = []
        if img_b64:
            try:
                user_parts.append(
                    {"mime_type": "image/jpeg", "data": _decode_frame(img_b64)}
                )
            except Exception:
                pass
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

        updated_history = history + [
            {"role": "user",  "parts": [{"text": message}]},
            {"role": "model", "parts": [{"text": reply_text}]},
        ]
        if len(updated_history) > 16:
            updated_history = updated_history[-16:]

        return jsonify({"reply": reply_text, "history": updated_history})

    except EnvironmentError as e:
        return jsonify({"error": str(e)}), 503
    except Exception as e:
        app.logger.error("chat error: %s", e)
        return jsonify({"error": str(e)}), 500


# ── Local dev entry point ─────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"\n🤖  Cap is running → http://localhost:{port}")
    print(f"    Key configured: {bool(os.environ.get('GEMINI_API_KEY'))}\n")
    app.run(host="0.0.0.0", port=port, debug=False)
