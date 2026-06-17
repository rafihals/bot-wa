import express, { Request, Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, '..', 'public')));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// QR code display endpoint
app.get('/qr', (req: Request, res: Response) => {
  const qrPath = join(__dirname, '..', 'public', 'index.html');
  
  if (existsSync(qrPath)) {
    res.sendFile(qrPath);
  } else {
    res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>WhatsApp Bot</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 20px;
          }
          .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
          }
          h1 { margin: 0 0 20px 0; }
          p { margin: 10px 0; opacity: 0.9; }
          .status { 
            display: inline-block;
            padding: 8px 16px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            margin-top: 20px;
          }
        </style>
        <script>
          setTimeout(() => window.location.reload(), 5000);
        </script>
      </head>
      <body>
        <div class="container">
          <h1>🤖 WhatsApp Chatbot</h1>
          <p>Bot is starting up...</p>
          <p>QR code will appear here once the bot is ready.</p>
          <div class="status">⏳ Initializing</div>
        </div>
      </body>
      </html>
    `);
  }
});

// Status endpoint
app.get('/status', (req: Request, res: Response) => {
  const sessionPath = join(__dirname, '..', 'state', 'user_sessions.json');
  const authPath = join(__dirname, '..', 'auth_info_baileys');
  
  res.json({
    botStatus: 'running',
    authenticated: existsSync(authPath),
    sessionsStored: existsSync(sessionPath),
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.redirect('/qr');
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌐 Server running on http://localhost:${PORT}`);
  console.log(`📱 QR Code: http://localhost:${PORT}/qr`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log(`📊 Status: http://localhost:${PORT}/status`);
});

export default app;
