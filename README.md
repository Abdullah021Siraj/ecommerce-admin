# E-commerce Admin Dashboard

A comprehensive, full-stack e-commerce administration platform built with Vue.js and Node.js. This dashboard provides real-time inventory management, sales analytics, and product registration capabilities for modern e-commerce businesses.

![E-commerce Admin Dashboard](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge\&logo=vue.js\&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge\&logo=node.js\&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge\&logo=postgresql\&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge\&logo=tailwind-css\&logoColor=white)

---

## 🚀 Features

### 📊 Revenue Analytics

* Real-time revenue tracking (daily, weekly, monthly, annual)
* Interactive charts with Chart.js
* Performance analysis by product categories
* Top products identification with detailed metrics
* KPI dashboard for total orders, revenue, average order value

### 📦 Inventory Management

* Real-time stock level monitoring with low-stock alerts
* Bulk product updates
* Advanced search and filtering by category, stock status, and keywords
* Inventory movement history tracking
* Automated restock alerts

### 🛍️ Product Management

* Product registration with images and details
* Category management
* Optimized image uploads
* Bulk import/export for large catalogs
* Individual product performance analytics

### 🔄 Real-time Updates

* Live data synchronization via Socket.io
* Instant notifications for critical inventory changes
* Multi-user collaborative environment

---

## 🛠️ Tech Stack

### Frontend

* Vue.js 3, Vite, Vue Router, Pinia
* Tailwind CSS
* Chart.js
* Lucide Vue icons

### Backend

* Node.js with Express.js
* PostgreSQL (Neon serverless platform)
* Socket.io for real-time events

### Infrastructure

* Vercel for deployment (Optional)
* Docker (optional containerization)

---

## 📋 Prerequisites

* Node.js (v18+)
* npm (v8+)
* PostgreSQL or Neon account
* Git

---

## 🚀 Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/abdullah021siraj/ecommerce-admin.git
cd ecommerce-admin
```

### 2. Setup environment variables

Create `.env` in root:

```env
DATABASE_URL=your_postgresql_connection_string
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
UPLOAD_MAX_SIZE=10485760
ALLOWED_FILE_TYPES=jpeg,jpg,png,gif,webp
```

### 3. Install dependencies

```bash
npm install             # Frontend
cd backend
npm install             # Backend
cd ..
```

### 4. Setup database

```bash
cd backend
npm run seed            # Run migrations and seed
cd ..
```

### 5. Start app

**Option A: Start both**

```bash
./start.sh
```

**Option B: Start separately**

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
npm run dev
```

### 6. Access app

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend API: [http://localhost:3001](http://localhost:3001)
* API Health: [http://localhost:3001/api/health](http://localhost:3001/api/health)

---

## 📖 API Documentation

### Base URL

```
http://localhost:3001/api
```

### Endpoints

**Products**

* `GET /products` - List products with pagination/filtering
* `GET /products/:id` - Get product by ID
* `POST /products` - Create product
* `PUT /products/:id` - Update product
* `DELETE /products/:id` - Delete product
* `GET /products/categories/list` - List categories

**Sales**

* `GET /sales` - Get sales data
* `POST /sales` - Add sale

**Inventory**

* `GET /inventory/alerts` - Low stock alerts
* `POST /inventory/movement` - Record inventory change
* `PUT /inventory/stock/:id` - Update stock

**Analytics**

* `GET /analytics/revenue`
* `GET /analytics/top-products`
* `GET /analytics/category-breakdown`
* `GET /analytics/dashboard-summary`

### Example Requests

Create product:

```bash
curl -X POST http://localhost:3001/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "description": "Latest iPhone with advanced features",
    "category": "Electronics",
    "price": 999.99,
    "stock": 50
  }'
```

Get revenue analytics:

```bash
curl "http://localhost:3001/api/analytics/revenue?period=monthly&category=Electronics"
```

---

## 🏗️ Project Structure

```
ecommerce-admin/
├── src/                   # Frontend source
│   ├── components/        # Vue components
│   ├── views/             # Pages
│   ├── router/            # Vue Router config
│   ├── assets/            # Static assets
│   └── main.js            # Entry point
├── backend/               # Backend source
│   ├── routes/            # API routes
│   ├── config/            # Config files
│   ├── scripts/           # Seed scripts
│   ├── uploads/           # File uploads
│   └── server.js          # Express server
├── public/                # Public assets
├── .env                   # Environment variables
├── package.json           # Frontend deps
├── vite.config.js         # Vite config
├── tailwind.config.js     # Tailwind config
└── README.md              # Documentation
```

---

## 🔧 Configuration

### Frontend

`vite.config.js`:

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
```

`tailwind.config.js`:

```js
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [require('@tailwindcss/forms')],
}
```

### Backend

* Configure PostgreSQL connection string in `.env`.
* File uploads saved to `backend/uploads/products/`.
* Consider cloud storage for production.

---

## 🧪 Testing

```bash
npm run test              # Frontend tests
cd backend
npm run test              # Backend tests
```

Test API with curl or Postman.

---

## 🚀 Deployment

### Frontend (Vercel)

```bash
npm run build
vercel --prod
```

### Production environment variables

```env
DATABASE_URL=your_production_database_url
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
```

---

## 🔒 Security

* Keep `.env` private
* Use connection pooling and prepared statements
* Validate uploads (type, size)
* Proper CORS setup
* Implement rate limiting
* Add authentication & authorization
* Use HTTPS in production

---

## 🤝 Contributing

1. Fork repo
2. Create branch `git checkout -b feature/amazing-feature`
3. Commit changes
4. Push branch
5. Open PR

---

## 📝 License

MIT License — see [LICENSE](LICENSE)

---

## 🆘 Support

* Check GitHub issues first
* Open new issue if needed
* Review README & code comments
* Join community discussions

---

## 🙏 Acknowledgments

* Vue.js Team
* Tailwind CSS
* Chart.js
* Neon
* Vercel

---

Let me know if you want it integrated anywhere else!


**Built with ❤️ by Abdullah Siraj**

For more info, visit [Documentation](https://your-docs-url.com).

