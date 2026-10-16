#!/usr/bin/env python3
"""A stand-in take so the 14 styles can be previewed and rendered before you record anything.

    tools/py tools/style-reel/make_demo.py

Writes assets/face.mp4 (30 s, 1080×1920, a placeholder where your face will be, silent) and assets/words.js (placeholder
caption words in the demo's face windows). new_reel.py replaces both with your own take and your own words.
The demo scenes (styles/*.js) show a reel for a made-up bakery («شیرینی‌فروشی نمونه»): a worked example of every
scene type, rewritten for each new reel.
"""
import json, subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
A = HERE / "assets"
FONT = A / "fonts" / "Vazirmatn-Bold.ttf"

# the demo's face windows (index.html → FACE) with placeholder words, timed inside them
WINDOWS = [(0.0, 2.07, "اینجا صورت خودت میاد"), (5.68, 7.81, "توی پنجره‌های صورت"), (14.69, 16.44, "زیرنویس کلمه به کلمه"),
           (18.99, 20.7, "زیر چونه، وسط کادر")]
words = []
for s, e, text in WINDOWS:
    ws = text.split(); step = (e - s - .1) / len(ws)
    words += [{"t": w, "s": round(s + .05 + i * step, 3), "e": round(s + .05 + (i + 1) * step - .04, 3)} for i, w in enumerate(ws)]
(A / "words.js").write_text("window.WORDS=" + json.dumps(words, ensure_ascii=False) + ";", encoding="utf-8")

# a still placeholder (Pillow, so any ffmpeg build works) with a slow push-in, plus silent audio
from PIL import Image, ImageDraw, ImageFont
img = Image.new("RGB", (1080, 1920)); d = ImageDraw.Draw(img)
for y in range(1920):
    v = int(52 + 46 * y / 1920); d.line([(0, y), (1080, y)], fill=(v, v + 4, v + 10))
d.ellipse([340, 520, 740, 1000], outline=(200, 205, 215), width=10)            # head
d.rounded_rectangle([220, 1060, 860, 1500], radius=200, outline=(200, 205, 215), width=10)  # shoulders
f = ImageFont.truetype(str(FONT), 96); tw = d.textlength("YOUR TAKE", font=f)
d.text(((1080 - tw) / 2, 1190), "YOUR TAKE", font=f, fill=(235, 238, 245))
still = A / "_placeholder.png"; img.save(still)
subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-loop", "1", "-framerate", "30", "-i", str(still),
                "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-t", "30",
                "-vf", "zoompan=z='1+0.0002*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,format=yuv420p",
                "-c:v", "libx264", "-crf", "23", "-c:a", "aac", "-shortest", str(A / "face.mp4")], check=True)
# the placeholder speaker cut out (what tools/take/cutout.py makes from a real take): the same picture and the same push-in,
# with the head-and-shoulders shape as alpha, so words can be tried BEHIND the head (the depth style) before filming
mask = Image.new("L", (1080, 1920), 0); m = ImageDraw.Draw(mask)
m.ellipse([340, 520, 740, 1000], fill=255); m.rectangle([480, 960, 600, 1080], fill=255); m.rounded_rectangle([220, 1060, 860, 1920], radius=200, fill=255)
mpath = A / "_mask.png"; mask.save(mpath)
zp = "zoompan=z='1+0.0002*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30"
subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", str(A / "face.mp4"), "-loop", "1", "-framerate", "30", "-i", str(mpath),
                "-t", "30", "-filter_complex", f"[1]{zp},format=gray[a];[0:v][a]alphamerge,format=yuva420p",
                "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", "40", "-auto-alt-ref", "0", "-row-mt", "1", "-deadline", "realtime", "-cpu-used", "8",
                str(A / "subject.webm")], check=True)
# where the head is (tools/take/headpos.py writes this for a real take)
(A / "headpos.js").write_text("window.HEAD=" + json.dumps([{"id": "demo", "start": 0, "end": 30, "head_top": 520, "head_x": [340, 740],
                                                             "face_bottom": 1000, "body": [220, 520, 860, 1920], "moves": False}]) + ";\n", encoding="utf-8")
still.unlink(); mpath.unlink()
print(f"demo ok: {A / 'face.mp4'}, subject.webm, headpos.js and {len(words)} placeholder words")
