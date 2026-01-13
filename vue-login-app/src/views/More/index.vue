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
    display: flex;
    flex-direction: column;
    background: #f5f7fa;
    flex: 1;
}

.content-area {
    flex: 1;
    width: 100%;
}
</style>
