const db = require("../config/database")

// const sampleProducts = [
//   {
//     name: "Apple iPhone 15 Pro 128GB",
//     description: "Latest iPhone with A17 Pro chip, titanium design, and advanced camera system with 5x telephoto zoom",
//     category: "Electronics",
//     price: 999.99,
//     stock: 25,
//   },
//   {
//     name: 'Samsung 65" QLED 4K Smart TV',
//     description: "Quantum Dot technology, HDR10+, built-in Alexa, and premium smart TV features",
//     category: "Electronics",
//     price: 1299.99,
//     stock: 8,
//   },
//   {
//     name: "Nike Air Max 270 Running Shoes",
//     description: "Max Air unit in heel, breathable mesh upper, comfortable for all-day wear",
//     category: "Clothing & Accessories",
//     price: 129.99,
//     stock: 45,
//   },
//   {
//     name: "KitchenAid Artisan Stand Mixer",
//     description: "Professional 5-quart tilt-head stand mixer with 10 speeds and multiple attachments",
//     category: "Home & Garden",
//     price: 349.99,
//     stock: 12,
//   },
//   {
//     name: "Sony PlayStation 5 Console",
//     description: "Next-gen gaming with ultra-fast SSD, ray tracing, and 4K gaming capabilities",
//     category: "Electronics",
//     price: 499.99,
//     stock: 3,
//   },
//   {
//     name: "Levi's 501 Original Fit Jeans",
//     description: "Classic straight-leg jeans in authentic indigo wash, 100% cotton denim",
//     category: "Clothing & Accessories",
//     price: 69.99,
//     stock: 0,
//   },
//   {
//     name: "Dyson V15 Detect Cordless Vacuum",
//     description: "Laser dust detection, powerful suction, and intelligent cleaning modes",
//     category: "Home & Garden",
//     price: 649.99,
//     stock: 15,
//   },
//   {
//     name: "Wilson Pro Staff Tennis Racket",
//     description: "Professional tennis racket used by top players, perfect weight and balance",
//     category: "Sports & Outdoors",
//     price: 189.99,
//     stock: 22,
//   },
//   {
//     name: "Amazon Echo Dot (5th Gen)",
//     description: "Smart speaker with Alexa, improved sound quality, and smart home control",
//     category: "Electronics",
//     price: 49.99,
//     stock: 67,
//   },
//   {
//     name: "Instant Pot Duo 7-in-1 Pressure Cooker",
//     description: "Multi-use programmable pressure cooker, slow cooker, rice cooker, and more",
//     category: "Home & Garden",
//     price: 79.99,
//     stock: 34,
//   },
// ]

async function seedDatabase() {
  try {
    console.log("🌱 Seeding database...")

    // Check if data already exists
    const existingProducts = await db.get("SELECT COUNT(*) as count FROM products")
    if (existingProducts && Number.parseInt(existingProducts.count) > 0) {
      console.log("📦 Database already has data, skipping seed...")
      return
    }

    // Insert products
    console.log("📦 Inserting products...")
    for (const product of sampleProducts) {
      await db.query("INSERT INTO products (name, description, category, price, stock) VALUES ($1, $2, $3, $4, $5)", [
        product.name,
        product.description,
        product.category,
        product.price,
        product.stock,
      ])
    }

    console.log(`✅ Inserted ${sampleProducts.length} products`)

    // Generate sample sales data
    console.log("💰 Generating sales data...")
    const products = await db.all("SELECT * FROM products")
    const salesData = []

    for (let i = 0; i < 100; i++) {
      const product = products[Math.floor(Math.random() * products.length)]
      const quantity = Math.floor(Math.random() * 5) + 1
      const saleDate = new Date()
      saleDate.setDate(saleDate.getDate() - Math.floor(Math.random() * 30))

      salesData.push({
        product_id: product.id,
        quantity,
        unit_price: product.price,
        total_amount: quantity * product.price,
        category: product.category,
        sale_date: saleDate.toISOString(),
      })
    }

    for (const sale of salesData) {
      await db.query(
        "INSERT INTO sales (product_id, quantity, unit_price, total_amount, category, sale_date) VALUES ($1, $2, $3, $4, $5, $6)",
        [sale.product_id, sale.quantity, sale.unit_price, sale.total_amount, sale.category, sale.sale_date],
      )
    }

    console.log(`✅ Generated ${salesData.length} sales records`)
    console.log("🎉 Database seeded successfully!")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    throw error
  }
}

// Initialize database and seed
async function main() {
  try {
    await db.init()
    await seedDatabase()
    await db.close()
    console.log("✅ Seeding completed successfully!")
  } catch (error) {
    console.error("❌ Seeding failed:", error)
    process.exit(1)
  }
}

main()
