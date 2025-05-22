import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import axios from "axios";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson: any, ...args: any[]) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = process.env.PORT || 5000;
  const host = process.env.HOST || 'localhost';

  server.listen(port, host, () => {
    log(`Server running at http://${host}:${port}`);
    
    // Initialize pinging mechanism
    const pingInterval = setInterval(async () => {
      try {
        const startTime = Date.now();
        const response = await axios.get("https://aabcd.com", {
          timeout: 5000,
          headers: {
            'User-Agent': 'PodcastPulse-Server/1.0'
          }
        });
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        log(`Pinged aabcd.com successfully - Status: ${response.status}, Duration: ${duration}ms`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        log(`Failed to ping aabcd.com: ${errorMessage}`);
      }
    }, 30000);

    // Cleanup on server shutdown
    process.on('SIGTERM', () => {
      clearInterval(pingInterval);
      log('Pinging mechanism stopped');
      process.exit(0);
    });
  });
})();
