<template>
    <div class="page-wrapper">
        <TopNavigation />
        
        <div class="content-area">
            <div class="calendar-container">
                <!-- 标题栏 -->
                <div class="calendar-header">
                    <button class="nav-btn" @click="prevMonth">
                        &lt; 上月
                    </button>
                    <h1 class="calendar-title">{{ currentYear }}年{{ currentMonth }}月财经日历</h1>
                    <button class="nav-btn" @click="nextMonth">
                        下月 &gt;
                    </button>
                </div>

                <!-- 星期表头 -->
                <div class="weekdays">
                    <div class="weekday" v-for="day in weekdays" :key="day">{{ day }}</div>
                </div>

                <!-- 日历网格 -->
                <div class="calendar-grid">
                    <div 
                        class="calendar-cell" 
                        v-for="(day, index) in calendarDays" 
                        :key="index"
                        :class="{
                            'empty': !day.date,
                            'today': day.isToday
                        }"
                    >
                        <div class="date-number" v-if="day.date">
                            {{ String(day.date).padStart(2, '0') }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TopNavigation from '../../components/TopNavigation.vue'

// 当前年月
const currentDate = ref(new Date())
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth() + 1)

// 星期表头
const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

// 生成日历数据
const calendarDays = computed(() => {
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()
    
    // 获取当月第一天和最后一天
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // 获取当月第一天是星期几（0=周日，1=周一...）
    let firstDayOfWeek = firstDay.getDay()
    // 转换为周一为第一天（0=周一，6=周日）
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
    
    // 获取当月天数
    const daysInMonth = lastDay.getDate()
    
    const days = []
    
    // 填充空白天数
    for (let i = 0; i < firstDayOfWeek; i++) {
        days.push({ date: null, isToday: false })
    }
    
    // 填充当月天数
    const today = new Date()
    for (let i = 1; i <= daysInMonth; i++) {
        const isToday = 
            year === today.getFullYear() && 
            month === today.getMonth() && 
            i === today.getDate()
        
        days.push({
            date: i,
            isToday
        })
    }
    
    return days
})

// 切换月份
const prevMonth = () => {
    const newDate = new Date(currentDate.value)
    newDate.setMonth(newDate.getMonth() - 1)
    currentDate.value = newDate
}

const nextMonth = () => {
    const newDate = new Date(currentDate.value)
    newDate.setMonth(newDate.getMonth() + 1)
    currentDate.value = newDate
}
</script>

<style scoped>
.page-wrapper {
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

.calendar-container {
    max-width: 1400px;
    margin: 0 auto;
    background: white;
    border-radius: 8px;
    padding: 30px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 标题栏 */
.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid #e8e8e8;
}

.calendar-title {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin: 0;
}

.nav-btn {
    padding: 8px 20px;
    font-size: 14px;
    color: #666;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
}

.nav-btn:hover {
    color: #333;
    border-color: #999;
    background: #f9f9f9;
}

/* 星期表头 */
.weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    background: #e8e8e8;
    border: 1px solid #e8e8e8;
    margin-bottom: 1px;
}

.weekday {
    padding: 15px;
    text-align: center;
    font-size: 15px;
    font-weight: 600;
    color: #666;
    background: #fafafa;
}

/* 日历网格 */
.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    background: #e8e8e8;
    border: 1px solid #e8e8e8;
    min-height: 600px;
}

.calendar-cell {
    background: white;
    min-height: 120px;
    padding: 10px;
    position: relative;
    transition: background-color 0.2s;
}

.calendar-cell:hover:not(.empty) {
    background: #f9f9f9;
}

.calendar-cell.empty {
    background: #fafafa;
}

.calendar-cell.today {
    background: #fff7e6;
}

.date-number {
    font-size: 18px;
    font-weight: 500;
    color: #333;
    text-align: right;
    margin-bottom: 8px;
}

.calendar-cell.today .date-number {
    color: #ff6b00;
    font-weight: 600;
}
</style>
