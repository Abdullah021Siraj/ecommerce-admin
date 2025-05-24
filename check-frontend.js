const fs = require("fs")
const path = require("path")

console.log("🔍 Frontend Troubleshooting")
console.log("===========================")

// Check current directory
console.log("📁 Current directory:", process.cwd())

// Check if package.json exists and is correct
if (fs.existsSync("package.json")) {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"))
  console.log("✅ package.json found")
  console.log("📦 Project name:", pkg.name)
  console.log("🔧 Scripts available:", Object.keys(pkg.scripts || {}))

  if (pkg.scripts && pkg.scripts.dev) {
    console.log("✅ 'dev' script found:", pkg.scripts.dev)
  } else {
    console.log("❌ 'dev' script missing")
  }

  if (pkg.devDependencies && pkg.devDependencies.vite) {
    console.log("✅ Vite found in devDependencies")
  } else {
    console.log("❌ Vite missing from devDependencies")
  }
} else {
  console.log("❌ package.json not found")
}

// Check if node_modules exists
if (fs.existsSync("node_modules")) {
  console.log("✅ node_modules directory exists")

  // Check if vite is installed
  if (fs.existsSync("node_modules/.bin/vite")) {
    console.log("✅ Vite binary found")
  } else {
    console.log("❌ Vite binary missing")
  }
} else {
  console.log("❌ node_modules directory missing")
  console.log("💡 Run: npm install")
}

// Check key files
const requiredFiles = ["index.html", "vite.config.js", "src/main.js", "src/App.vue"]

console.log("\n📋 Required files check:")
requiredFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} missing`)
  }
})

console.log("\n🔧 Next steps:")
console.log("1. Make sure you're in the ROOT directory (not backend/)")
console.log("2. Run: npm install")
console.log("3. Run: npm run dev")
