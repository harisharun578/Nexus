#!/bin/bash
# Download face-api.js model weights to frontend/public/models/
# Run from project root: bash scripts/download-models.sh

echo "📥 Downloading face-api.js model weights..."
mkdir -p frontend/public/models

BASE="https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"
FILES=(
  "tiny_face_detector_model-weights_manifest.json"
  "tiny_face_detector_model-shard1"
  "face_landmark_68_model-weights_manifest.json"
  "face_landmark_68_model-shard1"
  "face_recognition_model-weights_manifest.json"
  "face_recognition_model-shard1"
  "face_recognition_model-shard2"
)

for FILE in "${FILES[@]}"; do
  echo "  Downloading $FILE..."
  curl -s -o "frontend/public/models/$FILE" "$BASE/$FILE"
done

echo "✅ All models downloaded to frontend/public/models/"
echo "🚀 You can now start the frontend with: cd frontend && npm start"
