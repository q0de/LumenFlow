# LumenFlow Frontend

Modern web interface for LumenFlow video processing pipeline.

## Tech Stack

- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Dropzone** for file uploads
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- FFmpeg installed and in PATH

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Features

- 🎬 Drag & drop video upload
- 📊 Real-time processing progress
- 🎨 Modern, responsive UI
- ⚡ Fast file processing
- 📥 Direct WEBM download

## API Routes

- `POST /api/upload` - Upload video file
- `GET /api/jobs/[jobId]` - Get job status
- `GET /api/download/[jobId]` - Download processed WEBM

## Architecture

The frontend uses Next.js App Router with:
- Server-side API routes for file processing
- Client-side React components for UI
- Real-time progress polling
- Shared job state management

## Notes

- Job storage is currently in-memory (use Redis/database in production)
- File size limit: 100MB (configurable in `next.config.js`)
- Requires FFmpeg for video processing

