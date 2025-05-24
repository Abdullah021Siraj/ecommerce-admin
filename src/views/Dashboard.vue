<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Header -->
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <h1 class="text-xl font-bold text-gray-900">E-commerce Admin</h1>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="handleTabChange(tab.id)"
                :class="[
                  'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                  activeTab === tab.id
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                <component :is="tab.icon" class="w-4 h-4 mr-2" />
                {{ tab.name }}
              </button>
            </div>
          </div>
          <div class="flex items-center">
            <div :class="[
              'flex items-center px-2 py-1 rounded-full text-xs',
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            ]">
              <div :class="[
                'w-2 h-2 rounded-full mr-2',
                isConnected ? 'bg-green-400' : 'bg-red-400'
              ]"></div>
              {{ isConnected ? 'Connected' : 'Disconnected' }}
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
        <div class="flex">
          <AlertTriangle class="h-5 w-5 text-red-400" />
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Connection Error</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ error }}</p>
              <button @click="retryConnection" class="mt-2 text-red-600 hover:text-red-500 underline">
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Revenue Analysis Page -->
      <div v-else-if="activeTab === 'revenue'" class="px-4 py-6 sm:px-0">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Revenue Analysis</h2>
          
          <!-- Filter Controls -->
          <div class="flex flex-wrap gap-4 mb-6">
            <select v-model="selectedCategory" @change="fetchAnalytics" class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="">All Categories</option>
              <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
            </select>
            <select v-model="selectedPeriod" @change="fetchAnalytics" class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="annually">Annually</option>
            </select>
          </div>

          <!-- Revenue Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <ShoppingCart class="h-6 w-6 text-gray-400" />
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                      <dd class="text-lg font-medium text-gray-900">{{ analytics.totals?.total_orders?.toLocaleString() || 0 }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <DollarSign class="h-6 w-6 text-gray-400" />
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                      <dd class="text-lg font-medium text-gray-900">${{ analytics.totals?.total_revenue?.toLocaleString() || 0 }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <TrendingUp class="h-6 w-6 text-gray-400" />
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Average Order Value</dt>
                      <dd class="text-lg font-medium text-gray-900">${{ averageOrderValue }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <Package class="h-6 w-6 text-gray-400" />
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Products Sold</dt>
                      <dd class="text-lg font-medium text-gray-900">{{ analytics.totals?.total_products?.toLocaleString() || 0 }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Charts Row -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <!-- Revenue Chart (2/3 width) -->
            <div class="lg:col-span-2">
              <RevenueChart 
                :data="analytics.data" 
                :period="selectedPeriod"
                :category="selectedCategory"
              />
            </div>
            
            <!-- Category Chart (1/3 width) -->
            <div class="lg:col-span-1">
              <CategoryChart :data="categoryBreakdown" />
            </div>
          </div>

          <!-- Top Products Table -->
          <div class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Top Selling Products</h3>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="product in topProducts" :key="product.id">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ product.category }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ Number(product.units_sold)?.toLocaleString() || 0 }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${{ Number(product.revenue)?.toLocaleString() || 0 }}</td>
                  </tr>
                  <tr v-if="topProducts.length === 0">
                    <td colspan="4" class="px-6 py-4 text-center text-gray-500">No data available</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Inventory Management Page -->
      <div v-else-if="activeTab === 'inventory'" class="px-4 py-6 sm:px-0">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Inventory Management</h2>
          
          <!-- Search and Filter Controls -->
          <div class="flex flex-wrap gap-4 mb-6">
            <div class="flex-1 min-w-64">
              <input
                v-model="searchQuery"
                @input="debouncedSearch"
                type="text"
                placeholder="Search products..."
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <select v-model="inventoryFilter" @change="fetchProducts" class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="">All Stock Levels</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
              <option value="in">In Stock</option>
            </select>
            <select v-model="categorySortFilter" @change="fetchProducts" class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="">All Categories</option>
              <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
            </select>
          </div>

          <!-- Alerts -->
          <div v-if="inventoryAlerts.low_stock?.length > 0" class="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div class="flex">
              <AlertTriangle class="h-5 w-5 text-yellow-400" />
              <div class="ml-3">
                <h3 class="text-sm font-medium text-yellow-800">Low Stock Alert</h3>
                <div class="mt-2 text-sm text-yellow-700">
                  <p>{{ inventoryAlerts.low_stock.length }} products need restocking:</p>
                  <ul class="list-disc list-inside mt-1">
                    <li v-for="product in inventoryAlerts.low_stock.slice(0, 3)" :key="product.id">
                      {{ product.name }} ({{ product.stock }} remaining)
                    </li>
                    <li v-if="inventoryAlerts.low_stock.length > 3">
                      and {{ inventoryAlerts.low_stock.length - 3 }} more...
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Products Table -->
          <div class="bg-white shadow overflow-hidden sm:rounded-md">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium text-gray-900">Products ({{ products.length }})</h3>
                <div class="flex gap-2">
                  <button
                    @click="sortBy('name')"
                    :class="['px-3 py-1 text-xs rounded', sortField === 'name' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600']"
                  >
                    Sort by Name
                  </button>
                  <button
                    @click="sortBy('stock')"
                    :class="['px-3 py-1 text-xs rounded', sortField === 'stock' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600']"
                  >
                    Sort by Stock
                  </button>
                  <button
                    @click="sortBy('price')"
                    :class="['px-3 py-1 text-xs rounded', sortField === 'price' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600']"
                  >
                    Sort by Price
                  </button>
                </div>
              </div>
              
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="product in products" :key="product.id">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <div class="flex-shrink-0 h-10 w-10">
                            <img v-if="product.image_url" :src="`${API_BASE_URL}${product.image_url}`" :alt="product.name" class="h-10 w-10 rounded object-cover">
                            <div v-else class="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                              <Package class="h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                          <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                            <div class="text-sm text-gray-500">{{ product.description?.substring(0, 50) }}...</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ product.category }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${{ Number(product.price).toFixed(2) }}</td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <input
                          :value="product.stock"
                          @change="updateStock(product, $event.target.value)"
                          type="number"
                          min="0"
                          class="w-20 rounded border-gray-300 text-sm"
                        />
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span :class="[
                          'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                          product.stock === 0 ? 'bg-red-100 text-red-800' :
                          product.stock <= 10 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        ]">
                          {{ product.stock === 0 ? 'Out of Stock' : product.stock <= 10 ? 'Low Stock' : 'In Stock' }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          @click="editProduct(product)"
                          class="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Edit class="h-4 w-4" />
                        </button>
                        <button
                          @click="deleteProduct(product.id)"
                          class="text-red-600 hover:text-red-900"
                        >
                          <Trash2 class="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                    <tr v-if="products.length === 0">
                      <td colspan="6" class="px-6 py-4 text-center text-gray-500">No products found</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              <div v-if="pagination.pages > 1" class="flex items-center justify-between mt-6">
                <div class="text-sm text-gray-700">
                  Showing {{ ((pagination.page - 1) * pagination.limit) + 1 }} to {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }} results
                </div>
                <div class="flex gap-2">
                  <button
                    @click="changePage(pagination.page - 1)"
                    :disabled="pagination.page <= 1"
                    class="px-3 py-1 text-sm border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    @click="changePage(pagination.page + 1)"
                    :disabled="pagination.page >= pagination.pages"
                    class="px-3 py-1 text-sm border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Registration Page -->
      <div v-else-if="activeTab === 'products'" class="px-4 py-6 sm:px-0">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Product Registration</h2>
          
          <div class="bg-white shadow rounded-lg p-6">
            <form @submit.prevent="addProduct" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="productName" class="block text-sm font-medium text-gray-700">Product Name</label>
                  <input
                    id="productName"
                    v-model="newProduct.name"
                    type="text"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label for="productCategory" class="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    id="productCategory"
                    v-model="newProduct.category"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
                  </select>
                </div>

                <div>
                  <label for="productPrice" class="block text-sm font-medium text-gray-700">Price ($)</label>
                  <input
                    id="productPrice"
                    v-model.number="newProduct.price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label for="productStock" class="block text-sm font-medium text-gray-700">Initial Stock</label>
                  <input
                    id="productStock"
                    v-model.number="newProduct.stock"
                    type="number"
                    min="0"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label for="productDescription" class="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="productDescription"
                  v-model="newProduct.description"
                  rows="3"
                  required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                ></textarea>
              </div>

              <div>
                <label for="productImage" class="block text-sm font-medium text-gray-700">Product Image</label>
                <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div class="space-y-1 text-center">
                    <Upload class="mx-auto h-12 w-12 text-gray-400" />
                    <div class="flex text-sm text-gray-600">
                      <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" class="sr-only" accept="image/*" @change="handleImageUpload">
                      </label>
                      <p class="pl-1">or drag and drop</p>
                    </div>
                    <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              </div>

              <div class="flex justify-end space-x-3">
                <button
                  type="button"
                  @click="resetForm"
                  class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  :disabled="submitting"
                  class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {{ submitting ? 'Adding...' : 'Add Product' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Success Message -->
          <div v-if="showSuccessMessage" class="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
            <div class="flex">
              <CheckCircle class="h-5 w-5 text-green-400" />
              <div class="ml-3">
                <p class="text-sm font-medium text-green-800">Product added successfully!</p>
                <p class="text-sm text-green-700">The product has been added to your inventory and is now visible across the dashboard.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  BarChart3, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Upload, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-vue-next'
import RevenueChart from '../components/RevenueChart.vue'
import CategoryChart from '../components/CategoryChart.vue'

const API_BASE_URL = 'http://localhost:3001'

export default {
  name: 'EcommerceAdminDashboard',
  components: {
    BarChart3,
    ShoppingCart,
    DollarSign,
    TrendingUp,
    Package,
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Upload,
    CheckCircle,
    AlertTriangle,
    RevenueChart,
    CategoryChart
  },
  setup() {
    // Reactive data
    const activeTab = ref('revenue')
    const selectedCategory = ref('')
    const selectedPeriod = ref('daily')
    const searchQuery = ref('')
    const inventoryFilter = ref('')
    const categorySortFilter = ref('')
    const sortField = ref('')
    const sortDirection = ref('asc')
    const showSuccessMessage = ref(false)
    const loading = ref(false)
    const submitting = ref(false)
    const isConnected = ref(false)
    const error = ref(null)

    // Data
    const products = ref([])
    const categories = ref([])
    const analytics = ref({ data: [], totals: {} })
    const topProducts = ref([])
    const categoryBreakdown = ref([])
    const inventoryAlerts = ref({ low_stock: [], out_of_stock: [] })
    const pagination = ref({ page: 1, limit: 20, total: 0, pages: 0 })

    // Navigation tabs
    const tabs = ref([
      { id: 'revenue', name: 'Revenue Analysis', icon: BarChart3 },
      { id: 'inventory', name: 'Inventory Management', icon: Package },
      { id: 'products', name: 'Product Registration', icon: Plus }
    ])

    // New product form
    const newProduct = ref({
      name: '',
      description: '',
      category: '',
      price: 0,
      stock: 0,
      image: null
    })

    // Computed properties
    const averageOrderValue = computed(() => {
      const total = analytics.value.totals?.total_revenue || 0
      const orders = analytics.value.totals?.total_orders || 0
      return orders > 0 ? (total / orders).toFixed(2) : '0.00'
    })

    // API functions
    const api = {
      async get(endpoint) {
        try {
          const response = await fetch(`${API_BASE_URL}/api${endpoint}`)
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
          }
          return response.json()
        } catch (err) {
          console.error(`API GET error for ${endpoint}:`, err)
          throw err
        }
      },

      async post(endpoint, data) {
        try {
          const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
            method: 'POST',
            headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
            body: data instanceof FormData ? data : JSON.stringify(data)
          })
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
          }
          return response.json()
        } catch (err) {
          console.error(`API POST error for ${endpoint}:`, err)
          throw err
        }
      },

      async put(endpoint, data) {
        try {
          const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
            method: 'PUT',
            headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
            body: data instanceof FormData ? data : JSON.stringify(data)
          })
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
          }
          return response.json()
        } catch (err) {
          console.error(`API PUT error for ${endpoint}:`, err)
          throw err
        }
      },

      async delete(endpoint) {
        try {
          const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
            method: 'DELETE'
          })
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
          }
          return response.json()
        } catch (err) {
          console.error(`API DELETE error for ${endpoint}:`, err)
          throw err
        }
      }
    }

    // Check backend connection
    const checkConnection = async () => {
      try {
        await api.get('/health')
        isConnected.value = true
        error.value = null
        return true
      } catch (err) {
        isConnected.value = false
        error.value = `Cannot connect to backend server at ${API_BASE_URL}. Please make sure the backend is running.`
        return false
      }
    }

    // Data fetching functions
    const fetchProducts = async () => {
      try {
        loading.value = true
        const params = new URLSearchParams({
          page: pagination.value.page,
          limit: pagination.value.limit,
          sort_by: sortField.value || 'name',
          sort_order: sortDirection.value
        })

        if (searchQuery.value) params.append('search', searchQuery.value)
        if (inventoryFilter.value) params.append('stock_status', inventoryFilter.value)
        if (categorySortFilter.value) params.append('category', categorySortFilter.value)

        const data = await api.get(`/products?${params}`)
        products.value = data.products || []
        pagination.value = data.pagination || { page: 1, limit: 20, total: 0, pages: 0 }
      } catch (err) {
        console.error('Error fetching products:', err)
        error.value = 'Failed to fetch products: ' + err.message
      } finally {
        loading.value = false
      }
    }

    const fetchCategories = async () => {
      try {
        const data = await api.get('/products/categories/list')
        categories.value = data || []
      } catch (err) {
        console.error('Error fetching categories:', err)
      }
    }

    const fetchAnalytics = async () => {
      try {
        loading.value = true
        const params = new URLSearchParams({
          period: selectedPeriod.value
        })
        
        if (selectedCategory.value) params.append('category', selectedCategory.value)

        const [revenueData, topProductsData, categoryData] = await Promise.all([
          api.get(`/analytics/revenue?${params}`),
          api.get('/analytics/top-products'),
          api.get('/analytics/category-breakdown')
        ])

        analytics.value = revenueData || { data: [], totals: {} }
        topProducts.value = topProductsData || []
        categoryBreakdown.value = categoryData || []
      } catch (err) {
        console.error('Error fetching analytics:', err)
        error.value = 'Failed to fetch analytics data: ' + err.message
      } finally {
        loading.value = false
      }
    }

    const fetchInventoryAlerts = async () => {
      try {
        const alerts = await api.get('/inventory/alerts')
        inventoryAlerts.value = alerts || { low_stock: [], out_of_stock: [] }
      } catch (err) {
        console.error('Error fetching inventory alerts:', err)
      }
    }

    // Debounced search
    let searchTimeout
    const debouncedSearch = () => {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        pagination.value.page = 1
        fetchProducts()
      }, 500)
    }

    // Methods
    const retryConnection = async () => {
      const connected = await checkConnection()
      if (connected) {
        handleTabChange(activeTab.value)
      }
    }

    const sortBy = (field) => {
      if (sortField.value === field) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortField.value = field
        sortDirection.value = 'asc'
      }
      fetchProducts()
    }

    const changePage = (page) => {
      pagination.value.page = page
      fetchProducts()
    }

    const updateStock = async (product, newStock) => {
      try {
        await api.put(`/inventory/stock/${product.id}`, { stock: parseInt(newStock) })
        product.stock = parseInt(newStock)
      } catch (err) {
        console.error('Error updating stock:', err)
        alert('Failed to update stock: ' + err.message)
      }
    }

    const editProduct = (product) => {
      console.log('Editing product:', product)
    }

    const deleteProduct = async (productId) => {
      if (confirm('Are you sure you want to delete this product?')) {
        try {
          await api.delete(`/products/${productId}`)
          await fetchProducts()
        } catch (err) {
          console.error('Error deleting product:', err)
          alert('Failed to delete product: ' + err.message)
        }
      }
    }

    const handleImageUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        newProduct.value.image = file
      }
    }

    const addProduct = async () => {
      try {
        submitting.value = true
        const formData = new FormData()
        
        formData.append('name', newProduct.value.name)
        formData.append('description', newProduct.value.description)
        formData.append('category', newProduct.value.category)
        formData.append('price', newProduct.value.price)
        formData.append('stock', newProduct.value.stock)
        
        if (newProduct.value.image) {
          formData.append('image', newProduct.value.image)
        }

        await api.post('/products', formData)
        
        resetForm()
        showSuccessMessage.value = true
        
        setTimeout(() => {
          showSuccessMessage.value = false
        }, 5000)

        if (activeTab.value === 'inventory') {
          await fetchProducts()
        }
      } catch (err) {
        console.error('Error adding product:', err)
        alert('Failed to add product: ' + err.message)
      } finally {
        submitting.value = false
      }
    }

    const resetForm = () => {
      newProduct.value = {
        name: '',
        description: '',
        category: '',
        price: 0,
        stock: 0,
        image: null
      }
      const fileInput = document.getElementById('file-upload')
      if (fileInput) fileInput.value = ''
    }

    const handleTabChange = async (newTab) => {
      activeTab.value = newTab
      
      const connected = await checkConnection()
      if (!connected) return

      if (newTab === 'revenue') {
        await fetchAnalytics()
      } else if (newTab === 'inventory') {
        await fetchProducts()
        await fetchInventoryAlerts()
      }
    }

    // Lifecycle hooks
    onMounted(async () => {
      const connected = await checkConnection()
      if (connected) {
        await fetchCategories()
        
        if (activeTab.value === 'revenue') {
          await fetchAnalytics()
        } else if (activeTab.value === 'inventory') {
          await fetchProducts()
          await fetchInventoryAlerts()
        }
      }
    })

    return {
      // Reactive data
      activeTab,
      selectedCategory,
      selectedPeriod,
      searchQuery,
      inventoryFilter,
      categorySortFilter,
      sortField,
      showSuccessMessage,
      loading,
      submitting,
      isConnected,
      error,
      tabs,
      categories,
      products,
      newProduct,
      analytics,
      topProducts,
      categoryBreakdown,
      inventoryAlerts,
      pagination,
      API_BASE_URL,
      
      // Computed
      averageOrderValue,
      
      // Methods
      fetchAnalytics,
      fetchProducts,
      debouncedSearch,
      sortBy,
      changePage,
      updateStock,
      editProduct,
      deleteProduct,
      handleImageUpload,
      addProduct,
      resetForm,
      handleTabChange,
      retryConnection
    }
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
