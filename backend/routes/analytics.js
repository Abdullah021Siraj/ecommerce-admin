const express = require("express")
const db = require("../config/database")

const router = express.Router()

// GET /api/analytics/revenue - Get revenue analytics
router.get("/revenue", async (req, res) => {
  try {
    const { category, period = "daily", start_date, end_date } = req.query

    let dateFormat
    switch (period) {
      case "weekly":
        dateFormat = "YYYY-IW"
        break
      case "monthly":
        dateFormat = "YYYY-MM"
        break
      case "annually":
        dateFormat = "YYYY"
        break
      default:
        dateFormat = "YYYY-MM-DD"
    }

    let sql, params = [], paramIndex = 1

    if (category) {
      // When filtering by specific category, don't group by category
      sql = `
        SELECT 
          TO_CHAR(sale_date, '${dateFormat}') as period,
          COUNT(*) as orders,
          SUM(total_amount) as revenue,
          SUM(quantity) as products_sold,
          '${category}' as category
        FROM sales 
        WHERE category = $${paramIndex}
      `
      params.push(category)
      paramIndex++
    } else {
      // When not filtering by category, group by category
      sql = `
        SELECT 
          TO_CHAR(sale_date, '${dateFormat}') as period,
          COUNT(*) as orders,
          SUM(total_amount) as revenue,
          SUM(quantity) as products_sold,
          category
        FROM sales 
        WHERE 1=1
      `
    }

    if (start_date) {
      sql += ` AND sale_date >= $${paramIndex}`
      params.push(start_date)
      paramIndex++
    }

    if (end_date) {
      sql += ` AND sale_date <= $${paramIndex}`
      params.push(end_date)
      paramIndex++
    }

    // Add GROUP BY clause
    if (category) {
      sql += ` GROUP BY period ORDER BY period`
    } else {
      sql += ` GROUP BY period, category ORDER BY period, category`
    }

    const data = await db.all(sql, params)

    // Get totals with separate query
    let totalSql = `
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(quantity), 0) as total_products
      FROM sales 
      WHERE 1=1
    `

    const totalParams = []
    let totalParamIndex = 1

    if (category) {
      totalSql += ` AND category = $${totalParamIndex}`
      totalParams.push(category)
      totalParamIndex++
    }

    if (start_date) {
      totalSql += ` AND sale_date >= $${totalParamIndex}`
      totalParams.push(start_date)
      totalParamIndex++
    }

    if (end_date) {
      totalSql += ` AND sale_date <= $${totalParamIndex}`
      totalParams.push(end_date)
    }

    const totals = await db.get(totalSql, totalParams)

    res.json({
      data,
      totals: {
        total_orders: Number.parseInt(totals.total_orders) || 0,
        total_revenue: Number.parseFloat(totals.total_revenue) || 0,
        total_products: Number.parseInt(totals.total_products) || 0,
      },
      period,
      category: category || 'all',
    })
  } catch (error) {
    console.error("Error fetching revenue analytics:", error)
    res.status(500).json({ 
      error: "Failed to fetch revenue analytics",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// GET /api/analytics/top-products - Get top selling products
router.get("/top-products", async (req, res) => {
  try {
    const { limit = 10, period = "30" } = req.query

    const sql = `
      SELECT 
        p.id,
        p.name,
        p.category,
        COALESCE(SUM(s.quantity), 0) as units_sold,
        COALESCE(SUM(s.total_amount), 0) as revenue
      FROM products p
      LEFT JOIN sales s ON p.id = s.product_id
        AND s.sale_date >= CURRENT_DATE - INTERVAL '${Number.parseInt(period)} days'
      GROUP BY p.id, p.name, p.category
      HAVING COALESCE(SUM(s.quantity), 0) > 0
      ORDER BY revenue DESC
      LIMIT $1
    `

    const topProducts = await db.all(sql, [Number.parseInt(limit)])

    res.json(topProducts)
  } catch (error) {
    console.error("Error fetching top products:", error)
    res.status(500).json({ 
      error: "Failed to fetch top products",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// GET /api/analytics/category-breakdown - Get revenue by category
router.get("/category-breakdown", async (req, res) => {
  try {
    const { period = "30" } = req.query

    const sql = `
      SELECT 
        category,
        COALESCE(SUM(total_amount), 0) as revenue,
        COUNT(*) as orders,
        COALESCE(SUM(quantity), 0) as units_sold
      FROM sales
      WHERE sale_date >= CURRENT_DATE - INTERVAL '${Number.parseInt(period)} days'
      GROUP BY category
      ORDER BY revenue DESC
    `

    const breakdown = await db.all(sql)

    res.json(breakdown)
  } catch (error) {
    console.error("Error fetching category breakdown:", error)
    res.status(500).json({ 
      error: "Failed to fetch category breakdown",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// GET /api/analytics/dashboard-summary - Get dashboard summary stats
router.get("/dashboard-summary", async (req, res) => {
  try {
    const { period = "30" } = req.query

    // Get summary statistics
    const summaryQueries = [
      // Total revenue and orders
      `SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(quantity), 0) as total_products_sold
      FROM sales 
      WHERE sale_date >= CURRENT_DATE - INTERVAL '${Number.parseInt(period)} days'`,

      // Product counts by stock status
      `SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN stock = 0 THEN 1 END) as out_of_stock,
        COUNT(CASE WHEN stock > 0 AND stock <= 10 THEN 1 END) as low_stock,
        COUNT(CASE WHEN stock > 10 THEN 1 END) as in_stock
      FROM products`,

      // Recent sales trend (last 7 days)
      `SELECT 
        DATE(sale_date) as sale_day,
        COUNT(*) as daily_orders,
        SUM(total_amount) as daily_revenue
      FROM sales 
      WHERE sale_date >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(sale_date)
      ORDER BY sale_day DESC`
    ]

    const [salesSummary, productSummary, recentTrend] = await Promise.all([
      db.get(summaryQueries[0]),
      db.get(summaryQueries[1]),
      db.all(summaryQueries[2])
    ])

    res.json({
      sales: {
        total_orders: Number.parseInt(salesSummary.total_orders) || 0,
        total_revenue: Number.parseFloat(salesSummary.total_revenue) || 0,
        total_products_sold: Number.parseInt(salesSummary.total_products_sold) || 0,
        average_order_value: salesSummary.total_orders > 0 
          ? (Number.parseFloat(salesSummary.total_revenue) / Number.parseInt(salesSummary.total_orders)).toFixed(2)
          : '0.00'
      },
      products: {
        total_products: Number.parseInt(productSummary.total_products) || 0,
        out_of_stock: Number.parseInt(productSummary.out_of_stock) || 0,
        low_stock: Number.parseInt(productSummary.low_stock) || 0,
        in_stock: Number.parseInt(productSummary.in_stock) || 0
      },
      recent_trend: recentTrend.map(day => ({
        date: day.sale_day,
        orders: Number.parseInt(day.daily_orders),
        revenue: Number.parseFloat(day.daily_revenue)
      })),
      period: Number.parseInt(period)
    })
  } catch (error) {
    console.error("Error fetching dashboard summary:", error)
    res.status(500).json({ 
      error: "Failed to fetch dashboard summary",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

module.exports = router
