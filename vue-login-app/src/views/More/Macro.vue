<template>
    <div class="page-wrapper">
        <TopNavigation />
        
        <div class="content-area">
        </div>
    </div>
</template>

<script setup lang="ts">
import TopNavigation from '../../components/TopNavigation.vue'
</script>

<style scoped>
.page-wrapper {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f5f7fa;
}

.content-area {
    flex: 1;
    width: 100%;
}
</style>
