"""
One-shot script: generate Captain Culinary Kids landing-page illustrations
using Gemini Nano Banana (gemini-3.1-flash-image-preview) via the Emergent
LLM key.

Saves PNGs into /app/frontend/public/illustrations/
"""
import asyncio
import base64
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path("/app/backend/.env"))

from emergentintegrations.llm.chat import LlmChat, UserMessage  # noqa: E402

OUT = Path("/app/frontend/public/illustrations")
OUT.mkdir(parents=True, exist_ok=True)

# Shared style bible (matches the AWANA explainer PDF mood)
STYLE = (
    "Warm 2D illustrated children's book style, smooth clean outlines, soft "
    "rounded shapes, expressive friendly faces, gentle cel-shading with subtle "
    "highlights, soft warm lighting, cream/off-white flat background, bright "
    "accent dots in AWANA circle-game colors (red, blue, green, yellow). "
    "Diverse ethnicities (Black, Asian, Hispanic, White, Middle-Eastern mix). "
    "Age 7-13. Modern casual clothing (t-shirts, aprons). "
    "Happy, engaged, curious expressions looking at viewer. NOT 3D render, "
    "NOT photograph, NOT anime. Print-quality educational illustration."
)

JOBS = [
    (
        "kid_portrait_1.png",
        "Circular portrait headshot of a cheerful 8-year-old Black girl with curly "
        "hair in two puffs, big warm smile, wearing a yellow t-shirt with a tiny "
        "apron, looking directly at viewer. Small simple cream background with a "
        "bright yellow accent circle behind her head. " + STYLE,
    ),
    (
        "kid_portrait_2.png",
        "Circular portrait headshot of a 10-year-old Asian boy with short black "
        "hair, wide confident smile, wearing a blue striped t-shirt, looking "
        "directly at viewer. Simple cream background with a bright blue accent "
        "circle behind his head. " + STYLE,
    ),
    (
        "kid_portrait_3.png",
        "Circular portrait headshot of a 12-year-old Hispanic girl with long "
        "brown hair pulled back, kind thoughtful smile, wearing a green apron "
        "over a white shirt, looking directly at viewer. Simple cream background "
        "with a bright green accent circle behind her head. " + STYLE,
    ),
    (
        "kid_portrait_4.png",
        "Circular portrait headshot of a 7-year-old White boy with messy sandy "
        "hair, beaming toothy smile, wearing a red t-shirt, looking directly at "
        "viewer. Simple cream background with a bright red accent circle behind "
        "his head. " + STYLE,
    ),
    (
        "kid_portrait_5.png",
        "Circular portrait headshot of an 11-year-old Middle-Eastern girl with "
        "dark wavy shoulder-length hair, calm gentle smile, wearing a teal "
        "turtleneck, looking directly at viewer. Simple cream background with a "
        "bright yellow accent circle behind her head. " + STYLE,
    ),
    (
        "kids_group_cooking.png",
        "Wide horizontal scene: five diverse children (Black girl, Asian boy, "
        "Hispanic girl, White boy, Middle-Eastern girl, ages 7-12) gathered "
        "around a warm wooden kitchen table, smiling and engaged. Fresh "
        "ingredients on the table: carrots, tomatoes, bread, a wooden bowl of "
        "eggs, fresh herbs. Simple cream/warm-cream background with soft out-of-"
        "focus cozy kitchen hints. Kids wearing casual clothes with simple "
        "aprons in AWANA colors (red, blue, green, yellow). Warm, inviting, "
        "educational mood. No adults visible. No captions or text. " + STYLE,
    ),
]


async def generate_one(filename: str, prompt: str):
    api_key = os.getenv("EMERGENT_LLM_KEY")
    chat = LlmChat(
        api_key=api_key,
        session_id=f"cck-illus-{filename}",
        system_message="You are an expert children's book illustrator.",
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
        modalities=["image", "text"]
    )
    msg = UserMessage(text=prompt)
    try:
        text, images = await chat.send_message_multimodal_response(msg)
    except Exception as e:
        print(f"  ! {filename}  ERROR: {e}")
        return False
    if not images:
        print(f"  ! {filename}  no image returned; text={text[:80]}")
        return False
    img_bytes = base64.b64decode(images[0]["data"])
    path = OUT / filename
    path.write_bytes(img_bytes)
    size_kb = len(img_bytes) // 1024
    print(f"  ✓ {filename}  ({size_kb} KB)")
    return True


async def main():
    print(f"Writing to {OUT}")
    ok = 0
    for filename, prompt in JOBS:
        if await generate_one(filename, prompt):
            ok += 1
    print(f"\nGenerated {ok}/{len(JOBS)}")


if __name__ == "__main__":
    asyncio.run(main())
