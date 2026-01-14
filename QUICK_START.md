# Quick Reference Guide

## Start the Backend (Required)

```bash
npm install          # One time setup
npm run dev         # Development mode with auto-reload
npm start           # Production mode
```

Server runs on: **http://localhost:3000**

## Use in Framer

```typescript
import { RobertoAI } from "./RobertoAI"

// Basic usage (uses all defaults)
<RobertoAI />

// Custom configuration
<RobertoAI 
  apiEndpoint="http://localhost:3000/api/chat"
  buttonColor="#e60000"
  position="bottom-right"
  systemPrompt="You are a helpful assistant..."
/>
```

## Environment Setup

1. Create `.env` file (copy from `.env.example`)
2. Add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-proj-your-key-here
   ```
3. Restart server

## API Endpoint

**POST** `http://localhost:3000/api/chat`

Request:
```json
{
  "message": "Hello, what can you do?",
  "systemPrompt": "You are Roberto..."
}
```

Response:
```json
{
  "response": "I can help you with..."
}
```

## Component Props

| Prop | Type | Default | Options |
|------|------|---------|---------|
| `apiEndpoint` | string | `http://localhost:3000/api/chat` | Any URL |
| `buttonColor` | string | `#e60000` | Hex color |
| `position` | string | `bottom-right` | `bottom-left`, `top-right`, `top-left` |
| `systemPrompt` | string | "You are Roberto..." | Any text |

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot find module" | Run `npm install` |
| "API key not set" | Create `.env`, add `OPENAI_API_KEY=...` |
| "Connection failed" | Check backend is running: `npm run dev` |
| "CORS error" | Backend must be running on the specified endpoint |
| "No sound" | Check browser microphone permissions |

## Deployment

Vercel (Recommended):
```bash
vercel          # Deploy backend
# Add OPENAI_API_KEY in Vercel dashboard
# Update apiEndpoint in Framer component
```

Heroku:
```bash
heroku create app-name
heroku config:set OPENAI_API_KEY=sk-proj-...
git push heroku main
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for more options.

## Files

```
├── RobertoAI.tsx        ← Framer component
├── server.js            ← Backend API
├── package.json         ← Dependencies
├── .env                 ← Your secrets
├── .gitignore           ← Git settings
└── README.md            ← Full guide
```

## Useful Links

- OpenAI API: https://platform.openai.com/api-keys
- Framer Docs: https://www.framer.com/docs
- Get Help: Check README.md or EXAMPLE.tsx
