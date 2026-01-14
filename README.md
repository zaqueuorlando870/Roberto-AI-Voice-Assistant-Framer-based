# Roberto AI - Framer Component

A voice-powered AI assistant component for Framer websites. Uses OpenAI's GPT-4 to provide intelligent responses to voice commands.

## Features

- 🎤 Real-time voice recognition
- 🤖 GPT-4 AI responses
- 🎨 Beautiful animated UI
- 🔐 Secure backend integration
- 📱 Responsive design
- 🎯 Customizable colors & position
- ⌨️ Keyboard shortcuts (Spacebar)

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env and add: OPENAI_API_KEY=sk-proj-your-key
```

### 3. Start Backend
```bash
npm run dev
```

### 4. Use in Framer
```typescript
import { RobertoAI } from "./RobertoAI"

export default function MyFrame() {
  return <RobertoAI />
}
```

## Configuration Props

```typescript
<RobertoAI
  apiEndpoint="http://localhost:3000/api/chat"    // Backend URL
  buttonColor="#e60000"                           // Button color
  position="bottom-right"                         // or: bottom-left, top-right, top-left
  systemPrompt="You are Roberto..."               // Custom AI prompt
/>
```

## API Endpoints

### POST `/api/chat`
Send a message and get an AI response.

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, what can you do?"}'
```

**JavaScript/Fetch:**
```javascript
const response = await fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Hello, what can you do?",
    systemPrompt: "You are Roberto, a helpful AI assistant."
  })
})

const data = await response.json()
console.log(data.response)
```

**Request:**
```json
{
  "message": "Your question here",
  "systemPrompt": "Optional custom behavior"
}
```

**Response:**
```json
{
  "response": "AI response here"
}
```

### GET `/api/health`
Check if server is running.

```bash
curl http://localhost:3000/api/health
```

**Response:**
```json
{
  "status": "ok",
  "message": "Roberto AI server is running"
}
```

## Deployment

- **Vercel** (recommended): `vercel` → Set `OPENAI_API_KEY` env var
- **Heroku**: `heroku create` → `heroku config:set OPENAI_API_KEY=...`
- **Railway/Render**: Add `OPENAI_API_KEY` env var in dashboard

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Failed to get response" | Check backend: `curl http://localhost:3000/api/health` |
| "API key not set" | Create `.env` file with `OPENAI_API_KEY` |
| "CORS error" | Backend must be running on specified endpoint |
| "No sound" | Check microphone permissions in browser |

## Browser Support

✅ Chrome, Firefox, Edge, Safari 14.1+

## Files

```
├── RobertoAI.tsx    # Framer component
├── server.js        # Express backend
├── package.json     # Dependencies
├── .env.example     # Environment template
├── README.md        # This file
├── DEPLOYMENT.md    # Deployment guide
├── EXAMPLE.tsx      # Code examples
└── QUICK_START.md   # Quick reference
```

## Security

✅ API keys in `.env` (backend only)  
✅ CORS enabled  
✅ No hardcoded secrets  
✅ .gitignore configured  

## License

MIT