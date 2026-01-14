<template>
  <div class="data-management">
    <TopNavigation />
    <div class="data-content">
      <div class="sidebar">
        <h3>数据源文件</h3>
        <div class="data-source-info">
          <p>数据来源: shuju/stock-main-index-data</p>
          <p>数据格式: CSV文件</p>
        </div>
        <h3 style="margin-top: 20px;">指数列表</h3>
        <div class="index-buttons">
          <button 
            v-for="code in indexCodes" 
            :key="code.index_code"
            :class="['index-btn', { active: selectedCode === code.index_code }]"
            @click="selectIndex(code.index_code)"
          >
            {{ code.index_code }}
          </button>
          <button 
            :class="['index-btn', { active: !selectedCode }]"
            @click="selectAllIndices"
          >
            全部
          </button>
        </div>
      </div>
      <div class="main-content">
        <h1>股票指数数据管理 - {{ selectedCode || '全部数据' }}</h1>
        
        <!-- ECharts 图表容器 -->
        <div class="chart-section">
          <h2>数据图表</h2>
          <div ref="chartContainer" class="echart-container" style="height: 500px;"></div>
        </div>
        
        <div class="controls">
          <!-- 添加数据功能已移除 -->
        </div>

        <div class="chart-section">
          <StockChart :selectedCode="selectedCode" />
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import StockChart from '@/components/StockChart.vue';
import TopNavigation from '@/components/TopNavigation.vue';

// 数据状态
const data = ref<any[]>([]);
const indexCodes = ref<any[]>([]);
const selectedCode = ref('');
// 添加图表容器引用
const chartContainer = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

// 格式化函数
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

const formatNumber = (num: number | null) => {
  if (num === null || num === undefined) return '';
  return parseFloat(num.toString()).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3
  });
};

// API请求函数
const fetchData = async () => {
  try {
    const params = new URLSearchParams({
      indexCode: selectedCode.value
    });

    const response = await fetch(`http://localhost:3000/api/data/stock-index-data?${params}`);
    const result = await response.json();
    
    if (result.success) {
      data.value = result.data;
      // 数据更新后渲染图表
      await nextTick();
      renderChart();
    } else {
      console.error('获取数据失败:', result.message);
    }
  } catch (error) {
    console.error('请求失败:', error);
  }
};

const fetchIndexCodes = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/data/stock-index-codes');
    const result = await response.json();
    
    if (result.success) {
      indexCodes.value = result.data;
    } else {
      console.error('获取指数代码失败:', result.message);
    }
  } catch (error) {
    console.error('请求失败:', error);
  }
};

const selectIndex = (indexCode: string) => {
  selectedCode.value = indexCode;
  fetchData();
};

const selectAllIndices = () => {
  selectedCode.value = '';
  fetchData();
};

// 渲染ECharts图表
const renderChart = () => {
  if (!chartContainer.value) return;
  
  // 销毁之前的图表实例（如果存在）
  if (chartInstance) {
    chartInstance.dispose();
  }
  
  // 初始化图表
  chartInstance = echarts.init(chartContainer.value);
  
  // 准备图表数据
  const dates = data.value.map(item => item.candle_end_time);
  const openValues = data.value.map(item => item.open);
  const highValues = data.value.map(item => item.high);
  const lowValues = data.value.map(item => item.low);
  const closeValues = data.value.map(item => item.close);
  const volumes = data.value.map(item => item.volume);
  
  // 配置图表选项
  const option: any = {
    title: {
      text: '股票指数数据图表',
      subtext: selectedCode.value ? `指数代码: ${selectedCode.value}` : '全部数据',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: ['开盘价', '最高价', '最低价', '收盘价', '成交量'],
      top: '10%'
    },
    toolbox: {
      show: true,
      feature: {
        myTimeSelector: {
          show: true,
          title: '时间选择',
          icon: 'M17.5,18.5h-15v-15h15v15zM17.5,8.5h-2v-2h2v2zM17.5,18.5h-2v-2h2v2zM17.5,16.5h-2v-2h2v2zM17.5,14.5h-2v-2h2v2zM17.5,12.5h-2v-2h2v2zM17.5,10.5h-2v-2h2v2zM15.5,8.5h-2v-2h2v2zM15.5,18.5h-2v-2h2v2zM15.5,16.5h-2v-2h2v2zM15.5,14.5h-2v-2h2v2zM15.5,12.5h-2v-2h2v2zM13.5,8.5h-2v-2h2v2zM13.5,18.5h-2v-2h2v2zM13.5,16.5h-2v-2h2v2zM13.5,14.5h-2v-2h2v2zM11.5,8.5h-2v-2h2v2zM11.5,18.5h-2v-2h2v2zM11.5,16.5h-2v-2h2v2zM11.5,14.5h-2v-2h2v2zM9.5,8.5h-2v-2h2v2zM9.5,18.5h-2v-2h2v2zM9.5,16.5h-2v-2h2v2zM9.5,14.5h-2v-2h2v2zM7.5,8.5h-2v-2h2v2zM7.5,18.5h-2v-2h2v2zM7.5,16.5h-2v-2h2v2zM7.5,14.5h-2v-2h2v2zM5.5,8.5h-2v-2h2v2zM5.5,18.5h-2v-2h2v2zM5.5,16.5h-2v-2h2v2zM5.5,14.5h-2v-2h2v2z',
          onclick: function () {
            // 创建时间选择弹窗
            const timeRanges = [
              { label: '最近7天', value: 7 },
              { label: '最近30天', value: 30 },
              { label: '最近90天', value: 90 },
              { label: '最近1年', value: 365 },
              { label: '全部', value: 0 }
            ];
            
            // 生成选择菜单
            let menuHtml = '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:20px;border:1px solid #ccc;border-radius:5px;z-index:9999;">';
            menuHtml += '<h3>选择时间范围</h3>';
            timeRanges.forEach(range => {
              menuHtml += `<button onclick=\"selectTimeRange(${range.value})\" style=\"display:block;width:100%;padding:8px;margin:5px 0;border:1px solid #ddd;border-radius:4px;cursor:pointer;\">${range.label}</button>`;
            });
            menuHtml += '<button onclick="closeTimeMenu()" style="display:block;width:100%;padding:8px;margin:5px 0;background:#eee;border:1px solid #ddd;border-radius:4px;cursor:pointer;">取消</button>';
            menuHtml += '</div>';
            
            // 添加到页面
            const menuDiv = document.createElement('div');
            menuDiv.id = 'time-menu';
            menuDiv.innerHTML = menuHtml;
            menuDiv.style.position = 'fixed';
            menuDiv.style.top = '0';
            menuDiv.style.left = '0';
            menuDiv.style.width = '100%';
            menuDiv.style.height = '100%';
            menuDiv.style.backgroundColor = 'rgba(0,0,0,0.5)';
            menuDiv.style.zIndex = '9998';
            document.body.appendChild(menuDiv);
            
            // 添加全局函数
            (window as any).selectTimeRange = function(days: number) {
              // 这里应该根据天数来更新图表的dataZoom
              const startDate = new Date();
              if (days > 0) {
                startDate.setDate(startDate.getDate() - days);
              } else {
                // 如果是全部，则不设置开始日期
                startDate.setFullYear(1970); // 最早日期
              }
              
              const endDate = new Date();
              
              // 更新图表dataZoom
              if (chartInstance) {
                chartInstance.dispatchAction({
                  type: 'dataZoom',
                  startValue: startDate.getTime(),
                  endValue: endDate.getTime()
                });
              }
              
              // 关闭菜单
              (window as any).closeTimeMenu();
            };
            
            (window as any).closeTimeMenu = function() {
              const menu = document.getElementById('time-menu');
              if (menu) {
                document.body.removeChild(menu);
              }
            };
          }
        }
      }
    },
    dataZoom: [
      {
        type: 'inside', // 内置缩放器，支持鼠标滚轮缩放
        throttle: 100,
        start: 0,
        end: 100
      },
      {
        type: 'slider', // 滑动条缩放器
        show: true,
        realtime: true,
        start: 0,
        end: 100,
        height: 20,
        bottom: 30
      }
    ],
    animationDuration: 1000,
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '20%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'time',  // 设置为时间轴
        boundaryGap: false,
        name: '时间',
        axisLabel: {
          formatter: '{yyyy}-{MM}-{dd}'
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '价格',
        position: 'left',
        alignTicks: true
      },
      {
        type: 'value',
        name: '成交量',
        position: 'right',
        alignTicks: true
      }
    ],
    series: [
      {
        name: '开盘价',
        type: 'line',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: dates.map((date, index) => [date, openValues[index]]),
        smooth: true,
        lineStyle: {
          color: '#5470c6'
        }
      },
      {
        name: '最高价',
        type: 'line',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: dates.map((date, index) => [date, highValues[index]]),
        smooth: true,
        lineStyle: {
          color: '#91cc75'
        }
      },
      {
        name: '最低价',
        type: 'line',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: dates.map((date, index) => [date, lowValues[index]]),
        smooth: true,
        lineStyle: {
          color: '#fac858'
        }
      },
      {
        name: '收盘价',
        type: 'line',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: dates.map((date, index) => [date, closeValues[index]]),
        smooth: true,
        lineStyle: {
          color: '#ee6666'
        }
      },
      {
        name: '成交量',
        type: 'line',
        xAxisIndex: 0,
        yAxisIndex: 1,
        data: dates.map((date, index) => [date, volumes[index]]),
        smooth: true,
        lineStyle: {
          color: '#73c0de',
          width: 1
        },
        areaStyle: {
          opacity: 0.1
        }
      }
    ]
  };
  
  // 应用配置并渲染图表
  chartInstance.setOption(option);
};

// 组件挂载时获取数据
onMounted(() => {
  fetchIndexCodes();
  fetchData();
});

// 组件卸载时销毁图表实例
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
  }
});
</script>

<style scoped>
.data-management {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
}

.data-management > h1 {
  margin-top: 20px;
  margin-bottom: 30px;
}

.chart-section {
  margin-bottom: 30px;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.controls {
  margin-bottom: 20px;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.filter-section label {
  font-weight: bold;
}

.filter-section select, .filter-section input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
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

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover {
  background-color: #218838;
}

.btn-warning {
  background-color: #ffc107;
  color: #212529;
}

.btn-warning:hover {
  background-color: #e0a800;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.form-container {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-container h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}

.form-group {
  flex: 1;
  min-width: 200px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.data-content {
  display: flex;
  flex: 1;
  margin-top: 20px;
}

.sidebar {
  width: 250px;
  background-color: #f8f9fa;
  border-right: 1px solid #dee2e6;
  padding: 20px;
  min-height: calc(100vh - 100px);
  max-height: none;
  overflow-y: visible;
}

.sidebar h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #495057;
  font-size: 1.2rem;
}

.data-source-info {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size: 12px;
  color: #6c757d;
}

.data-source-info p {
  margin: 5px 0;
}

.index-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.index-btn {
  padding: 10px;
  border: 1px solid #ddd;
  background-color: #fff;
  border-radius: 4px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  font-size: 14px;
}

.index-btn:hover {
  background-color: #e9ecef;
}

.index-btn.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 为ECharts图表容器添加样式 */
.echart-container {
  width: 100%;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 10px;
  margin-top: 15px;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
  
  .form-group {
    min-width: auto;
  }
  
  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-section > * {
    margin: 5px 0;
  }
}
</style>