#!/bin/bash
# Keeps this folder up to date with new Evening Meditations nights and joins split video files.
cd "$(dirname "$0")"
while true; do
  git pull -q origin main 2>&1 | tail -2
  for p in videos/*.part00; do
    [ -e "$p" ] || continue
    f="${p%.part00}"
    [ -f "$f" ] || cat "$f".part* > "$f"
  done
  echo "synced $(date +%H:%M:%S): $(ls videos/*.mp4 2>/dev/null | wc -l) videos"
  sleep 120
done
