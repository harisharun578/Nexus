require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const httpServer = createServer(app);

// Socket setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
});

// --------------------
// Middleware
// --------------------
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("dev"));

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Attach socket to request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// --------------------
// ROOT ROUTE (Important Fix)
// --------------------
app.get("/", (req, res) => {
  res.send("🚀 Nexus AI Workplace Backend Running");
});

// --------------------
// API Routes
// --------------------
app.use("/api/auth", require("./routes/auth"));
app.use("/api/hr", require("./routes/hr"));
app.use("/api/tickets", require("./routes/tickets"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/employees", require("./routes/employees"));
app.use("/api/announcements", require("./routes/announcements"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/emergency", require("./routes/emergency"));

// --------------------
// Health Check
// --------------------
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    time: new Date(),
    version: "2.0.0",
  });
});

// --------------------
// 404 Handler
// --------------------
app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.path} not found`,
  });
});

// --------------------
// Error Handler
// --------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

// --------------------
// WebSocket
// --------------------
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("join-room", (userId) => {
    socket.join(`user-${userId}`);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// --------------------
// Database + Server Start
// --------------------
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/nexus-ai")
  .then(() => {
    console.log("✅ MongoDB connected");

    httpServer.listen(PORT, () => {
      console.log(`🚀 NEXUS AI Backend running on http://localhost:${PORT}`);
      console.log(`📡 WebSocket ready`);
      console.log(`🗄️ Database: nexus-ai`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);

    console.log("Starting without database (demo mode)...");

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running (demo mode) on port ${PORT}`);
    });
  });