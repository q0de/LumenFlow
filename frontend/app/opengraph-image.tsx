import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Green Screen Remover - AI-Powered Video Background Removal'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          🎬 Green Screen Remover
        </div>
        <div
          style={{
            fontSize: 36,
            color: 'white',
            opacity: 0.9,
            textAlign: 'center',
            maxWidth: '800px',
          }}
        >
          Remove Green Screen from Video Online | AI Chroma Key Tool
        </div>
        <div
          style={{
            fontSize: 24,
            color: 'white',
            opacity: 0.8,
            marginTop: 30,
            textAlign: 'center',
          }}
        >
          Free transparent video converter for Unity games
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

