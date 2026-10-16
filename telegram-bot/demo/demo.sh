#!/usr/bin/env bash
# Try the whole bot without any account (fake Telegram, Instagram and Gemini on this computer; a browser page plays
# Telegram). The work is in demo.mjs, which runs the same on Windows:  node telegram-bot/demo/demo.mjs [en|fa|ar|tr|de|fr|it]
exec node "$(dirname "$0")/demo.mjs" "$@"
