#!/usr/bin/env python3
"""
LumenFlow - Chroma Key Script
Removes green screen background and outputs MP4 with alpha channel.
"""

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path


def load_config(config_path="pipeline_config.json"):
    """Load configuration from JSON file."""
    try:
        with open(config_path, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Warning: {config_path} not found. Using defaults.")
        return {
            "keyed_folder": "./keyed/",
            "background_hex": "#00FF00",
            "chroma_tolerance": 0.1,
        }


def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple."""
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i : i + 2], 16) for i in (0, 2, 4))


def chroma_key_ffmpeg(input_path, output_path, config):
    """
    Use FFmpeg to perform chroma keying.
    More efficient than OpenCV for large videos.
    """
    bg_hex = config.get("background_hex", "#00FF00")
    tolerance = config.get("chroma_tolerance", 0.1)
    
    # Convert hex to RGB
    r, g, b = hex_to_rgb(bg_hex)
    
    # FFmpeg chromakey filter parameters
    # similarity: 0.0-1.0 (how similar to key color)
    # blend: 0.0-1.0 (edge blending)
    similarity = tolerance
    blend = tolerance * 0.5
    
    # FFmpeg command for chroma key with alpha
    cmd = [
        "ffmpeg",
        "-i", str(input_path),
        "-vf", f"chromakey=0x{bg_hex[1:].upper()}:{similarity}:{blend}",
        "-c:v", "libx264",
        "-pix_fmt", "yuva420p",
        "-c:a", "copy",
        "-y",  # Overwrite output file
        str(output_path),
    ]
    
    print(f"Running chroma key: {input_path.name}")
    print(f"Command: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(f"✓ Chroma key complete: {output_path}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ FFmpeg error: {e.stderr}", file=sys.stderr)
        return False
    except FileNotFoundError:
        print("✗ FFmpeg not found. Please install FFmpeg.", file=sys.stderr)
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Remove green screen and create alpha channel MP4"
    )
    parser.add_argument(
        "input",
        type=str,
        help="Input video file path (green screen MP4)",
    )
    parser.add_argument(
        "-o", "--output",
        type=str,
        default=None,
        help="Output file path (default: keyed/<input_name>_alpha.mp4)",
    )
    parser.add_argument(
        "-c", "--config",
        type=str,
        default="pipeline_config.json",
        help="Path to pipeline config file",
    )
    
    args = parser.parse_args()
    
    # Load configuration
    config = load_config(args.config)
    
    # Resolve input path
    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Error: Input file not found: {input_path}", file=sys.stderr)
        sys.exit(1)
    
    # Determine output path
    if args.output:
        output_path = Path(args.output)
    else:
        keyed_folder = Path(config.get("keyed_folder", "./keyed/"))
        keyed_folder.mkdir(parents=True, exist_ok=True)
        output_path = keyed_folder / f"{input_path.stem}_alpha.mp4"
    
    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Perform chroma keying
    success = chroma_key_ffmpeg(input_path, output_path, config)
    
    if success:
        print(f"\n✓ Success! Output: {output_path}")
        sys.exit(0)
    else:
        print(f"\n✗ Chroma key failed.", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

