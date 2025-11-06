#!/bin/bash
# LumenFlow - Auto Sync Script (Linux/macOS)
# Watches the input folder and automatically processes new videos

INPUT_DIR="./input"
KEYED_DIR="./keyed"
WEBM_DIR="./webm"
CONFIG="pipeline_config.json"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}LumenFlow Auto Sync${NC}"
echo "Watching: $INPUT_DIR"
echo "Press Ctrl+C to stop"
echo ""

# Ensure directories exist
mkdir -p "$INPUT_DIR" "$KEYED_DIR" "$WEBM_DIR"

# Function to process a video file
process_video() {
    local file="$1"
    local basename=$(basename "$file" .mp4)
    
    echo -e "${YELLOW}Processing: $file${NC}"
    
    # Step 1: Chroma key
    echo "  → Chroma keying..."
    python3 scripts/chroma_key.py "$file" -c "$CONFIG"
    
    if [ $? -eq 0 ]; then
        # Step 2: Convert to WEBM
        echo "  → Converting to WEBM..."
        python3 scripts/convert_webm.py "$KEYED_DIR/${basename}_alpha.mp4" -c "$CONFIG"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Complete: $basename${NC}"
        else
            echo "✗ WEBM conversion failed for: $basename"
        fi
    else
        echo "✗ Chroma key failed for: $basename"
    fi
    
    echo ""
}

# Watch for new files (using inotify on Linux, fswatch on macOS)
if command -v inotifywait &> /dev/null; then
    # Linux
    inotifywait -m -e close_write --format '%f' "$INPUT_DIR" | while read file
    do
        if [[ "$file" == *.mp4 ]]; then
            process_video "$INPUT_DIR/$file"
        fi
    done
elif command -v fswatch &> /dev/null; then
    # macOS
    fswatch -o "$INPUT_DIR" | while read f
    do
        for file in "$INPUT_DIR"/*.mp4; do
            if [ -f "$file" ]; then
                process_video "$file"
            fi
        done
    done
else
    echo "Error: inotifywait (Linux) or fswatch (macOS) required for file watching"
    echo "Install: sudo apt-get install inotify-tools  (Linux)"
    echo "Install: brew install fswatch  (macOS)"
    exit 1
fi

