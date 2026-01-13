<template>
  <footer class="global-footer">
    <div class="footer-content">
      <p>&copy; 2026 Vue Login App. All Rights Reserved.</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Footer component script
</script>

<style scoped>
.global-footer {
  background-color: #000000;
  color: white;
  text-align: center;
  padding: 25px 0;
  margin-top: auto;
  width: 100%;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
}

.global-footer p {
  margin: 0;
  font-size: 14px;
  color: #aaa;
  letter-spacing: 0.5px;
}

@media (max-width: 768px) {
  .footer-content {
    padding: 0 20px;
  }
  
  .global-footer p {
    font-size: 12px;
  }
}
</style>