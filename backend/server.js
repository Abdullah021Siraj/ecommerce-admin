const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const rateLimit = require("express-rate-limit")
const { createServer } = require("http")
const { Server } = require("socket.io")
const path = require("path")
require('dotenv').config({ path: '../.env' });

const db = require("./config/database")
const productRoutes = require("./routes/products")
const salesRoutes = require("./routes/sales")
const inventoryRoutes = require("./routes/inventory")
const analyticsRoutes = require("./routes/analytics")

const app = express()
const server = createServer(app)

const PORT = process.env.PORT || 3001
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173"

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
})

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for development
  message: "Too many requests from this IP"
})

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.use(morgan("dev"))
app.use(limiter)

// CORS configuration
app.use(cors({
  origin: [FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Static files for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`)

  socket.on("disconnect", () => {
    console.log(`🔌 Client disconnected: ${socket.id}`)
  })

  socket.on("error", (error) => {
    console.error("Socket error:", error)
  })
})

// Make io available to routes
app.set("io", io)

// API Routes
app.use("/api/products", productRoutes)
app.use("/api/sales", salesRoutes)
app.use("/api/inventory", inventoryRoutes)
app.use("/api/analytics", analyticsRoutes)

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    const dbResult = await db.query("SELECT NOW() as current_time")
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: "PostgreSQL (Neon)",
      port: PORT,
      frontend_url: FRONTEND_URL,
      db_time: dbResult.rows[0].current_time
    })
  } catch (err) {
    console.error("Health check failed:", err)
    res.status(500).json({
      status: "ERROR",
      message: "Database connection failed",
      error: err.message,
      port: PORT
    })
  }
})

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "E-commerce Admin API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      products: "/api/products",
      sales: "/api/sales",
      inventory: "/api/inventory",
      analytics: "/api/analytics"
    }
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack)
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ 
    error: "Route not found",
    path: req.originalUrl,
    method: req.method
  })
})

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("🛑 SIGTERM received, shutting down gracefully")
  server.close(() => {
    console.log("🛑 HTTP server closed")
    db.close().then(() => {
      console.log("🛑 Database connection closed")
      process.exit(0)
    })
  })
})

// Initialize database and start server
async function startServer() {
  try {
    console.log("🔄 Initializing database...")
    await db.init()
    
    server.listen(PORT, () => {
      console.log("🚀 E-commerce Admin Backend Started!")
      console.log("=====================================")
      console.log(`📡 Server running on: http://localhost:${PORT}`)
      console.log(`🌐 Frontend URL: ${FRONTEND_URL}`)
      console.log(`📊 API Health: http://localhost:${PORT}/api/health`)
      console.log(`📋 API Docs: http://localhost:${PORT}/`)
      console.log("=====================================")
    })
  } catch (err) {
    console.error("❌ Failed to start server:", err)
    process.exit(1)
  }
}

startServer()

module.exports = { app, io }
