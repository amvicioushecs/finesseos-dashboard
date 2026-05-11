import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { validateConfig } from "./providers/config";
import { dataProvider } from "./providers";

// Validate environment variables on startup
validateConfig();

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function createApp() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // ── Tracked affiliate link redirect ──────────────────────────────────────────
  // Public endpoint: GET /go/:trackingId
  // Increments click counter and redirects to the affiliate destination URL
  app.get('/go/:trackingId', async (req, res) => {
    try {
      const node = await dataProvider.getNodeByTrackingId(req.params.trackingId);
      if (!node) {
        res.status(404).send('Link not found');
        return;
      }
      
      // Fire-and-forget click increment and action logging
      (async () => {
        await dataProvider.incrementNodeClickCount(node.id);
        await dataProvider.createAction(node.userId, {
          type: 'click_detected',
          title: 'Link Clicked',
          message: `Inbound click detected for ${node.brandName} via ${node.platform}`,
          metadataJson: { nodeId: node.id, trackingId: node.trackingId }
        });
      })().catch(err => console.error('[ClickTrack] Failed to track:', err));

      res.redirect(302, node.destination);
    } catch (err) {
      console.error('[ClickTrack] Error:', err);
      res.status(500).send('Internal error');
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  
  return { app, server };
}

async function startServer() {
  const { app, server } = await createApp();
  
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

// Only start the server if this file is run directly (not as a module)
if (process.env.NODE_ENV !== "test" && import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch(console.error);
}

export { createApp };
