<script setup lang="ts">
import Footer from './components/Footer.vue'
</script>

<template>
  <div class="app-container">
    <router-view></router-view>
    <Footer />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom, #f5f7fa 0%, #c3cfe2 100%);
}
</style>
