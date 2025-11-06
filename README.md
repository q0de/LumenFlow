# 🎬 LumenFlow

> **Transparent Actor Video Pipeline** — Automate AI-generated green-screen videos into alpha-enabled WEBM files for Unity

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org/)
[![Unity](https://img.shields.io/badge/Unity-2022.3+-black.svg)](https://unity.com/)
[![FFmpeg](https://img.shields.io/badge/FFmpeg-Required-orange.svg)](https://ffmpeg.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Repository:** [https://github.com/q0de/LumenFlow](https://github.com/q0de/LumenFlow)

---

## 📋 Overview

LumenFlow provides a full workflow for generating and compositing transparent-background actors. It streamlines:

- ✨ AI video generation (via Veo or similar)
- 🎨 Automated chroma keying
- 🎬 WEBM conversion with alpha
- 🎮 Direct Unity integration

**Goal:** Achieve *cinematic, light-reactive transparency* for in-game video overlays, cinematics, or AR-style assets.

---

## 🔄 Workflow

```
AI Video (Veo) → MP4 (Green Screen) → Chroma Key → MP4 (Alpha) → WEBM → Unity
```

**Core Principles:**
- Full automation from generation to import
- No manual keying or video editing
- Consistent color pipeline and encoding standards

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** (for CLI scripts)
- **Node.js 18+** (for web interface)
- **FFmpeg** ([Download](https://ffmpeg.org/download.html))
- **Unity 2022.3+** (for integration)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/q0de/LumenFlow.git
   cd LumenFlow
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Verify FFmpeg installation:**
   ```bash
   ffmpeg -version
   ```

4. **Configure the pipeline:**
   - Edit `pipeline_config.json` with your preferred settings
   - Adjust chroma tolerance, codec, and output paths as needed

---

## 📁 Project Structure

```
LumenFlow/
 ├─ /input/        # Raw Veo MP4s (green screen)
 ├─ /keyed/        # Chroma-keyed MP4s (with alpha)
 ├─ /webm/         # Final Unity-ready WEBM files
 ├─ /scripts/      # Python/FFmpeg automation scripts
 ├─ /frontend/     # Next.js web interface
 ├─ /unity-demo/   # Example Unity scene for playback
 ├─ README.md
 ├─ requirements.txt
 └─ pipeline_config.json
```

---

## 🛠️ Usage

### Manual Processing

1. **Place your green-screen MP4 in `/input/`:**
   ```bash
   cp your_video.mp4 input/
   ```

2. **Run chroma keying:**
   ```bash
   python scripts/chroma_key.py input/your_video.mp4
   ```

3. **Convert to WEBM:**
   ```bash
   python scripts/convert_webm.py keyed/your_video_alpha.mp4
   ```

4. **Import to Unity:**
   - Copy `webm/your_video.webm` to your Unity project's Assets folder
   - Use VideoPlayer component with Unlit/Transparent shader

### Automated Processing

**Linux/macOS:**
```bash
./scripts/auto_sync.sh
```

**Windows:**
```powershell
.\scripts\auto_sync.bat
```

This watches the `/input/` folder and automatically processes new videos.

### Web Interface (Recommended)

**Modern Next.js 14+ dashboard with drag & drop upload:**

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   - Visit [http://localhost:3000](http://localhost:3000)
   - Drag & drop your green-screen videos
   - Watch real-time processing progress
   - Download completed WEBM files

**Features:**
- 🎨 Modern, responsive UI with Tailwind CSS
- 📤 Drag & drop file upload
- 📊 Real-time progress tracking
- ⚡ Fast processing with FFmpeg
- 📥 Direct WEBM download

**Tech Stack:**
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- React Dropzone

See [frontend/README.md](frontend/README.md) for more details.

---

## ⚙️ Configuration

Edit `pipeline_config.json` to customize:

```json
{
  "input_folder": "./input/",
  "output_folder": "./webm/",
  "background_hex": "#00FF00",
  "chroma_tolerance": 0.1,
  "ffmpeg_threads": 4,
  "video_codec": "libvpx-vp9",
  "unity_export_path": "../UnityProject/Assets/Videos/"
}
```

**Key Settings:**
- `background_hex`: Green screen color (default: `#00FF00`)
- `chroma_tolerance`: Keying sensitivity (0.0-1.0, lower = stricter)
- `video_codec`: `libvpx-vp9` (recommended) or `libaom-av1`
- `ffmpeg_threads`: CPU threads for encoding

---

## 🎮 Unity Integration

### Setup Steps

1. **Import WEBM into Assets:**
   - Copy files from `/webm/` to `Assets/Videos/`

2. **Add VideoPlayer component:**
   ```csharp
   VideoPlayer videoPlayer = gameObject.AddComponent<VideoPlayer>();
   videoPlayer.clip = Resources.Load<VideoClip>("Videos/your_video");
   videoPlayer.renderMode = VideoRenderMode.RenderTexture;
   ```

3. **Use Unlit/Transparent shader:**
   - Create material with `Unlit/Transparent` shader
   - Assign RenderTexture from VideoPlayer
   - Enable alpha channel support

4. **Example Material Setup:**
   ```
   Shader: Unlit/Transparent
   Rendering Mode: Transparent
   Main Texture: [VideoPlayer RenderTexture]
   ```

---

## 📊 Functional Requirements

| Stage         | Function                                   | Tool / Tech                | Output                  |
| ------------- | ------------------------------------------ | -------------------------- | ----------------------- |
| AI Generation | Generate MP4 with uniform green background | Veo (API or manual upload) | `input/video.mp4`       |
| Keying        | Remove green and output alpha              | FFmpeg or Python w/ OpenCV | `keyed/video_alpha.mp4` |
| Conversion    | Encode to WEBM with alpha                  | FFmpeg (libvpx-vp9 / AV1)  | `webm/video.webm`       |
| Import        | Play transparent video in Unity            | Unity VideoPlayer          | Transparent playback    |

---

## 🗂️ Branch Structure

| Branch       | Purpose                          |
| ------------ | -------------------------------- |
| `main`       | Stable production-ready pipeline |
| `dev`        | Active development & testing     |
| `unity-demo` | Demo Unity integration project   |
| `docs`       | Documentation and diagrams       |

---

## 🗺️ Roadmap

| Phase | Goal                                        | Status        |
| ----- | ------------------------------------------- | ------------- |
| 1     | Manual pipeline test (Veo → FFmpeg → Unity) | ✅ In progress |
| 2     | Scripted chroma + conversion                | 🔜            |
| 3     | Veo API integration (direct MP4 fetch)      | 🔜            |
| 4     | Unity demo scene and shader setup           | 🔜            |
| 5     | Web dashboard for uploads                   | ✅ Complete   |

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **FFmpeg** for video processing
- **OpenCV** for computer vision utilities
- **Unity Technologies** for the game engine
- **Veo** (or similar) for AI video generation

---

## 📧 Contact

For questions or support, please open an issue on [GitHub](https://github.com/q0de/LumenFlow/issues).

---

**Made with ✨ for transparent video workflows**

