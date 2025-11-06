# 🎬 LumenFlow — Requirements Document

**Repository:** [https://github.com/q0de/LumenFlow](https://github.com/q0de/LumenFlow)

**Purpose:** Automate the creation of AI-generated, green-screen videos and convert them into alpha-enabled WEBM files for seamless integration into Unity.

---

## 1. Overview

LumenFlow provides a full workflow for generating and compositing transparent-background actors. It streamlines:

* AI video generation (via Veo or similar)
* Automated chroma keying
* WEBM conversion with alpha
* Direct Unity integration

**Goal:** Achieve *cinematic, light-reactive transparency* for in-game video overlays, cinematics, or AR-style assets.

---

## 2. Workflow Summary

```
AI Video (Veo) → MP4 (Green Screen) → Chroma Key → MP4 (Alpha) → WEBM → Unity
```

**Core Principles:**

* Full automation from generation to import.
* No manual keying or video editing.
* Consistent color pipeline and encoding standards.

---

## 3. GitHub Repository Setup

### Folder Structure

```
LumenFlow/
 ├─ /input/        # Raw Veo MP4s (green screen)
 ├─ /keyed/        # Chroma-keyed MP4s (with alpha)
 ├─ /webm/         # Final Unity-ready WEBM files
 ├─ /scripts/      # Python/FFmpeg automation scripts
 ├─ /unity-demo/   # Example Unity scene for playback
 ├─ README.md
 ├─ requirements.txt
 └─ pipeline_config.json
```

### Recommended Branches

| Branch       | Purpose                          |
| ------------ | -------------------------------- |
| `main`       | Stable production-ready pipeline |
| `dev`        | Active development & testing     |
| `unity-demo` | Demo Unity integration project   |
| `docs`       | Documentation and diagrams       |

---

## 4. Functional Requirements

| Stage         | Function                                   | Tool / Tech                | Output                  |
| ------------- | ------------------------------------------ | -------------------------- | ----------------------- |
| AI Generation | Generate MP4 with uniform green background | Veo (API or manual upload) | `input/video.mp4`       |
| Keying        | Remove green and output alpha              | FFmpeg or Python w/ OpenCV | `keyed/video_alpha.mp4` |
| Conversion    | Encode to WEBM with alpha                  | FFmpeg (libvpx-vp9 / AV1)  | `webm/video.webm`       |
| Import        | Play transparent video in Unity            | Unity VideoPlayer          | Transparent playback    |

---

## 5. Scripts

### `chroma_key.py`

* Uses FFmpeg to isolate green pixels and replace them with transparency.
* Supports custom tolerance settings.
* Configurable via `pipeline_config.json`.

### `convert_webm.py`

* Converts alpha MP4s to WEBM.
* Preserves transparency and compresses file size.
* Sample FFmpeg call:

  ```bash
  ffmpeg -i keyed/video_alpha.mp4 -c:v libvpx-vp9 -pix_fmt yuva420p webm/video.webm
  ```

### `auto_sync.sh` / `auto_sync.bat`

* Watches `/input/` and triggers chroma + conversion steps automatically.
* Optional webhook integration with Veo output folder or API.

---

## 6. Unity Integration

**Unity Version:** 2022.3+ (supports WEBM alpha)

**Setup Steps:**

1. Import WEBM into Assets.
2. Add VideoPlayer component to scene.
3. Use Unlit/Transparent shader for playback.
4. Enable alpha channel support in material.
5. Assign to `RenderTexture` for compositing.

---

## 7. Config File Example (`pipeline_config.json`)

```json
{
  "input_folder": "./input/",
  "keyed_folder": "./keyed/",
  "output_folder": "./webm/",
  "background_hex": "#00FF00",
  "chroma_tolerance": 0.1,
  "ffmpeg_threads": 4,
  "video_codec": "libvpx-vp9",
  "pix_fmt": "yuva420p",
  "quality": "good",
  "unity_export_path": "../UnityProject/Assets/Videos/"
}
```

---

## 8. Roadmap

| Phase | Goal                                        | Status        |
| ----- | ------------------------------------------- | ------------- |
| 1     | Manual pipeline test (Veo → FFmpeg → Unity) | ✅ In progress |
| 2     | Scripted chroma + conversion                | 🔜            |
| 3     | Veo API integration (direct MP4 fetch)      | 🔜            |
| 4     | Unity demo scene and shader setup           | 🔜            |
| 5     | Optional GUI (web dashboard for uploads)   | 🔜            |

---

## 9. Technical Specifications

### Video Codecs

* **Input:** MP4 (H.264) with green screen background
* **Intermediate:** MP4 (H.264) with alpha channel (yuva420p)
* **Output:** WEBM (VP9 or AV1) with alpha channel (yuva420p)

### Color Space

* Green screen: `#00FF00` (configurable)
* Chroma tolerance: `0.1` (configurable, 0.0-1.0)
* Alpha blending: Automatic edge smoothing

### Performance

* Multi-threaded encoding (configurable thread count)
* Quality presets: `best`, `good`, `fast`
* File size optimization for Unity streaming

---

## 10. Dependencies

### Required

* Python 3.8+
* FFmpeg (with libvpx-vp9 and libaom-av1 support)
* Unity 2022.3+ (for integration)

### Python Packages

* `opencv-python>=4.8.0`
* `numpy>=1.24.0`
* `Pillow>=10.0.0`

---

## 11. Future Enhancements

* Real-time preview during processing
* Batch processing with progress tracking
* Web dashboard for upload and monitoring
* Veo API integration for direct video fetch
* Advanced edge refinement algorithms
* Support for multiple background colors
* Automatic quality optimization based on content

