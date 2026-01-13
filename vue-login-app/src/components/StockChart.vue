<template>
  <div class="stock-chart-container">
    <div class="chart-controls">
      <div class="control-group">
        <label for="chart-type">图表类型:</label>
        <select id="chart-type" v-model="chartType" @change="updateChart">
          <option value="line">折线图</option>
          <option value="bar">柱状图</option>
        </select>
      </div>
      
      <div class="control-group">
        <label for="time-range">时间范围:</label>
        <select id="time-range" v-model="timeRange" @change="loadChartData">
          <option value="30">最近30天</option>
          <option value="90">最近90天</option>
          <option value="180">最近180天</option>
          <option value="365">最近一年</option>
          <option value="all">全部</option>
        </select>
      </div>
      

      
      <button @click="refreshData" class="btn btn-primary">刷新数据</button>
    </div>
    
    <div class="chart-wrapper" v-if="hasChartData">
      <Line 
        v-if="chartType === 'line'" 
        :data="chartData" 
        :options="lineChartOptions" 
        class="chart-canvas" 
      />
      <Bar 
        v-else-if="chartType === 'bar'" 
        :data="barChartData" 
        :options="barChartOptions" 
        class="chart-canvas"
      />
    </div>
    <div v-else class="no-data-message">
      <p>暂无数据可显示</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { 
  Chart as ChartJS, 
  LineController, 
  LineElement, 
  BarController,
  BarElement,
  PointElement, 
  LinearScale, 
  CategoryScale,
  Tooltip,
  Legend 
} from 'chart.js';
import { Line, Bar } from 'vue-chartjs';
import zoomPlugin from 'chartjs-plugin-zoom';

// 定义props
interface Props {
  selectedCode?: string;
}

const props = withDefaults(defineProps<Props>(), {
  selectedCode: ''
});

// 注册Chart.js组件
ChartJS.register(
  LineController,
  LineElement,
  BarController,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  zoomPlugin
);

// 类型定义
interface StockDataPoint {
  id: number;
  candle_end_time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  amount: number;
  volume: number;
  index_code: string;
}

// 响应式数据
const chartType = ref<'line' | 'bar'>('line');
const timeRange = ref('30');
const indexCodes = ref<{ index_code: string }[]>([]);
const rawData = ref<StockDataPoint[]>([]);


// 计算属性
const hasChartData = computed(() => rawData.value.length > 0);

const filteredData = computed(() => {
  if (!rawData.value.length) return [];
  
  // 按日期排序
  const sortedData = [...rawData.value].sort((a, b) => 
    new Date(a.candle_end_time).getTime() - new Date(b.candle_end_time).getTime()
  );
  
  // 返回所有数据
  return sortedData;
});

const chartData = computed(() => {
  if (!hasChartData.value) {
    return {
      labels: [],
      datasets: []
    };
  }

  // 使用过滤后的数据
  const dataToUse = filteredData.value.length > 0 ? filteredData.value : [...rawData.value];
  
  // 按日期排序
  const sortedData = dataToUse.sort((a, b) => 
    new Date(a.candle_end_time).getTime() - new Date(b.candle_end_time).getTime()
  );

  const labels = sortedData.map(item => new Date(item.candle_end_time).toLocaleDateString());
  const openPrices = sortedData.map(item => item.open);
  const highPrices = sortedData.map(item => item.high);
  const lowPrices = sortedData.map(item => item.low);
  const closePrices = sortedData.map(item => item.close);

  return {
    labels: labels,
    datasets: [
      {
        label: '开盘价',
        data: openPrices,
        borderColor: '#3e95cd',
        backgroundColor: 'rgba(62, 149, 205, 0.1)',
        tension: 0.1,
      },
      {
        label: '最高价',
        data: highPrices,
        borderColor: '#8e5ea2',
        backgroundColor: 'rgba(142, 94, 162, 0.1)',
        tension: 0.1,
      },
      {
        label: '最低价',
        data: lowPrices,
        borderColor: '#3cba9f',
        backgroundColor: 'rgba(60, 186, 159, 0.1)',
        tension: 0.1,
      },
      {
        label: '收盘价',
        data: closePrices,
        borderColor: '#e8c3b9',
        backgroundColor: 'rgba(232, 195, 185, 0.1)',
        tension: 0.1,
      }
    ]
  };
});

// 为柱状图准备数据（使用平均值）
const barChartData = computed(() => {
  if (!hasChartData.value) {
    return {
      labels: [],
      datasets: []
    };
  }

  // 使用过滤后的数据
  const dataToUse = filteredData.value.length > 0 ? filteredData.value : [...rawData.value];
  
  // 按日期排序
  const sortedData = dataToUse.sort((a, b) => 
    new Date(a.candle_end_time).getTime() - new Date(b.candle_end_time).getTime()
  );

  const labels = sortedData.map(item => new Date(item.candle_end_time).toLocaleDateString());
  const avgPrices = sortedData.map(item => (item.open + item.high + item.low + item.close) / 4);

  return {
    labels: labels,
    datasets: [
      {
        label: '平均价格',
        data: avgPrices,
        backgroundColor: [
          '#3e95cd', '#8e5ea2', '#3cba9f', '#e8c3b9', '#c45850'
        ],
      }
    ]
  };
});

const lineChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false
    },
    zoom: {
      zoom: {
        wheel: {
          enabled: true,
        },
        pinch: {
          enabled: true
        },
        mode: 'x' as const,
      },
      pan: {
        enabled: true,
        mode: 'x' as const,
      },
      limits: {
        x: { min: 0, minRange: 1 },
      }
    }
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: '日期'
      },
      min: undefined,
      max: undefined
    },
    y: {
      display: true,
      title: {
        display: true,
        text: '价格'
      }
    }
  }
});

const barChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false
    },
    zoom: {
      zoom: {
        wheel: {
          enabled: true,
        },
        pinch: {
          enabled: true
        },
        mode: 'x' as const,
      },
      pan: {
        enabled: true,
        mode: 'x' as const,
      },
      limits: {
        x: { min: 0, minRange: 1 },
      }
    }
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: '日期'
      },
      min: undefined,
      max: undefined
    },
    y: {
      display: true,
      title: {
        display: true,
        text: '价格'
      }
    }
  }
});

// 加载指数代码
const loadIndexCodes = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/stock-index-codes');
    const result = await response.json();
    
    if (result.success) {
      indexCodes.value = result.data;
    } else {
      console.error('获取指数代码失败:', result.message);
    }
  } catch (error) {
    console.error('请求指数代码失败:', error);
  }
};

// 加载图表数据
const loadChartData = async () => {
  try {
    const params = new URLSearchParams({
      indexCode: props.selectedCode,
      limit: timeRange.value === 'all' ? '1000' : timeRange.value,
      offset: '0'
    });

    const response = await fetch(`http://localhost:3000/api/stock-index-data?${params}`);
    const result = await response.json();
    
    if (result.success) {
      rawData.value = result.data;

    } else {
      console.error('获取图表数据失败:', result.message);
      rawData.value = [];
    }
  } catch (error) {
    console.error('请求图表数据失败:', error);
    rawData.value = [];
  }
};

// 更新图表
const updateChart = () => {
  // 图表类型改变时重新渲染
  // 由于使用计算属性，视图会自动更新
};





// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// 刷新数据
const refreshData = () => {
  loadChartData();
};






// 初始化
onMounted(async () => {
  await loadIndexCodes();
  await loadChartData();
});

// 监听selectedCode变化
watch(() => props.selectedCode, async () => {
  await loadChartData();

});
</script>

<style scoped>
.stock-chart-container {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.chart-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  padding: 15px;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 20px;
  align-items: end;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}



.control-group label {
  font-weight: bold;
  font-size: 14px;
}

.control-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 120px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.chart-wrapper {
  height: 500px;
  position: relative;
  background-color: white;
  border-radius: 8px;
  padding: 10px;
}

.chart-canvas {
  width: 100% !important;
  height: 100% !important;
}

.no-data-message {
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border-radius: 8px;
  font-size: 18px;
  color: #666;
}

@media (max-width: 768px) {
  .chart-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .control-group {
    align-items: flex-start;
  }
  
  .control-group select {
    width: 100%;
  }
}
</style>