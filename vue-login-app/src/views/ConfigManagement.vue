<template>
  <div class="config-management">
    <div class="header">
      <h2>系统配置管理</h2>
      <p>动态管理所有系统配置，无需代码修改</p>
    </div>

    <div class="toolbar">
      <button class="btn btn-primary" @click="loadConfigs">刷新配置</button>
      <button class="btn btn-success" @click="openAddConfig">添加配置</button>
      <button class="btn btn-info" @click="refreshCache">刷新缓存</button>
    </div>

    <div class="filter-section">
      <input 
        type="text" 
        v-model="searchTerm" 
        placeholder="搜索配置..." 
        class="search-input"
      />
      <select v-model="selectedModule" class="module-select">
        <option value="">所有模块</option>
        <option v-for="module in modules" :key="module" :value="module">
          {{ module }}
        </option>
      </select>
    </div>

    <div class="config-list">
      <div 
        v-for="config in filteredConfigs" 
        :key="config.config_key" 
        class="config-item"
      >
        <div class="config-header">
          <div class="config-info">
            <h4>{{ config.config_name || config.config_key }}</h4>
            <p class="config-key">键: {{ config.config_key }}</p>
            <p class="config-desc">{{ config.config_desc }}</p>
            <p class="config-module">模块: {{ config.module_name || '通用' }}</p>
          </div>
          <div class="config-actions">
            <button 
              class="btn btn-sm btn-warning" 
              @click="editConfig(config)"
              :disabled="!config.editable"
            >
              编辑
            </button>
          </div>
        </div>
        <div class="config-value">
          <div v-if="config.config_type === 'boolean'" class="boolean-toggle">
            <label class="switch">
              <input 
                type="checkbox" 
                :checked="config.config_value === 'true'"
                @change="toggleBooleanValue(config)"
              />
              <span class="slider"></span>
            </label>
            <span>{{ config.config_value === 'true' ? '开启' : '关闭' }}</span>
          </div>
          <div v-else-if="config.config_type === 'number'" class="number-input">
            <input 
              type="number" 
              :value="config.config_value"
              @change="(event) => updateNumberValue(config, event)"
            />
          </div>
          <div v-else class="text-input">
            <input 
              type="text" 
              :value="config.config_value"
              @change="(event) => updateTextValue(config, event)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑配置模态框 -->
    <div class="modal" v-if="addConfigModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingConfig ? '编辑配置' : '添加配置' }}</h3>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>配置键:</label>
            <input 
              type="text" 
              v-model="newConfig.key" 
              :disabled="editingConfig"
              placeholder="例如: login.captcha.enabled"
            />
          </div>
          <div class="form-group">
            <label>配置名称:</label>
            <input 
              type="text" 
              v-model="newConfig.name" 
              placeholder="例如: 登录验证码开关"
            />
          </div>
          <div class="form-group">
            <label>配置值:</label>
            <input 
              type="text" 
              v-model="newConfig.value" 
              placeholder="配置的具体值"
            />
          </div>
          <div class="form-group">
            <label>配置类型:</label>
            <select v-model="newConfig.type">
              <option value="string">字符串</option>
              <option value="number">数字</option>
              <option value="boolean">布尔值</option>
              <option value="json">JSON</option>
            </select>
          </div>
          <div class="form-group">
            <label>所属模块:</label>
            <select v-model="newConfig.module">
              <option value="">通用</option>
              <option value="auth">认证模块</option>
              <option value="data">数据模块</option>
              <option value="ui">界面模块</option>
              <option value="security">安全模块</option>
            </select>
          </div>
          <div class="form-group">
            <label>描述:</label>
            <textarea 
              v-model="newConfig.description" 
              placeholder="配置的详细描述"
            ></textarea>
          </div>
          <div class="form-group">
            <label>
              <input 
                type="checkbox" 
                v-model="newConfig.editable" 
              />
              是否可编辑
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">取消</button>
          <button 
            class="btn btn-primary" 
            @click="saveConfig"
            :disabled="!canSaveConfig"
          >
            {{ editingConfig ? '更新' : '添加' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { configApi } from '@/api/configApi';

// 响应式数据
const configs = ref<any[]>([]);
const searchTerm = ref('');
const selectedModule = ref('');
const addConfigModal = ref(false);
const editingConfig = ref<any>(null);
const modules = ref<string[]>([]);

// 新配置对象
const newConfig = ref({
  key: '',
  value: '',
  name: '',
  description: '',
  type: 'string',
  module: '',
  editable: true
});

// 计算属性
const filteredConfigs = computed(() => {
  return configs.value.filter(config => {
    const matchesSearch = config.config_key.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
                         (config.config_name && config.config_name.toLowerCase().includes(searchTerm.value.toLowerCase()));
    const matchesModule = !selectedModule.value || config.module_name === selectedModule.value;
    return matchesSearch && matchesModule;
  });
});

const canSaveConfig = computed(() => {
  return newConfig.value.key && newConfig.value.value;
});

// 方法
const loadConfigs = async () => {
  try {
    const result = await configApi.getConfigDetails();
    if (result.success) {
      configs.value = result.data;
      modules.value = [...new Set(result.data.map((c: any) => c.module_name).filter((m: any) => m) as string[])];
    }
  } catch (error) {
    console.error('加载配置失败:', error);
    alert('加载配置失败: ' + (error as Error).message);
  }
};

const refreshCache = async () => {
  try {
    const result = await configApi.refreshConfigCache();
    if (result.success) {
      alert('配置缓存刷新成功');
      loadConfigs();
    } else {
      alert(result.message || '刷新缓存失败');
    }
  } catch (error) {
    console.error('刷新缓存失败:', error);
    alert('刷新缓存失败: ' + (error as Error).message);
  }
};

const openAddConfig = () => {
  editingConfig.value = null;
  newConfig.value = {
    key: '',
    value: '',
    name: '',
    description: '',
    type: 'string',
    module: '',
    editable: true
  };
  addConfigModal.value = true;
};

const editConfig = (config: any) => {
  editingConfig.value = config;
  newConfig.value = {
    key: config.config_key,
    value: config.config_value,
    name: config.config_name || '',
    description: config.config_desc || '',
    type: config.config_type || 'string',
    module: config.module_name || '',
    editable: config.editable !== false
  };
  addConfigModal.value = true;
};

const closeModal = () => {
  addConfigModal.value = false;
  editingConfig.value = null;
  newConfig.value = {
    key: '',
    value: '',
    name: '',
    description: '',
    type: 'string',
    module: '',
    editable: true
  };
};

const saveConfig = async () => {
  try {
    let result;
    
    if (editingConfig.value) {
      // 更新配置
      result = await configApi.updateConfig(newConfig.value.key, newConfig.value.value);
    } else {
      // 添加配置
      result = await configApi.addConfig({
        key: newConfig.value.key,
        value: newConfig.value.value,
        name: newConfig.value.name,
        description: newConfig.value.description,
        type: newConfig.value.type,
        module: newConfig.value.module
      });
    }
    
    if (result.success) {
      alert(editingConfig.value ? '配置更新成功' : '配置添加成功');
      closeModal();
      loadConfigs();
    } else {
      alert(result.message || '操作失败');
    }
  } catch (error) {
    console.error('保存配置失败:', error);
    alert('保存配置失败: ' + (error as Error).message);
  }
};

const toggleBooleanValue = async (config: any) => {
  const newValue = config.config_value === 'true' ? 'false' : 'true';
  await updateConfigValue(config.config_key, newValue);
  // 更新本地数据
  config.config_value = newValue;
};

const updateNumberValue = (config: any, event: Event) => {
  const target = event.target as HTMLInputElement;
  updateConfigValue(config.config_key, target.value);
  // 更新本地数据
  config.config_value = target.value;
};

const updateTextValue = (config: any, event: Event) => {
  const target = event.target as HTMLInputElement;
  updateConfigValue(config.config_key, target.value);
  // 更新本地数据
  config.config_value = target.value;
};

const updateConfigValue = async (key: string, value: string) => {
  try {
    const result = await configApi.updateConfig(key, value);
    if (!result.success) {
      alert(result.message || '更新失败');
      // 重新加载数据以恢复原始值
      loadConfigs();
      throw new Error('Update failed');
    }
  } catch (error) {
    console.error('更新配置值失败:', error);
  }
};

// 初始化
onMounted(() => {
  loadConfigs();
});
</script>

<style scoped>
.config-management {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h2 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-success {
  background-color: #27ae60;
  color: white;
}

.btn-info {
  background-color: #9b59b6;
  color: white;
}

.btn-warning {
  background-color: #f39c12;
  color: white;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn:hover:not(:disabled) {
  opacity: 0.8;
}

.filter-section {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-input, .module-select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

.module-select {
  width: 150px;
}

.config-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.config-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background-color: #fff;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 10px;
}

.config-info h4 {
  margin: 0 0 5px 0;
  color: #2c3e50;
}

.config-key, .config-module {
  font-family: monospace;
  color: #7f8c8d;
  font-size: 12px;
  margin: 0 0 5px 0;
}

.config-desc {
  color: #95a5a6;
  font-size: 14px;
  margin: 0;
}

.config-actions {
  display: flex;
  gap: 5px;
}

.config-value {
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.boolean-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Switch 开关样式 */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #27ae60;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.number-input input, .text-input input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

/* 模态框样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #95a5a6;
}

.modal-body {
  padding: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #2c3e50;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.modal-footer {
  padding: 15px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .config-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .config-actions {
    justify-content: flex-end;
  }
  
  .filter-section {
    flex-direction: column;
  }
  
  .search-input {
    min-width: auto;
  }
}
</style>