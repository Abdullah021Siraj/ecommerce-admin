<template>
  <div class="bg-white shadow rounded-lg p-6">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Revenue by Category</h3>
    
    <div v-if="chartData && chartData.labels && chartData.labels.length > 0" class="h-64">
      <Doughnut
        :data="chartData"
        :options="chartOptions"
        :key="chartKey"
      />
    </div>
    
    <div v-else class="h-64 flex items-center justify-center bg-gray-50 rounded">
      <div class="text-center">
        <PieChart class="h-12 w-12 text-gray-400 mx-auto mb-2" />
        <p class="text-gray-500">No category data available</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import { PieChart } from 'lucide-vue-next'

ChartJS.register(ArcElement, Tooltip, Legend)

export default {
  name: 'CategoryChart',
  components: {
    Doughnut,
    PieChart
  },
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const chartKey = ref(0)

    const colors = [
      'rgba(59, 130, 246, 0.8)',   // Blue
      'rgba(16, 185, 129, 0.8)',   // Green
      'rgba(245, 158, 11, 0.8)',   // Yellow
      'rgba(239, 68, 68, 0.8)',    // Red
      'rgba(139, 92, 246, 0.8)',   // Purple
      'rgba(236, 72, 153, 0.8)',   // Pink
      'rgba(14, 165, 233, 0.8)',   // Sky
      'rgba(34, 197, 94, 0.8)',    // Emerald
    ]

    const chartData = computed(() => {
      if (!props.data || props.data.length === 0) {
        return null
      }

      // Group by category and sum revenue
      const categoryData = {}
      props.data.forEach(item => {
        const category = item.category || 'Unknown'
        if (!categoryData[category]) {
          categoryData[category] = 0
        }
        categoryData[category] += Number(item.revenue) || 0
      })

      const labels = Object.keys(categoryData)
      const data = Object.values(categoryData)

      return {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors.slice(0, labels.length),
            borderColor: colors.slice(0, labels.length).map(color => color.replace('0.8', '1')),
            borderWidth: 2
          }
        ]
      }
    })

    const chartOptions = computed(() => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = ((context.parsed / total) * 100).toFixed(1)
              return `${context.label}: $${context.parsed.toLocaleString()} (${percentage}%)`
            }
          }
        }
      }
    }))

    // Force chart re-render when data changes
    watch(() => props.data, () => {
      chartKey.value++
    }, { deep: true })

    return {
      chartData,
      chartOptions,
      chartKey
    }
  }
}
</script>
