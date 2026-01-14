import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

// 添加路由守卫以保护需要认证的页面
router.beforeEach((to, from, next) => {
  // 需要认证的页面
  const requiresAuth = ['/home', '/data', '/calendar', '/course', '/series', '/chart', '/region', '/region/global', '/region/area', '/region/city', '/region/country', '/region/ranking', '/region/area-ranking', '/region/dynamic-chart', '/more', '/more/macro', '/more/industry', '/more/chart-maker', '/config']
  
  // 检查用户是否已认证
  const isAuthenticated = !!localStorage.getItem('authToken')
  
  if (requiresAuth.includes(to.path) && !isAuthenticated) {
    // 如果用户未认证且尝试访问受保护的页面，重定向到登录页
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
    // 如果用户已认证但尝试访问登录或注册页，重定向到首页
    next('/home')
  } else {
    // 否则允许访问
    next()
  }
})

app.use(router)
app.mount('#app')