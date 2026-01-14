# Deployment Guide

This guide covers deploying Roberto AI to various hosting platforms.

## Prerequisites

- Node.js 14+ installed
- OpenAI API key (get one at https://platform.openai.com/api-keys)
- Git repository set up

## Vercel (Recommended for Framer)

Vercel integrates seamlessly with Framer and is the easiest deployment option.

### Steps:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Roberto AI"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Select the project

3. **Add Environment Variables**
   - In Vercel dashboard → Settings → Environment Variables
   - Add: `OPENAI_API_KEY` with your API key
   - Add: `NODE_ENV` = `production`

4. **Deploy**
   - Vercel will auto-deploy on git push
   - Your API endpoint: `https://your-project.vercel.app/api/chat`

5. **Update Framer Component**
   ```typescript
   <RobertoAI 
     apiEndpoint="https://your-project.vercel.app/api/chat"
   />
   ```

### Vercel Tips:
- Zero configuration needed
- Auto-scales based on traffic
- Free tier available
- Environment variables are secure

---

## Heroku

### Steps:

1. **Install Heroku CLI**
   ```bash
   brew tap heroku/brew && brew install heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create App**
   ```bash
   heroku create your-app-name
   ```

4. **Add Environment Variables**
   ```bash
   heroku config:set OPENAI_API_KEY=sk-proj-...
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **Check Logs**
   ```bash
   heroku logs --tail
   ```

### Heroku URL:
```
https://your-app-name.herokuapp.com/api/chat
```

---

## Railway

### Steps:

1. **Connect Repository**
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Choose your repository

2. **Add Variables**
   - In dashboard → Variables
   - Add `OPENAI_API_KEY`

3. **Deploy**
   - Railway auto-deploys on git push

4. **Get URL**
   - In dashboard → Settings → Domains
   - Your URL: `https://your-project.railway.app/api/chat`

---

## Render

### Steps:

1. **Create New Web Service**
   - Go to https://render.com
   - Click "New Web Service"
   - Connect GitHub repository

2. **Configure Service**
   - Runtime: Node
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Add Environment**
   - Environment Variables
   - Add `OPENAI_API_KEY`

4. **Deploy**
   - Click "Deploy"

5. **Get URL**
   - In dashboard → Settings
   - Your URL: `https://your-project.onrender.com/api/chat`

---

## Docker Deployment

### Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
```

### Build and Run

```bash
docker build -t roberto-ai .
docker run -e OPENAI_API_KEY=sk-proj-... -p 3000:3000 roberto-ai
```

---

## Environment Variables

Required for all deployments:

| Variable | Required | Example |
|----------|----------|---------|
| `OPENAI_API_KEY` | Yes | `sk-proj-...` |
| `PORT` | No | `3000` (default) |
| `NODE_ENV` | No | `production` |

---

## CORS Configuration

For production, update CORS in `server.js`:

```javascript
app.use(cors({
  origin: ['https://your-domain.com', 'https://your-project.vercel.app'],
  credentials: true
}))
```

---

## Monitoring

### Health Check Endpoint

All platforms support:
```bash
curl https://your-deployed-app/api/health
```

Response:
```json
{
  "status": "ok",
  "message": "Roberto AI server is running"
}
```

---

## Troubleshooting

### "API Key Invalid"
- Regenerate key at https://platform.openai.com/api-keys
- Update environment variable
- Redeploy

### "CORS Error"
- Check `origin` setting in server.js
- Update to match your Framer domain
- Redeploy

### "Service Unavailable"
- Check platform dashboard for errors
- View logs: `heroku logs --tail`
- Verify `OPENAI_API_KEY` is set

---

## Cost Estimation

| Platform | Free Tier | Next Tier |
|----------|-----------|-----------|
| Vercel | 100GB bandwidth | $20/mo |
| Heroku | Discontinued | From $7/mo |
| Railway | $5/mo credit | Pay-as-you-go |
| Render | Free tier | $7/mo |

OpenAI pricing: ~$0.01-0.03 per request depending on model and usage.

---

## Best Practices

✅ **Do:**
- Use environment variables for secrets
- Enable HTTPS (all platforms do this)
- Monitor API usage in OpenAI dashboard
- Set up error logging

❌ **Don't:**
- Commit `.env` files
- Expose API keys in client code
- Use deprecated API endpoints
- Deploy without testing locally

---

## Support

- Vercel Support: https://vercel.com/support
- OpenAI API Status: https://status.openai.com
- Node.js Docs: https://nodejs.org/docs
