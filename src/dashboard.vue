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
                @click="activeTab = tab.id"
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
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Revenue Analysis Page -->
      <div v-if="activeTab === 'revenue'" class="px-4 py-6 sm:px-0">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Revenue Analysis</h2>
          
          <!-- Filter Controls -->
          <div class="flex flex-wrap gap-4 mb-6">
            <select v-model="selectedCategory" class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="">All Categories</option>
              <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
            </select>
            <select v-model="selectedPeriod" class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="annually">Annually</option>
            </select>
          </div>

          <!-- Revenue Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white overflow-hidden shadow rounded-lg">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <ShoppingCart class="h-6 w-6 text-gray-400" />
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                      <dd class="text-lg font-medium text-gray-900">{{ filteredMetrics.totalOrders }}</dd>
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
                      <dd class="text-lg font-medium text-gray-900">${{ filteredMetrics.totalRevenue.toLocaleString() }}</dd>
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
                      <dd class="text-lg font-medium text-gray-900">${{ (filteredMetrics.totalRevenue / filteredMetrics.totalOrders || 0).toFixed(2) }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Revenue Chart -->
          <div class="bg-white shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Revenue Trends</h3>
            <div class="h-64 flex items-center justify-center bg-gray-50 rounded">
              <div class="text-center">
                <BarChart3 class="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p class="text-gray-500">Revenue chart visualization would be displayed here</p>
                <p class="text-sm text-gray-400">{{ selectedPeriod }} data for {{ selectedCategory || 'all categories' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Inventory Management Page -->
      <div v-if="activeTab === 'inventory'" class="px-4 py-6 sm:px-0">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Inventory Management</h2>
          
          <!-- Search and Filter Controls -->
          <div class="flex flex-wrap gap-4 mb-6">
            <div class="flex-1 min-w-64">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search products..."
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <select v-model="inventoryFilter" class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="">All Stock Levels</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
              <option value="in">In Stock</option>
            </select>
            <select v-model="categorySortFilter" class="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="">All Categories</option>
              <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
            </select>
          </div>

          <!-- Low Stock Alerts -->
          <div v-if="lowStockProducts.length > 0" class="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div class="flex">
              <AlertTriangle class="h-5 w-5 text-yellow-400" />
              <div class="ml-3">
                <h3 class="text-sm font-medium text-yellow-800">Low Stock Alert</h3>
                <div class="mt-2 text-sm text-yellow-700">
                  <p>{{ lowStockProducts.length }} products need restocking:</p>
                  <ul class="list-disc list-inside mt-1">
                    <li v-for="product in lowStockProducts.slice(0, 3)" :key="product.id">
                      {{ product.name }} ({{ product.stock }} remaining)
                    </li>
                    <li v-if="lowStockProducts.length > 3">
                      and {{ lowStockProducts.length - 3 }} more...
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
                <h3 class="text-lg font-medium text-gray-900">Products</h3>
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
                    <tr v-for="product in filteredProducts" :key="product.id">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <div class="flex-shrink-0 h-10 w-10">
                            <div class="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                              <Package class="h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                          <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                            <div class="text-sm text-gray-500">{{ product.description.substring(0, 50) }}...</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ product.category }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${{ product.price.toFixed(2) }}</td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <input
                          v-model.number="product.stock"
                          type="number"
                          min="0"
                          class="w-20 rounded border-gray-300 text-sm"
                          @change="updateStock(product)"
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
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Registration Page -->
      <div v-if="activeTab === 'products'" class="px-4 py-6 sm:px-0">
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
                  class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Product
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
import { ref, computed, onMounted } from 'vue'
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
    AlertTriangle
  },
  setup() {
    // Reactive data
    const activeTab = ref('revenue')
    const selectedCategory = ref('')
    const selectedPeriod = ref('monthly')
    const searchQuery = ref('')
    const inventoryFilter = ref('')
    const categorySortFilter = ref('')
    const sortField = ref('')
    const sortDirection = ref('asc')
    const showSuccessMessage = ref(false)

    // Navigation tabs
    const tabs = ref([
      { id: 'revenue', name: 'Revenue Analysis', icon: BarChart3 },
      { id: 'inventory', name: 'Inventory Management', icon: Package },
      { id: 'products', name: 'Product Registration', icon: Plus }
    ])

    // Categories
    const categories = ref([
      'Electronics',
      'Clothing',
      'Home & Garden',
      'Sports & Outdoors',
      'Books',
      'Health & Beauty',
      'Toys & Games'
    ])

    // Sample products data (Amazon/Walmart style)
    const products = ref([
      {
        id: 1,
        name: 'Apple iPhone 15 Pro',
        description: 'Latest iPhone with advanced camera system and A17 Pro chip',
        category: 'Electronics',
        price: 999.99,
        stock: 25,
        image: null
      },
      {
        id: 2,
        name: 'Samsung 65" 4K Smart TV',
        description: 'Ultra HD Smart TV with HDR and built-in streaming apps',
        category: 'Electronics',
        price: 799.99,
        stock: 8,
        image: null
      },
      {
        id: 3,
        name: 'Nike Air Max 270',
        description: 'Comfortable running shoes with Max Air cushioning',
        category: 'Clothing',
        price: 129.99,
        stock: 45,
        image: null
      },
      {
        id: 4,
        name: 'KitchenAid Stand Mixer',
        description: 'Professional 5-quart stand mixer for baking enthusiasts',
        category: 'Home & Garden',
        price: 349.99,
        stock: 12,
        image: null
      },
      {
        id: 5,
        name: 'PlayStation 5 Console',
        description: 'Next-gen gaming console with ultra-fast SSD',
        category: 'Electronics',
        price: 499.99,
        stock: 3,
        image: null
      },
      {
        id: 6,
        name: 'Levi\'s 501 Original Jeans',
        description: 'Classic straight-leg jeans in authentic indigo',
        category: 'Clothing',
        price: 69.99,
        stock: 0,
        image: null
      },
      {
        id: 7,
        name: 'Dyson V15 Detect Vacuum',
        description: 'Cordless vacuum with laser dust detection',
        category: 'Home & Garden',
        price: 649.99,
        stock: 15,
        image: null
      },
      {
        id: 8,
        name: 'Wilson Tennis Racket',
        description: 'Professional tennis racket for intermediate players',
        category: 'Sports & Outdoors',
        price: 89.99,
        stock: 22,
        image: null
      }
    ])

    // Sample sales data
    const salesData = ref([
      { date: '2024-01-01', orders: 45, revenue: 12500, category: 'Electronics' },
      { date: '2024-01-02', orders: 32, revenue: 8900, category: 'Clothing' },
      { date: '2024-01-03', orders: 28, revenue: 7200, category: 'Home & Garden' },
      { date: '2024-01-04', orders: 51, revenue: 15600, category: 'Electronics' },
      { date: '2024-01-05', orders: 38, revenue: 9800, category: 'Sports & Outdoors' }
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
    const filteredMetrics = computed(() => {
      let data = salesData.value
      if (selectedCategory.value) {
        data = data.filter(item => item.category === selectedCategory.value)
      }
      
      return {
        totalOrders: data.reduce((sum, item) => sum + item.orders, 0),
        totalRevenue: data.reduce((sum, item) => sum + item.revenue, 0)
      }
    })

    const filteredProducts = computed(() => {
      let filtered = products.value

      // Search filter
      if (searchQuery.value) {
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
      }

      // Category filter
      if (categorySortFilter.value) {
        filtered = filtered.filter(product => product.category === categorySortFilter.value)
      }

      // Stock level filter
      if (inventoryFilter.value) {
        switch (inventoryFilter.value) {
          case 'low':
            filtered = filtered.filter(product => product.stock > 0 && product.stock <= 10)
            break
          case 'out':
            filtered = filtered.filter(product => product.stock === 0)
            break
          case 'in':
            filtered = filtered.filter(product => product.stock > 10)
            break
        }
      }

      // Sorting
      if (sortField.value) {
        filtered.sort((a, b) => {
          let aVal = a[sortField.value]
          let bVal = b[sortField.value]
          
          if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase()
            bVal = bVal.toLowerCase()
          }
          
          if (sortDirection.value === 'asc') {
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
          } else {
            return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
          }
        })
      }

      return filtered
    })

    const lowStockProducts = computed(() => {
      return products.value.filter(product => product.stock > 0 && product.stock <= 10)
    })

    // Methods
    const sortBy = (field) => {
      if (sortField.value === field) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortField.value = field
        sortDirection.value = 'asc'
      }
    }

    const updateStock = (product) => {
      console.log(`Updated stock for ${product.name}: ${product.stock}`)
      // In a real app, this would make an API call to update the database
    }

    const editProduct = (product) => {
      console.log('Editing product:', product)
      // In a real app, this would open an edit modal or navigate to edit page
    }

    const deleteProduct = (productId) => {
      if (confirm('Are you sure you want to delete this product?')) {
        const index = products.value.findIndex(p => p.id === productId)
        if (index > -1) {
          products.value.splice(index, 1)
        }
      }
    }

    const handleImageUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        newProduct.value.image = file
        console.log('Image uploaded:', file.name)
      }
    }

    const addProduct = () => {
      const product = {
        id: Date.now(),
        ...newProduct.value
      }
      
      products.value.push(product)
      resetForm()
      showSuccessMessage.value = true
      
      setTimeout(() => {
        showSuccessMessage.value = false
      }, 5000)
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
    }

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
      tabs,
      categories,
      products,
      newProduct,
      
      // Computed
      filteredMetrics,
      filteredProducts,
      lowStockProducts,
      
      // Methods
      sortBy,
      updateStock,
      editProduct,
      deleteProduct,
      handleImageUpload,
      addProduct,
      resetForm
    }
  }
}
</script>

<style scoped>
/* Additional custom styles if needed */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
