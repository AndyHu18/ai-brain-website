const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const root = "C:/Users/user/Desktop/ai-brain-website";
const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || "AIzaSyAmZPdL23vXV9TBTlCGJZAuea8Dlb0hw8w";
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "application/javascript",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".json": "application/json",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

/**
 * Proxy /api/chat to Gemini API (local dev only)
 */
const handleApiChat = (req, res) => {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    const urlObj = new URL(geminiUrl);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    };
    const proxyReq = https.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      proxyRes.pipe(res);
    });
    proxyReq.on("error", (err) => {
      res.writeHead(502, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      res.end(JSON.stringify({ error: err.message }));
    });
    proxyReq.write(body);
    proxyReq.end();
  });
};

http
  .createServer((req, res) => {
    // CORS preflight
    if (req.method === "OPTIONS") {
      res.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      return res.end();
    }

    // API proxy for local dev
    const urlPath = decodeURIComponent(req.url.split("?")[0]);
    if (urlPath === "/api/chat" && req.method === "POST") {
      return handleApiChat(req, res);
    }

    let u = urlPath;
    if (u === "/") u = "/index.html";
    const fp = path.join(root, u);
    fs.stat(fp, (statErr, stats) => {
      if (statErr) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      const ct = mime[path.extname(fp)] || "application/octet-stream";
      const total = stats.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : total - 1;
        res.writeHead(206, {
          "Content-Range": "bytes " + start + "-" + end + "/" + total,
          "Accept-Ranges": "bytes",
          "Content-Length": end - start + 1,
          "Content-Type": ct,
          "Access-Control-Allow-Origin": "*",
        });
        fs.createReadStream(fp, { start, end }).pipe(res);
      } else {
        res.writeHead(200, {
          "Content-Type": ct,
          "Content-Length": total,
          "Accept-Ranges": "bytes",
          "Access-Control-Allow-Origin": "*",
        });
        fs.createReadStream(fp).pipe(res);
      }
    });
  })
  .listen(3103, () =>
    console.log("Server on 3103 with Range support + /api/chat proxy"),
  );
