# WhatsApp Picky Eater Education Chatbot

Educational chatbot for mothers dealing with picky eater children. Built with Baileys WhatsApp library and flow-based conversation engine.

## Features

- 🌸 Supportive educational content for mothers
- 🤖 Flow-based conversation management
- 💾 Persistent session storage
- 📊 Interactive polls and menus
- 🐳 Docker deployment ready
- 🔄 Auto-reconnection on disconnect

## Architecture

```
┌─────────────────────────────────────┐
│     Docker Container                │
├─────────────────────────────────────┤
│  Express Server (:3000)             │
│  ├─ /health - Health check          │
│  ├─ /qr - QR code display           │
│  └─ /status - Bot status            │
│                                      │
│  Flow Engine (State Machine)        │
│  ├─ Menu navigation                 │
│  ├─ Educational content             │
│  └─ Response handling               │
│                                      │
│  State Manager (File-based)         │
│  └─ Persistent user sessions        │
│                                      │
│  Baileys WhatsApp Client            │
│  └─ WebSocket connection            │
└─────────────────────────────────────┘
```

## Quick Start

### Using Docker (Recommended)

1. **Build and start the container**
```bash
npm run docker:build
npm run docker:up
```

2. **View QR code**
Open http://localhost:3000/qr in your browser and scan with WhatsApp.

3. **View logs**
```bash
npm run docker:logs
```

4. **Stop the container**
```bash
npm run docker:down
```

### Local Development

1. **Install dependencies**
```bash
npm install
```

2. **Build TypeScript**
```bash
npm run build
```

3. **Start the bot**
```bash
npm start
```

4. **Development mode with auto-reload**
```bash
npm run dev
```

## Project Structure

```
bot-wa/
├── src/
│   ├── baileys.ts          # WhatsApp client wrapper
│   ├── flow-engine.ts      # Conversation flow state machine
│   ├── state-manager.ts    # Persistent session storage
│   ├── server.ts           # Express web server
│   └── utils.ts            # Utility functions
├── examples/
│   └── bot.ts              # Main bot entry point
├── public/
│   └── index.html          # QR code display (auto-generated)
├── state/
│   └── user_sessions.json  # Persistent user sessions
├── auth_info_baileys/      # WhatsApp authentication
├── Dockerfile              # Multi-stage Docker build
├── docker-compose.yml      # Container orchestration
└── package.json
```

## Conversation Flow

The chatbot implements a comprehensive educational flow:

### Main Menu
1. What is a picky eater?
2. My child has difficulty eating
3. I'm worried & confused
4. Easy initial tips
5. Need immediate help

### Educational Topics
- **Causes** of picky eating (sensory, parenting, experience, genetics)
- **Characteristics** (picky behavior patterns)
- **Impact** on nutrition and stunting risk
- **Strategies** (6 practical daily tips)
- **Stunting relationship**

### Difficulty Handling
- Child refuses to eat
- Eats very little
- Only wants certain foods
- Slow/distracted eating

Each path provides empathetic, actionable guidance.

## Configuration

### Environment Variables

Create `.env` file (optional):
```bash
NODE_ENV=production
DEBUG=false
PORT=3000
```

### Docker Volumes

Persistent data stored in:
- `./auth_info_baileys` - WhatsApp session
- `./state` - User conversation state
- `./public` - QR code and web assets

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check (returns 200 OK) |
| `/qr` | GET | Display QR code for authentication |
| `/status` | GET | Bot status and metrics |
| `/` | GET | Redirects to /qr |

## Monitoring

### Health Check
```bash
curl http://localhost:3000/health
```

### Bot Status
```bash
curl http://localhost:3000/status
```

### Docker Logs
```bash
docker-compose logs -f whatsapp-chatbot
```

## Session Management

- **Auto-save**: User sessions saved every 30 seconds
- **Timeout**: Inactive sessions expire after 24 hours
- **Persistence**: Survives container restarts
- **Per-user**: Each WhatsApp number has isolated state

## Troubleshooting

### QR Code Not Appearing
1. Check if bot is running: `docker-compose ps`
2. View logs: `npm run docker:logs`
3. Restart container: `npm run docker:restart`

### Authentication Issues
1. Delete session: `rm -rf auth_info_baileys`
2. Restart bot
3. Scan new QR code

### Container Won't Start
1. Check port 3000 is available: `lsof -i :3000`
2. Rebuild image: `npm run docker:build`
3. Check logs for errors

## Development

### Adding New Flow Nodes

Edit `src/flow-engine.ts`:

```typescript
this.addNode({
  id: 'new_node',
  message: 'Your message here',
  type: 'poll',
  options: ['Option 1', 'Option 2'],
  next: {
    'option 1': 'next_node_id',
    'option 2': 'another_node_id'
  }
});
```

### Modifying Responses

All educational content is embedded in the flow engine. Edit the `initializeFlows()` method to update messages.

## Tech Stack

- **Node.js 20** - Runtime
- **TypeScript** - Type safety
- **Baileys** - WhatsApp Web API
- **Express** - Web server
- **Docker** - Containerization
- **Alpine Linux** - Minimal base image

## Security

- No database credentials (file-based storage)
- Session data not exposed via API
- Health check doesn't leak sensitive data
- Authentication handled by WhatsApp

## Performance

- Multi-stage Docker build (smaller image)
- Alpine Linux base (~150MB image)
- Efficient state management
- Auto-cleanup of expired sessions

## License

MIT

## Author

Modified for picky eater education flow - 2026

Original library: @bot-wa/bot-wa-baileys


# Jalankan via docker-compose (recommended)
docker compose up -d

# Atau langsung via docker run
docker run -d \
  -p 3000:3000 \
  -v ./auth_info_baileys:/app/auth_info_baileys \
  -v ./state:/app/state \
  --name whatsapp-chatbot \
  bot-wa-stunting:latest