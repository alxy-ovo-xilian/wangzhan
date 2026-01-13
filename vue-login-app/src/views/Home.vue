<template>
    <div class="home-wrapper">
        <TopNavigation />
        
        <!-- 空白内容区域 -->
        <div class="content-area">
            <div class="home-container">
                <!-- 主要内容区域 -->
                <div class="main-content">
                    <!-- 左侧4个大模块垂直堆叠 -->
                    <div class="section left-modules">
                        <div class="modules-stack">
                            <div 
                                class="module-card large-module module-1" 
                                :class="{ 'color-red': currentColorIndex === 0, 'color-yellow': currentColorIndex === 1, 'color-blue': currentColorIndex === 2 }"
                            >
                                模块 1 - {{ colors[currentColorIndex] }}
                                <div class="color-indicator">当前: {{ colors[currentColorIndex] }}</div>
                                <div class="color-buttons">
                                    <button class="color-btn red-btn" @click="setColor(0)" title="红色"></button>
                                    <button class="color-btn yellow-btn" @click="setColor(1)" title="黄色"></button>
                                    <button class="color-btn blue-btn" @click="setColor(2)" title="蓝色"></button>
                                </div>
                            </div>
                            <div class="module-card large-module module-2">模块 2</div>
                            <div class="module-card large-module module-3">模块 3</div>
                            <div class="module-card large-module module-4">模块 4</div>
                        </div>
                    </div>
                    
                    <!-- 右侧2个模块，分为上下两部分 -->
                    <div class="section right-modules">
                        <div class="right-modules-container">
                            <!-- 右侧上面的小模块 -->
                            <div class="module-card small-module module-5">模块 5</div>
                            <!-- 右侧下面的大模块 -->
                            <div class="module-card large-module module-6">模块 6</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import TopNavigation from '../components/TopNavigation.vue'

// 颜色切换功能
const colors = ['红色', '黄色', '蓝色']
const currentColorIndex = ref(0)
let intervalId: number | null = null

// 切换到下一个颜色（用于自动切换）
const nextAutoColor = () => {
  currentColorIndex.value = (currentColorIndex.value + 1) % colors.length
}

// 手动切换颜色
const manualNextColor = () => {
  currentColorIndex.value = (currentColorIndex.value + 1) % colors.length
}

// 设置指定颜色
const setColor = (index: number) => {
  currentColorIndex.value = index
}

// 启动颜色切换定时器
onMounted(() => {
  intervalId = window.setInterval(() => {
    nextAutoColor()
  }, 3000) // 每3秒切换一次颜色
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<style scoped>
.home-wrapper {
    display: flex;
    flex-direction: column;
    background: #f5f7fa;
    flex: 1;
}

.content-area {
    flex: 1;
    width: 100%;
    padding: 20px;
}

.home-container {
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
}

.section {
    background: white;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}



.main-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;
    min-height: calc(100vh - 100px); /* 使用最小高度而不是固定高度，确保内容可扩展 */
    flex: 1;
}

.left-modules {
    grid-column: 1;
    grid-row: 1;
    height: 100%;
}

.right-modules {
    grid-column: 2;
    grid-row: 1;
    height: 100%;
}

.right-modules-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 20px;
    gap: 15px;
}



.modules-stack {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 20px;
    height: 100%;
}

.modules-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    padding: 20px;
}

.module-card {
    background: #f8f9fa;
    border: 1px solid #eee;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
    color: #666;
    position: relative;
}

.module-1 {
    transition: background-color 0.8s ease, color 0.8s ease;
}

.module-1.color-red {
    background: #ffcccc;
    color: #cc0000;
}

.module-1.color-yellow {
    background: #ffffcc;
    color: #cccc00;
}

.module-1.color-blue {
    background: #cceeff;
    color: #0066cc;
}

.color-indicator {
    position: absolute;
    bottom: 10px;
    left: 10px;
    font-size: 14px;
    font-weight: normal;
    color: #333;
    background: rgba(255, 255, 255, 0.7);
    padding: 2px 6px;
    border-radius: 4px;
    transition: all 0.3s ease;
}

.color-switch-btn {
    position: absolute;
    bottom: 10px;
    right: 10px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.8);
    color: #333;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    z-index: 10;
}

.color-buttons {
    position: absolute;
    bottom: 10px;
    right: 10px;
    display: flex;
    gap: 4px;
    z-index: 10;
}

.color-btn {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    border: 1px solid #000;
    background-color: transparent;
    font-size: 12px;
    color: #000;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.color-btn:hover {
    background-color: #000;
    color: #fff;
    transform: scale(1.1);
}

.red-btn {
    background-color: #ffcccc;
}

.yellow-btn {
    background-color: #ffffcc;
}

.blue-btn {
    background-color: #cceeff;
}

.large-module {
    height: 200px;
}


.small-module {
    height: 100px;
}

.modules-stack {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 20px;
}



/* 响应式布局 */
@media (min-width: 1024px) {
    .home-container {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 20px;
    }
    
    .main-content {
        grid-column: 1 / span 2;
    }
    

}
</style>
