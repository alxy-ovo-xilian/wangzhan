<template>
    <div class="page-wrapper">
        <TopNavigation />
        
        <div class="content-area">
            <div class="series-container">
                <div class="series-content">
                    <!-- 左侧分类导航 -->
                    <aside class="category-sidebar">
                        <div 
                            v-for="category in categories" 
                            :key="category.id"
                            class="category-item"
                            :class="{ 'active': selectedCategory === category.id }"
                            @click="selectedCategory = category.id"
                        >
                            {{ category.name }}
                        </div>
                    </aside>
                    
                    <!-- 右侧文章列表 -->
                    <main class="article-list">
                        <h1 class="page-title">MacroView系列文章</h1>
                        
                        <div class="article-items">
                            <!-- 文章列表内容区域 -->
                        </div>
                    </main>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import TopNavigation from '../../components/TopNavigation.vue'
import { ref } from 'vue'

// 分类列表
const categories = ref([
    { id: 1, name: '微观经济学' },
    { id: 2, name: '宏观经济学' },
    { id: 3, name: '投资学' },
    { id: 4, name: '其他' }
])

// 当前选中的分类
const selectedCategory = ref(1)
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

.series-container {
    max-width: 1400px;
    margin: 0 auto;
}

.series-content {
    display: flex;
    gap: 0;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    min-height: 400px;
    flex: 1;
}

/* 左侧分类栏 */
.category-sidebar {
    width: 180px;
    background: #fafafa;
    border-right: 1px solid #e8e8e8;
    padding: 30px 0;
    flex-shrink: 0;
}

.category-item {
    padding: 18px 30px;
    font-size: 16px;
    color: #333;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
}

.category-item:hover {
    background: #f0f0f0;
    color: #00a0e9;
}

.category-item.active {
    background: white;
    color: #00a0e9;
    font-weight: 500;
}

.category-item.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: #00a0e9;
}

/* 右侧文章列表 */
.article-list {
    flex: 1;
    padding: 30px 40px;
    background: #fafafa;
}

.page-title {
    font-size: 28px;
    color: #333;
    margin-bottom: 30px;
    font-weight: 600;
    text-align: center;
}

.article-items {
    min-height: 500px;
    background: white;
    border-radius: 4px;
    padding: 20px;
}

/* 响应式设计 */
@media (max-width: 992px) {
    .category-sidebar {
        width: 160px;
    }
    
    .article-list {
        padding: 20px;
    }
}

@media (max-width: 768px) {
    .content-area {
        padding: 10px;
    }
    
    .category-sidebar {
        width: 140px;
        padding: 20px 0;
    }
    
    .category-item {
        padding: 15px 20px;
        font-size: 14px;
    }
    
    .page-title {
        font-size: 22px;
        margin-bottom: 20px;
    }
    
    .article-list {
        padding: 15px;
    }
    
    .article-items {
        padding: 15px;
    }
}
</style>
