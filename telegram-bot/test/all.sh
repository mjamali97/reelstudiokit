#!/usr/bin/env bash
# Every local check of the bot (mock Telegram, Zernio and Gemini; nothing leaves this computer). The work is in all.mjs,
# which runs the same on Windows:  node telegram-bot/test/all.mjs
exec node "$(dirname "$0")/all.mjs" "$@"
