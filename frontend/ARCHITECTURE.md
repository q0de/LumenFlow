# LumenFlow Frontend Architecture

## Overview

The LumenFlow frontend is a full-stack Next.js 14 application that provides a modern web interface for processing green-screen videos into alpha-enabled WEBM files.

## Tech Stack

- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Dropzone** - File upload handling
- **Lucide React** - Icon library

## Project Structure

```
frontend/
├── app/
│   ├── api/              # Backend API routes
│   │   ├── upload/       # File upload endpoint
│   │   ├── jobs/         # Job status endpoint
│   │   └── download/     # File download endpoint
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Main UI component
│   └── globals.css       # Global styles
├── lib/
│   └── jobs.ts           # Job state management
└── ...config files
```

## Data Flow

1. **Upload**: User drags & drops video → `POST /api/upload`
2. **Processing**: Server saves file → triggers FFmpeg processing
3. **Progress**: Client polls `GET /api/jobs/[jobId]` every second
4. **Download**: When complete → `GET /api/download/[jobId]`

## API Routes

### POST /api/upload
- Accepts multipart/form-data with video file
- Saves to `../input/` directory
- Returns `{ jobId, filename }`
- Triggers async video processing

### GET /api/jobs/[jobId]
- Returns job status: `{ status, progress, error?, downloadUrl? }`
- Status: `uploading | processing | completed | error`

### GET /api/download/[jobId]
- Streams completed WEBM file
- Sets appropriate headers for download

## State Management

Currently uses in-memory Map for job storage (`lib/jobs.ts`). For production:
- Use Redis for distributed systems
- Use PostgreSQL/MongoDB for persistence
- Add job expiration/cleanup

## Processing Pipeline

1. **Chroma Key** (30% progress)
   - FFmpeg removes green screen
   - Output: MP4 with alpha channel

2. **WEBM Conversion** (60-100% progress)
   - FFmpeg encodes to VP9
   - Preserves alpha channel
   - Optimizes for Unity

## Future Enhancements

- WebSocket/SSE for real-time updates (no polling)
- Video preview before/after processing
- Batch upload support
- User authentication
- Processing queue management
- Cloud storage integration (S3, etc.)

