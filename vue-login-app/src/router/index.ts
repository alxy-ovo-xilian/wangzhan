import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue')
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/data',
    name: 'Data',
    component: () => import('@/views/DataManagement.vue')
  },
  {
    path: '/data-old',
    name: 'DataOld',
    component: () => import('@/views/Data/index.vue')
  },
  {
    path: '/data-management',
    name: 'DataManagement',
    component: () => import('@/views/DataManagement.vue')
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('@/views/Calendar/index.vue')
  },
  {
    path: '/course',
    name: 'Course',
    component: () => import('@/views/Course/index.vue')
  },
  {
    path: '/series',
    name: 'Series',
    component: () => import('@/views/Series/index.vue')
  },
  {
    path: '/chart',
    name: 'Chart',
    component: () => import('@/views/Chart/index.vue')
  },
  {
    path: '/region',
    name: 'Region',
    component: () => import('@/views/Region/index.vue')
  },
  {
    path: '/region/global',
    name: 'RegionGlobal',
    component: () => import('@/views/Region/Global.vue')
  },
  {
    path: '/region/area',
    name: 'RegionArea',
    component: () => import('@/views/Region/Area.vue')
  },
  {
    path: '/region/city',
    name: 'RegionCity',
    component: () => import('@/views/Region/City.vue')
  },
  {
    path: '/region/country',
    name: 'RegionCountry',
    component: () => import('@/views/Region/Country.vue')
  },
  {
    path: '/region/ranking',
    name: 'RegionRanking',
    component: () => import('@/views/Region/Ranking.vue')
  },
  {
    path: '/region/area-ranking',
    name: 'RegionAreaRanking',
    component: () => import('@/views/Region/AreaRanking.vue')
  },
  {
    path: '/region/dynamic-chart',
    name: 'RegionDynamicChart',
    component: () => import('@/views/Region/DynamicChart.vue')
  },
  {
    path: '/more',
    name: 'More',
    component: () => import('@/views/More/index.vue')
  },
  {
    path: '/more/macro',
    name: 'MoreMacro',
    component: () => import('@/views/More/Macro.vue')
  },
  {
    path: '/more/industry',
    name: 'MoreIndustry',
    component: () => import('@/views/More/Industry.vue')
  },
  {
    path: '/more/chart-maker',
    name: 'MoreChartMaker',
    component: () => import('@/views/More/ChartMaker.vue')
  },
  {
    path: '/config',
    name: 'ConfigManagement',
    component: () => import('@/views/ConfigManagement.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
