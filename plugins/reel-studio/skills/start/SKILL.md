---
name: start
description: Create a new Reel Studio (an Instagram/YouTube/Telegram content studio for one brand or an agency) in a folder of the user's choice, install its tools, and hand over to its /setup. Use when they type /reel-studio:start, ask to "start a reel studio", "set up the content studio", «ریل استودیو رو راه بنداز», or want to try the demo of the Telegram bots.
---

# /reel-studio:start · a studio for your brand

The studio is a whole folder (skills, tools, fonts, bots), so it lives in its own directory, not inside this plugin.
Talk in the user's language.

1. Ask where to create it (default `~/reel-studio`, or a name they give; an agency can use one folder for all clients).
   If the folder exists and already has `profile/CREATOR.md`, it is a studio: skip to step 4.
2. Clone it: `git clone https://github.com/mjamali97/reelstudiokit.git <folder>`. No git: download
   https://github.com/mjamali97/reelstudiokit/archive/refs/heads/main.zip and unzip it there.
3. Install the core tools: `bash <folder>/tools/install.sh`. It checks git, Node 20+, Python 3.11+, ffmpeg, Chrome and uv
   and prints how to install anything missing; fix those with the user (they run installers that need a password themselves),
   then run it again until it says the core tools are ready. Video tools come later (`bash tools/install.sh video`).
4. Offer, with AskUserQuestion: **Start setup** (recommended) · **Try the demo first** (`bash <folder>/telegram-bot/demo/demo.sh <lang>`:
   their bots running locally with fake Telegram, Instagram and Gemini, in a browser page; no accounts).
5. Hand over: the studio's own skills (`/setup`, `/demo`, `/carousel`, the 14 styles…) load when Claude Code runs **inside
   that folder**. Tell them to run `cd <folder> && claude` and type `/setup`, or, if this session can change its working
   directory, continue there. The guide in their language: `<folder>/docs/guide/<en|fa|ar|tr|de|fr|it>.md`.

Never ask for passwords, keys or tokens in the chat; /setup has them typed into `.env` or GitHub by the user.
