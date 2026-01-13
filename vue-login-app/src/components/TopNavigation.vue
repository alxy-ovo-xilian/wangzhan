<template>
    <nav class="top-navigation">
        <div class="nav-container">
            <!-- 左侦空白 -->
            <div class="logo-space"></div>
            
            <!-- 中间导航菜单 -->
            <div class="nav-menu" v-show="!searchActive">
                <template v-for="page in pages" :key="page.id">
                    <!-- 带下拉菜单的导航项 -->
                    <div v-if="page.dropdown" class="dropdown" @mouseenter="showDropdown = page.id" @mouseleave="handleMouseLeave">
                        <a class="nav-link" :class="{ 'active': (page.id === 7 && isRegionActive) || (page.id === 8 && isMoreActive) }">
                            {{ page.name }}
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 4px;">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </a>
                        <div v-show="showDropdown === page.id" class="dropdown-menu" @mouseenter="cancelHideDropdown" @mouseleave="handleMouseLeave">
                            <a v-for="item in page.dropdown" :key="item.name" @click="handleRegionNavigate(item.path)" class="dropdown-item">
                                {{ item.name }}
                            </a>
                        </div>
                    </div>
                    <!-- 普通导航项 -->
                    <a v-else @click="handleNavigate(page.path)" class="nav-link" :class="{ 'active': currentPath === page.path }">
                        {{ page.name }}
                    </a>
                </template>
            </div>
            
            <!-- 搜索输入框 -->
            <div class="search-input-container" v-show="searchActive">
                <div class="search-input-wrapper">
                    <input 
                        ref="searchInputRef"
                        v-model="searchQuery"
                        type="text" 
                        class="search-input" 
                        placeholder="请输入数据关键词"
                        @keyup.enter="handleSearch"
                        @blur="handleSearchBlur"
                    />
                    <button class="search-submit-btn" @click="handleSearch">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                            <circle cx="10" cy="10" r="7"></circle>
                            <path d="m15 15 6 6"></path>
                        </svg>
                    </button>
                </div>
            </div>
            
            <!-- 右侧功能区 -->
            <div class="nav-actions">
                <button class="search-btn-text" @click="toggleSearch" v-show="!searchActive">
                    搜索
                </button>
                
                <!-- 用户下拉菜单 -->
                <div class="user-dropdown">
                    <button class="icon-btn user-btn" @click="toggleUserDropdown" ref="userBtnRef">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </button>
                    
                    <div v-show="showUserDropdown" class="user-dropdown-menu" @click="closeUserDropdown">
                        <a class="user-dropdown-item" @click="navigateToMyCharts">
                            我的图表
                        </a>
                        <a class="user-dropdown-item" @click="navigateToMyArticles">
                            我的文章
                        </a>
                        <a class="user-dropdown-item" @click="navigateToAccountSettings">
                            账号设置
                        </a>
                        <a class="user-dropdown-item" @click="handleLogout">
                            退出
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { computed, ref, nextTick, onUnmounted } from 'vue'

const router = useRouter()
const route = useRoute()

const currentPath = computed(() => route.path)
const showDropdown = ref<number | null>(null)
let hideTimeout: ReturnType<typeof setTimeout> | null = null

// 搜索相关
const searchActive = ref(false)
const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null);

// 用户下拉菜单相关
const showUserDropdown = ref(false);
const userBtnRef = ref<HTMLElement | null>(null);

// 判断是否在区域相关页面
const isRegionActive = computed(() => {
    return currentPath.value === '/region' || 
           currentPath.value.startsWith('/region/')
})

// 判断是否在更多相关页面
const isMoreActive = computed(() => {
    return currentPath.value === '/more' || 
           currentPath.value.startsWith('/more/')
})

const pages = [
    { id: 1, name: '首页', path: '/home' },
    { id: 2, name: '数据', path: '/data' },
    { id: 3, name: '日历', path: '/calendar' },
    { id: 4, name: '课程', path: '/course' },
    { id: 5, name: '系列文章', path: '/series' },
    { id: 6, name: '图表', path: '/chart' },
    { 
        id: 7, 
        name: '按国家/地区', 
        path: '/region',
        dropdown: [
            { name: '全球经济', path: '/region/global' },
            { name: '地区经济', path: '/region/area' },
            { name: '城市经济', path: '/region/city' },
            { name: '国家/地区', path: '/region/country' },
            { name: '排行榜', path: '/region/ranking' },
            { name: '地区排名', path: '/region/area-ranking' },
            { name: '动态图表', path: '/region/dynamic-chart' }
        ]
    },
    { 
        id: 8, 
        name: '更多', 
        path: '/more',
        dropdown: [
            { name: '宏观经济', path: '/more/macro' },
            { name: '产业经济', path: '/more/industry' },
            { name: '图表制作', path: '/more/chart-maker' }
        ]
    }
]

const handleNavigate = (path: string) => {
    router.push(path)
}

const handleMouseLeave = () => {
    // 延迟隐藏下拉菜单，给用户点击时间
    hideTimeout = setTimeout(() => {
        showDropdown.value = null
    }, 200)
}

const cancelHideDropdown = () => {
    // 取消隐藏延迟
    if (hideTimeout) {
        clearTimeout(hideTimeout)
        hideTimeout = null
    }
}

const handleRegionNavigate = (path: string) => {
    showDropdown.value = null
    router.push(path)
}

const handleLogout = () => {
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    router.push('/login')
}

// 搜索相关方法
const toggleSearch = async () => {
    searchActive.value = !searchActive.value
    if (searchActive.value) {
        await nextTick()
        searchInputRef.value?.focus()
    } else {
        searchQuery.value = ''
    }
}

const handleSearch = () => {
    if (searchQuery.value.trim()) {
        console.log('搜索:', searchQuery.value)
        // TODO: 实现搜索逻辑
    }
}

const handleSearchBlur = () => {
    setTimeout(() => {
        if (!searchQuery.value) {
            searchActive.value = false
        }
    }, 200)
}

// 用户下拉菜单功能
const toggleUserDropdown = () => {
    showUserDropdown.value = !showUserDropdown.value;
};

const closeUserDropdown = (event: Event) => {
    event.stopPropagation();
};

const navigateToMyCharts = () => {
    showUserDropdown.value = false;
    router.push('/chart');
};

const navigateToMyArticles = () => {
    showUserDropdown.value = false;
    router.push('/series');
};

const navigateToAccountSettings = () => {
    showUserDropdown.value = false;
    // 这里可以添加到账户设置的路由，如果存在的话
    // 暂时跳转到个人资料页或保持在当前页
    console.log('前往账号设置');
};

// 点击外部关闭下拉菜单
const handleClickOutside = (event: MouseEvent) => {
    if (userBtnRef.value && !userBtnRef.value.contains(event.target as Node)) {
        showUserDropdown.value = false;
    }
};

// 监听文档点击事件
if (typeof window !== 'undefined') {
    window.addEventListener('click', handleClickOutside);
}

// 组件卸载时移除事件监听器
onUnmounted(() => {
    if (typeof window !== 'undefined') {
        window.removeEventListener('click', handleClickOutside);
    }
})
</script>

<style scoped>
/* 顶部导航栏样式 */
.top-navigation {
    width: 100%;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    position: sticky;
    top: 0;
    z-index: 1000;
}

.nav-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
}

/* 左侧空白占位 */
.logo-space {
    width: 150px;
    flex-shrink: 0;
}

/* 中间导航菜单 */
.nav-menu {
    display: flex;
    align-items: center;
    gap: 30px;
    flex: 1;
    justify-content: center;
}

/* 搜索输入框容器 */
.search-input-container {
    flex: 1;
    display: flex;
    align-items: center;
    max-width: 500px;
    margin: 0 auto;
    padding-left: 150px; /* 增加左边距 */
}

.search-input-wrapper {
    display: flex;
    align-items: center;
    width: 100%;
}

.search-input {
    flex: 1;
    height: 40px;
    padding: 0 20px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.3s;
}

.search-input:focus {
    border-color: #00a0e9;
}

.search-input::placeholder {
    color: #999;
}

.search-submit-btn {
    width: 40px;
    height: 40px;
    margin-left: 10px;
    border: none;
    background: transparent;
    color: #666;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.3s;
}

.search-submit-btn:hover {
    color: #00a0e9;
}

/* 下拉菜单容器 */
.dropdown {
    position: relative;
    display: inline-block;
}

.nav-link {
    position: relative;
    color: #333;
    font-size: 15px;
    font-weight: 400;
    text-decoration: none;
    cursor: pointer;
    transition: color 0.3s ease;
    white-space: nowrap;
    padding: 18px 0;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.nav-link:hover {
    color: #00a0e9;
}

.nav-link.active {
    color: #333;
    font-weight: 500;
}

.nav-link.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: #00a0e9;
}

/* 下拉菜单样式 */
.dropdown-menu {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    min-width: 180px;
    padding: 8px 0;
    margin-top: 5px;
    z-index: 1000;
}

.dropdown-item {
    display: block;
    padding: 12px 20px;
    color: #333;
    font-size: 14px;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.2s ease;
    white-space: nowrap;
}

.dropdown-item:hover {
    background: #f5f7fa;
    color: #00a0e9;
}

/* 右侧功能区 */
.nav-actions {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-shrink: 0;
}

.icon-btn {
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    color: #666;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s ease;
}

.icon-btn:hover {
    background: #f0f0f0;
    color: #333;
}

.search-btn {
    color: #333 !important;
}

.search-btn:hover {
    color: #00a0e9 !important;
}

.user-btn {
    background: #00a0e9;
    color: white;
}

.search-btn-text {
    border: none;
    background: transparent;
    color: #666;
    font-size: 14px;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 4px;
    transition: all 0.3s ease;
}

.search-btn-text:hover {
    background: #f0f0f0;
    color: #333;
}

.user-btn:hover {
    background: #0090d1;
    color: white;
}

/* 用户下拉菜单 */
.user-dropdown {
    position: relative;
    display: inline-block;
}

.user-dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    min-width: 180px;
    padding: 8px 0;
    margin-top: 5px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
}

.user-dropdown-item {
    display: block;
    padding: 12px 20px;
    color: #333;
    font-size: 14px;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.2s ease;
    white-space: nowrap;
}

.user-dropdown-item:hover {
    background: #f5f7fa;
    color: #00a0e9;
}

/* 响应式设计 */
@media (max-width: 1200px) {
    .nav-menu {
        gap: 20px;
    }
    
    .nav-link {
        font-size: 14px;
    }
}

@media (max-width: 992px) {
    .nav-container {
        padding: 0 20px;
    }
    
    .nav-menu {
        gap: 15px;
    }
    
    .logo-space {
        width: 100px;
    }
}

@media (max-width: 768px) {
    .nav-container {
        height: auto;
        flex-wrap: wrap;
        padding: 10px 20px;
    }
    
    .logo-space {
        order: 1;
        width: 50px;
    }
    
    .nav-actions {
        order: 2;
    }
    
    .nav-menu {
        order: 3;
        width: 100%;
        justify-content: flex-start;
        overflow-x: auto;
        gap: 20px;
        padding: 10px 0;
    }
    
    .nav-link {
        font-size: 13px;
    }
}

@media (max-width: 480px) {
    .nav-menu {
        gap: 15px;
    }
    
    .nav-link {
        font-size: 12px;
    }
    
    .logo-space {
        width: 20px;
    }
}
</style>
