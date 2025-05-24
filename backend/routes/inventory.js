const express = require("express")
const db = require("../config/database")

const router = express.Router()

// GET /api/inventory/alerts - Get low stock alerts
router.get("/alerts", async (req, res) => {
  try {
    const lowStockSql = `
      SELECT *, 'low_stock' as alert_type
      FROM products
      WHERE stock > 0 AND stock <= 10
      ORDER BY stock ASC
    `

    const outOfStockSql = `
      SELECT *, 'out_of_stock' as alert_type
      FROM products
      WHERE stock = 0
      ORDER BY name
    `

    const [lowStock, outOfStock] = await Promise.all([
      db.all(lowStockSql),
      db.all(outOfStockSql)
    ])

    res.json({
      low_stock: lowStock,
      out_of_stock: outOfStock,
      total_alerts: lowStock.length + outOfStock.length,
    })
  } catch (error) {
    console.error("Error fetching inventory alerts:", error)
    res.status(500).json({ error: "Failed to fetch inventory alerts" })
  }
})

// POST /api/inventory/movement - Record inventory movement
router.post("/movement", async (req, res) => {
  try {
    const { product_id, movement_type, quantity, reason } = req.body

    if (!product_id || !movement_type || !quantity) {
      return res.status(400).json({ error: "Product ID, movement type, and quantity are required" })
    }

    if (!["in", "out", "adjustment"].includes(movement_type)) {
      return res.status(400).json({ error: "Invalid movement type" })
    }

    // Record the movement
    await db.query(
      "INSERT INTO inventory_movements (product_id, movement_type, quantity, reason) VALUES ($1, $2, $3, $4)",
      [product_id, movement_type, parseInt(quantity), reason]
    )

    // Update product stock
    const stockChange = movement_type === "in" ? parseInt(quantity) : -parseInt(quantity)
    const result = await db.query(
      "UPDATE products SET stock = GREATEST(0, stock + $1), updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [stockChange, product_id]
    )

    const updatedProduct = result.rows[0]

    // Emit real-time update
    const io = req.app.get("io")
    if (io) {
      io.emit("inventory_updated", updatedProduct)
    }

    res.json({ message: "Inventory movement recorded successfully", product: updatedProduct })
  } catch (error) {
    console.error("Error recording inventory movement:", error)
    res.status(500).json({ error: "Failed to record inventory movement" })
  }
})

// PUT /api/inventory/stock/:id - Update product stock
router.put("/stock/:id", async (req, res) => {
  try {
    const { stock } = req.body
    const productId = req.params.id

    if (stock < 0) {
      return res.status(400).json({ error: "Stock cannot be negative" })
    }

    // Get current stock for movement tracking
    const currentProduct = await db.get("SELECT stock FROM products WHERE id = $1", [productId])
    if (!currentProduct) {
      return res.status(404).json({ error: "Product not found" })
    }

    // Update stock
    const result = await db.query(
      "UPDATE products SET stock = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [parseInt(stock), productId]
    )

    const updatedProduct = result.rows[0]

    // Record movement
    const difference = parseInt(stock) - currentProduct.stock
    if (difference !== 0) {
      await db.query(
        "INSERT INTO inventory_movements (product_id, movement_type, quantity, reason) VALUES ($1, $2, $3, $4)",
        [productId, difference > 0 ? "in" : "out", Math.abs(difference), "Manual adjustment"]
      )
    }

    // Emit real-time update
    const io = req.app.get("io")
    if (io) {
      io.emit("inventory_updated", updatedProduct)
    }

    res.json(updatedProduct)
  } catch (error) {
    console.error("Error updating stock:", error)
    res.status(500).json({ error: "Failed to update stock" })
  }
})

module.exports = router
