#!/usr/bin/env python3
"""
LumenFlow - WEBM Conversion Script
Converts alpha-enabled MP4 files to WEBM format for Unity.
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
            "output_folder": "./webm/",
            "video_codec": "libvpx-vp9",
            "pix_fmt": "yuva420p",
            "quality": "good",
            "ffmpeg_threads": 4,
        }


def convert_to_webm(input_path, output_path, config):
    """
    Convert MP4 with alpha to WEBM using FFmpeg.
    Supports libvpx-vp9 and libaom-av1 codecs.
    """
    codec = config.get("video_codec", "libvpx-vp9")
    pix_fmt = config.get("pix_fmt", "yuva420p")
    quality = config.get("quality", "good")
    threads = config.get("ffmpeg_threads", 4)
    
    # Quality presets for libvpx-vp9
    quality_map = {
        "best": "-crf 15 -b:v 0",
        "good": "-crf 30 -b:v 0",
        "fast": "-crf 40 -b:v 0",
    }
    
    quality_args = quality_map.get(quality, quality_map["good"])
    
    # Build FFmpeg command
    cmd = [
        "ffmpeg",
        "-i", str(input_path),
        "-c:v", codec,
        "-pix_fmt", pix_fmt,
    ]
    
    # Add quality arguments
    if codec == "libvpx-vp9":
        cmd.extend(quality_args.split())
        cmd.extend([
            "-row-mt", "1",  # Multi-threading
            "-threads", str(threads),
        ])
    elif codec == "libaom-av1":
        # AV1 encoding options
        cmd.extend([
            "-crf", "30",
            "-b:v", "0",
            "-cpu-used", "4",
        ])
    
    cmd.extend([
        "-an",  # Remove audio (optional, comment out if needed)
        "-y",   # Overwrite output
        str(output_path),
    ])
    
    print(f"Converting to WEBM: {input_path.name}")
    print(f"Codec: {codec}, Quality: {quality}")
    print(f"Command: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(f"✓ WEBM conversion complete: {output_path}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ FFmpeg error: {e.stderr}", file=sys.stderr)
        return False
    except FileNotFoundError:
        print("✗ FFmpeg not found. Please install FFmpeg.", file=sys.stderr)
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Convert alpha MP4 to WEBM for Unity"
    )
    parser.add_argument(
        "input",
        type=str,
        help="Input video file path (alpha MP4)",
    )
    parser.add_argument(
        "-o", "--output",
        type=str,
        default=None,
        help="Output file path (default: webm/<input_name>.webm)",
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
        output_folder = Path(config.get("output_folder", "./webm/"))
        output_folder.mkdir(parents=True, exist_ok=True)
        output_path = output_folder / f"{input_path.stem}.webm"
    
    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Convert to WEBM
    success = convert_to_webm(input_path, output_path, config)
    
    if success:
        file_size = output_path.stat().st_size / (1024 * 1024)  # MB
        print(f"\n✓ Success! Output: {output_path} ({file_size:.2f} MB)")
        sys.exit(0)
    else:
        print(f"\n✗ WEBM conversion failed.", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

