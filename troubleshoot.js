// Troubleshooting script to check both frontend and backend
const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("🔍 E-commerce Admin Troubleshooting")
console.log("===================================")

// Check current directory
console.log("📁 Current directory:", process.cwd())

// Check if we're in the right place
const rootFiles = ["package.json", "vite.config.js", "index.html"]
const backendFiles = ["backend/package.json", "backend/server.js"]

console.log("\n📋 File structure check:")
rootFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`)
  } else {
    console.log(`❌ ${file} missing`)
  }
})

backendFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`)
  } else {
    console.log(`❌ ${file} missing`)
  }
})

// Check if node_modules exist
console.log("\n📦 Dependencies check:")
if (fs.existsSync("node_modules")) {
  console.log("✅ Root node_modules exists")
} else {
  console.log("❌ Root node_modules missing - run: npm install")
}

if (fs.existsSync("backend/node_modules")) {
  console.log("✅ Backend node_modules exists")
} else {
  console.log("❌ Backend node_modules missing - run: cd backend && npm install")
}

// Check package.json scripts
console.log("\n📜 Package.json scripts:")
try {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"))
  console.log("Root scripts:", Object.keys(pkg.scripts || {}))
} catch (e) {
  console.log("❌ Cannot read root package.json")
}

try {
  const backendPkg = JSON.parse(fs.readFileSync("backend/package.json", "utf8"))
  console.log("Backend scripts:", Object.keys(backendPkg.scripts || {}))
} catch (e) {
  console.log("❌ Cannot read backend package.json")
}

console.log("\n🔧 Next steps:")
console.log("1. Make sure you are in the root directory: ~/Work/ecommerce-admin")
console.log("2. Install root dependencies: npm install")
console.log("3. Install backend dependencies: cd backend && npm install")
console.log("4. Start backend: cd backend && npm run dev")
console.log("5. Start frontend: npm run dev (from root)")
