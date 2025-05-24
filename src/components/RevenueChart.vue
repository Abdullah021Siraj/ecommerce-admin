<template>
  <div class="bg-white shadow rounded-lg p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-medium text-gray-900">Revenue Trends ({{ period }})</h3>
      <div class="flex gap-2">
        <button
          @click="chartType = 'line'"
          :class="['px-3 py-1 text-xs rounded', chartType === 'line' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600']"
        >
          Line
        </button>
        <button
          @click="chartType = 'bar'"
          :class="['px-3 py-1 text-xs rounded', chartType === 'bar' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600']"
        >
          Bar
        </button>
      </div>
    </div>
    
    <div v-if="chartData && chartData.labels && chartData.labels.length > 0" class="h-80">
      <Line
        v-if="chartType === 'line'"
        :data="chartData"
        :options="chartOptions"
        :key="chartKey"
      />
      <Bar
        v-else
        :data="chartData"
        :options="chartOptions"
        :key="chartKey"
      />
    </div>
    
    <div v-else class="h-80 flex items-center justify-center bg-gray-50 rounded">
      <div class="text-center">
        <BarChart3 class="h-12 w-12 text-gray-400 mx-auto mb-2" />
        <p class="text-gray-500">No data available for the selected period</p>
        <p class="text-sm text-gray-400">{{ category ? `Category: ${category}` : 'All categories' }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar } from 'vue-chartjs'
import { BarChart3 } from 'lucide-vue-next'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default {
  name: 'RevenueChart',
  components: {
    Line,
    Bar,
    BarChart3
  },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    period: {
      type: String,
      default: 'daily'
    },
    category: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const chartType = ref('line')
    const chartKey = ref(0)

    // Process data for chart
    const chartData = computed(() => {
      if (!props.data || props.data.length === 0) {
        return null
      }

      // Group data by period and sum revenue
      const groupedData = {}
      props.data.forEach(item => {
        const period = item.period
        if (!groupedData[period]) {
          groupedData[period] = {
            revenue: 0,
            orders: 0
          }
        }
        groupedData[period].revenue += Number(item.revenue) || 0
        groupedData[period].orders += Number(item.orders) || 0
      })

      // Sort periods
      const sortedPeriods = Object.keys(groupedData).sort()
      
      const labels = sortedPeriods
      const revenueData = sortedPeriods.map(period => groupedData[period].revenue)
      const ordersData = sortedPeriods.map(period => groupedData[period].orders)

      return {
        labels,
        datasets: [
          {
            label: 'Revenue ($)',
            data: revenueData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: chartType.value === 'line' 
              ? 'rgba(59, 130, 246, 0.1)' 
              : 'rgba(59, 130, 246, 0.8)',
            tension: 0.4,
            fill: chartType.value === 'line',
            yAxisID: 'y'
          },
          {
            label: 'Orders',
            data: ordersData,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: chartType.value === 'line' 
              ? 'rgba(16, 185, 129, 0.1)' 
              : 'rgba(16, 185, 129, 0.8)',
            tension: 0.4,
            fill: false,
            yAxisID: 'y1'
          }
        ]
      }
    })

    const chartOptions = computed(() => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        title: {
          display: false
        },
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              if (context.datasetIndex === 0) {
                return `Revenue: $${context.parsed.y.toLocaleString()}`
              } else {
                return `Orders: ${context.parsed.y.toLocaleString()}`
              }
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: getPeriodLabel(props.period)
          },
          grid: {
            display: false
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Revenue ($)'
          },
          ticks: {
            callback: function(value) {
              return '$' + value.toLocaleString()
            }
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Orders'
          },
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            callback: function(value) {
              return value.toLocaleString()
            }
          }
        }
      }
    }))

    function getPeriodLabel(period) {
      switch (period) {
        case 'daily': return 'Date'
        case 'weekly': return 'Week'
        case 'monthly': return 'Month'
        case 'annually': return 'Year'
        default: return 'Period'
      }
    }

    // Force chart re-render when type changes
    watch(chartType, () => {
      chartKey.value++
    })

    // Force chart re-render when data changes
    watch(() => props.data, () => {
      chartKey.value++
    }, { deep: true })

    return {
      chartType,
      chartData,
      chartOptions,
      chartKey
    }
  }
}
</script>
