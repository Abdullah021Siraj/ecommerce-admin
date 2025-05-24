const { Pool } = require("pg")
require("dotenv").config()

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is required")
  process.exit(1)
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10, // Reduced pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased timeout
  acquireTimeoutMillis: 10000,
  createTimeoutMillis: 10000,
  destroyTimeoutMillis: 5000,
  reapIntervalMillis: 1000,
  createRetryIntervalMillis: 200,
})

class Database {
  async init() {
    try {
      console.log("🔄 Connecting to PostgreSQL...")

      // Test connection with retry logic
      let retries = 3
      let connected = false

      while (retries > 0 && !connected) {
        try {
          const client = await pool.connect()
          const result = await client.query("SELECT NOW() as time")
          client.release()

          console.log("✅ Database connected successfully")
          console.log(`📅 Database time: ${result.rows[0].time}`)
          connected = true
        } catch (err) {
          retries--
          console.log(`⚠️  Connection attempt failed, ${retries} retries left...`)
          if (retries === 0) throw err
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      }

      await this.createTables()
      return true
    } catch (err) {
      console.error("❌ Database connection failed:", err.message)
      throw err
    }
  }

  async createTables() {
    const tables = [
      // Products table
      `CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
        stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
        image_url VARCHAR(500),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )`,

      // Sales table
      `CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
        total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
        category VARCHAR(100) NOT NULL,
        sale_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )`,

      // Inventory movements table
      `CREATE TABLE IF NOT EXISTS inventory_movements (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
        quantity INTEGER NOT NULL CHECK (quantity != 0),
        reason VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )`,
    ]

    // Create indexes separately to avoid slow query warnings
    const indexes = [
      `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`,
      `CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock)`,
      `CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date)`,
      `CREATE INDEX IF NOT EXISTS idx_sales_product ON sales(product_id)`,
      `CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory_movements(product_id)`,
    ]

    // Create tables first
    for (const query of tables) {
      try {
        await this.query(query)
      } catch (err) {
        console.error("Error creating table:", err.message)
        throw err
      }
    }

    // Create indexes (these might be slow on first run)
    for (const query of indexes) {
      try {
        await this.query(query)
      } catch (err) {
        console.warn("Warning creating index:", err.message)
        // Don't throw on index creation failures
      }
    }

    console.log("✅ Database tables ready")
  }

  async query(text, params = []) {
    const start = Date.now()
    try {
      const result = await pool.query(text, params)
      const duration = Date.now() - start

      // Only log slow queries in development and if they're really slow
      if (process.env.NODE_ENV === "development" && duration > 500) {
        console.log(`⚠️  Slow query (${duration}ms):`, text.substring(0, 50) + "...")
      }

      return result
    } catch (err) {
      console.error("Database query error:", err.message)
      console.error("Query:", text.substring(0, 100))
      throw err
    }
  }

  async get(text, params = []) {
    const result = await this.query(text, params)
    return result.rows[0] || null
  }

  async all(text, params = []) {
    const result = await this.query(text, params)
    return result.rows
  }

  async close() {
    await pool.end()
    console.log("📦 Database connection pool closed")
  }
}

module.exports = new Database()
