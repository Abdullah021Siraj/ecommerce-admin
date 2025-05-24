const express = require("express")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const db = require("../config/database")

const router = express.Router()

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "uploads", "products")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, "product-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"))
    }
  },
})

// GET /api/products - Get all products with filtering and pagination
router.get("/", async (req, res) => {
  try {
    const { 
      category, 
      search, 
      stock_status, 
      sort_by = "name", 
      sort_order = "ASC", 
      page = 1, 
      limit = 50 
    } = req.query

    let sql = "SELECT * FROM products WHERE 1=1"
    const params = []
    let paramIndex = 1

    // Apply filters
    if (category) {
      sql += ` AND category = $${paramIndex}`
      params.push(category)
      paramIndex++
    }

    if (search) {
      sql += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    if (stock_status) {
      switch (stock_status) {
        case "low":
          sql += " AND stock > 0 AND stock <= 10"
          break
        case "out":
          sql += " AND stock = 0"
          break
        case "in":
          sql += " AND stock > 10"
          break
      }
    }

    // Apply sorting
    const allowedSortFields = ["name", "price", "stock", "created_at", "category"]
    const sortField = allowedSortFields.includes(sort_by) ? sort_by : "name"
    const sortDirection = sort_order.toUpperCase() === "DESC" ? "DESC" : "ASC"
    sql += ` ORDER BY ${sortField} ${sortDirection}`

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit)
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(parseInt(limit), offset)

    const products = await db.all(sql, params)

    // Get total count for pagination
    let countSql = "SELECT COUNT(*) as total FROM products WHERE 1=1"
    const countParams = []
    let countParamIndex = 1

    if (category) {
      countSql += ` AND category = $${countParamIndex}`
      countParams.push(category)
      countParamIndex++
    }
    if (search) {
      countSql += ` AND (name ILIKE $${countParamIndex} OR description ILIKE $${countParamIndex})`
      countParams.push(`%${search}%`)
    }

    const totalResult = await db.get(countSql, countParams)
    const total = parseInt(totalResult.total)

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    res.status(500).json({ error: "Failed to fetch products" })
  }
})

// GET /api/products/:id - Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await db.get("SELECT * FROM products WHERE id = $1", [req.params.id])

    if (!product) {
      return res.status(404).json({ error: "Product not found" })
    }

    res.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    res.status(500).json({ error: "Failed to fetch product" })
  }
})

// POST /api/products - Create new product
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, description, category, price, stock } = req.body

    // Validation
    if (!name || !category || !price) {
      return res.status(400).json({ error: "Name, category, and price are required" })
    }

    const image_url = req.file ? `/uploads/products/${req.file.filename}` : null

    const result = await db.query(
      "INSERT INTO products (name, description, category, price, stock, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [name, description, category, parseFloat(price), parseInt(stock) || 0, image_url]
    )

    const newProduct = result.rows[0]

    // Emit real-time update
    const io = req.app.get("io")
    if (io) {
      io.emit("product_created", newProduct)
    }

    res.status(201).json(newProduct)
  } catch (error) {
    console.error("Error creating product:", error)
    res.status(500).json({ error: "Failed to create product" })
  }
})

// PUT /api/products/:id - Update product
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, description, category, price, stock } = req.body
    const productId = req.params.id

    // Check if product exists
    const existingProduct = await db.get("SELECT * FROM products WHERE id = $1", [productId])
    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" })
    }

    let image_url = existingProduct.image_url
    if (req.file) {
      image_url = `/uploads/products/${req.file.filename}`

      // Delete old image if it exists
      if (existingProduct.image_url) {
        const oldImagePath = path.join(__dirname, "..", existingProduct.image_url)
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath)
        }
      }
    }

    const result = await db.query(
      "UPDATE products SET name = $1, description = $2, category = $3, price = $4, stock = $5, image_url = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *",
      [name, description, category, parseFloat(price), parseInt(stock), image_url, productId]
    )

    const updatedProduct = result.rows[0]

    // Emit real-time update
    const io = req.app.get("io")
    if (io) {
      io.emit("product_updated", updatedProduct)
    }

    res.json(updatedProduct)
  } catch (error) {
    console.error("Error updating product:", error)
    res.status(500).json({ error: "Failed to update product" })
  }
})

// DELETE /api/products/:id - Delete product
router.delete("/:id", async (req, res) => {
  try {
    const productId = req.params.id

    const product = await db.get("SELECT * FROM products WHERE id = $1", [productId])
    if (!product) {
      return res.status(404).json({ error: "Product not found" })
    }

    // Delete image file if it exists
    if (product.image_url) {
      const imagePath = path.join(__dirname, "..", product.image_url)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    }

    await db.query("DELETE FROM products WHERE id = $1", [productId])

    // Emit real-time update
    const io = req.app.get("io")
    if (io) {
      io.emit("product_deleted", { id: productId })
    }

    res.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    res.status(500).json({ error: "Failed to delete product" })
  }
})

// GET /api/products/categories/list - Get all categories
router.get("/categories/list", async (req, res) => {
  try {
    const categories = await db.all("SELECT DISTINCT category FROM products ORDER BY category")
    res.json(categories.map((row) => row.category))
  } catch (error) {
    console.error("Error fetching categories:", error)
    res.status(500).json({ error: "Failed to fetch categories" })
  }
})

module.exports = router
