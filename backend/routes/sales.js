const express = require("express")
const db = require("../config/database")

const router = express.Router()

// GET /api/sales - Get sales data
router.get("/", async (req, res) => {
  try {
    const { start_date, end_date, category, product_id, page = 1, limit = 50 } = req.query

    let sql = `
      SELECT s.*, p.name as product_name, p.category
      FROM sales s
      JOIN products p ON s.product_id = p.id
      WHERE 1=1
    `
    const params = []
    let paramIndex = 1

    if (start_date) {
      sql += ` AND s.sale_date >= $${paramIndex}`
      params.push(start_date)
      paramIndex++
    }

    if (end_date) {
      sql += ` AND s.sale_date <= $${paramIndex}`
      params.push(end_date)
      paramIndex++
    }

    if (category) {
      sql += ` AND s.category = $${paramIndex}`
      params.push(category)
      paramIndex++
    }

    if (product_id) {
      sql += ` AND s.product_id = $${paramIndex}`
      params.push(product_id)
      paramIndex++
    }

    sql += " ORDER BY s.sale_date DESC"

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit)
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(parseInt(limit), offset)

    const sales = await db.all(sql, params)

    // Get total count
    let countSql = "SELECT COUNT(*) as total FROM sales s WHERE 1=1"
    const countParams = []
    let countParamIndex = 1

    if (start_date) {
      countSql += ` AND s.sale_date >= $${countParamIndex}`
      countParams.push(start_date)
      countParamIndex++
    }
    if (end_date) {
      countSql += ` AND s.sale_date <= $${countParamIndex}`
      countParams.push(end_date)
      countParamIndex++
    }
    if (category) {
      countSql += ` AND s.category = $${countParamIndex}`
      countParams.push(category)
      countParamIndex++
    }

    const totalResult = await db.get(countSql, countParams)
    const total = parseInt(totalResult.total)

    res.json({
      sales,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    })
  } catch (error) {
    console.error("Error fetching sales:", error)
    res.status(500).json({ error: "Failed to fetch sales" })
  }
})

// POST /api/sales - Create new sale
router.post("/", async (req, res) => {
  try {
    const { product_id, quantity, unit_price } = req.body

    if (!product_id || !quantity || !unit_price) {
      return res.status(400).json({ error: "Product ID, quantity, and unit price are required" })
    }

    // Get product details
    const product = await db.get("SELECT * FROM products WHERE id = $1", [product_id])
    if (!product) {
      return res.status(404).json({ error: "Product not found" })
    }

    // Check stock availability
    if (product.stock < parseInt(quantity)) {
      return res.status(400).json({ error: "Insufficient stock" })
    }

    const total_amount = parseInt(quantity) * parseFloat(unit_price)

    // Create sale record
    const saleResult = await db.query(
      "INSERT INTO sales (product_id, quantity, unit_price, total_amount, category) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [product_id, parseInt(quantity), parseFloat(unit_price), total_amount, product.category]
    )

    // Update product stock
    await db.query("UPDATE products SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [
      parseInt(quantity),
      product_id,
    ])

    // Record inventory movement
    await db.query(
      "INSERT INTO inventory_movements (product_id, movement_type, quantity, reason) VALUES ($1, $2, $3, $4)",
      [product_id, "out", parseInt(quantity), "Sale"]
    )

    const newSale = saleResult.rows[0]

    // Emit real-time update
    const io = req.app.get("io")
    if (io) {
      io.emit("sale_created", newSale)
    }

    res.status(201).json(newSale)
  } catch (error) {
    console.error("Error creating sale:", error)
    res.status(500).json({ error: "Failed to create sale" })
  }
})

module.exports = router
