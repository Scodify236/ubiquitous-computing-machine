import type { Express } from "express";
import { createServer, type Server } from "http";
import axios from "axios";
import fs from "fs";
import path from "path";
import { storage } from "./storage";
import { log } from "./vite";

// Import constants from a server module to keep it consistent with client
const BASE_URL = "https://backendmix.vercel.app";

export async function registerRoutes(app: Express): Promise<Server> {
  // Handle the create.html route
  app.get('/create.html', (req, res) => {
    try {
      const createHtmlPath = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "public",
        "create.html"
      );

      if (fs.existsSync(createHtmlPath)) {
        const content = fs.readFileSync(createHtmlPath, 'utf-8');
        res.status(200).set({ "Content-Type": "text/html" }).end(content);
      } else {
        log("create.html not found at " + createHtmlPath);
        res.status(404).send("Page not found");
      }
    } catch (e) {
      log(`Error serving create.html: ${e}`);
      res.status(500).send("Server error");
    }
  });
  // Proxy API endpoints to the podcast service
  
  // Search podcasts
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q;
      if (!query) {
        return res.status(400).json({ message: "Missing query parameter" });
      }
      
      const response = await axios.get(`${BASE_URL}/search?q=${query}`);
      res.json(response.data);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Failed to search podcasts" });
    }
  });

  // Get audio stream
  app.get("/api/streams/:videoId", async (req, res) => {
    try {
      const { videoId } = req.params;
      const response = await axios.get(`${BASE_URL}/streams/${videoId}`);
      res.json(response.data);
    } catch (error) {
      console.error("Streams error:", error);
      res.status(500).json({ message: "Failed to fetch audio stream" });
    }
  });

  // Get channel information
  app.get("/api/channel/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const response = await axios.get(`${BASE_URL}/channel/${id}`);
      res.json(response.data);
    } catch (error) {
      console.error("Channel error:", error);
      res.status(500).json({ message: "Failed to fetch channel information" });
    }
  });

  // Get more channel episodes
  app.get("/api/nextpage/channel/:channelId", async (req, res) => {
    try {
      const { channelId } = req.params;
      const nextpage = req.query.nextpage;
      
      if (!nextpage) {
        return res.status(400).json({ message: "Missing nextpage parameter" });
      }
      
      const response = await axios.get(`${BASE_URL}/nextpage/channel/${channelId}?nextpage=${nextpage}`);
      res.json(response.data);
    } catch (error) {
      console.error("Next page error:", error);
      res.status(500).json({ message: "Failed to fetch more episodes" });
    }
  });

  // Get featured podcasts
  app.get("/api/featured", async (req, res) => {
    try {
      const response = await axios.get(`${BASE_URL}/featured`);
      res.json(response.data);
    } catch (error) {
      console.error("Featured error:", error);
      res.status(500).json({ message: "Failed to fetch featured podcasts" });
    }
  });

  // Get newest podcasts
  app.get("/api/newest", async (req, res) => {
    try {
      const response = await axios.get(`${BASE_URL}/newest`);
      res.json(response.data);
    } catch (error) {
      console.error("Newest error:", error);
      res.status(500).json({ message: "Failed to fetch newest podcasts" });
    }
  });

  // Health check
  app.get("/api/health", async (req, res) => {
    try {
      const response = await axios.get(`${BASE_URL}/health`);
      res.json(response.data);
    } catch (error) {
      console.error("Health check error:", error);
      res.status(500).json({ message: "API health check failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
