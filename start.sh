#!/bin/sh
set -e
npx prisma db push --accept-data-loss

if [ "$RUN_BOT" = "true" ]; then
  echo "Demarrage du bot Vinted..."
  python3 bot/bot.py &
fi

exec node src/index.js
