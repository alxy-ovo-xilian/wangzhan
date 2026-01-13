<template>
    <div class="login-wrapper">
        <div class="login-container">
            <div class="form-header">
                <h2>用户登录</h2>
                <p>欢迎回来，请登录您的账号</p>
            </div>
            <form @submit.prevent="handleLogin" class="floating-form">
                <div class="input-group">
                    <input id="username" v-model.trim="loginForm.username" type="text" autocomplete="off" @input="validateInput" required />
                    <label for="username">用户名</label>
                    <span class="highlight"></span>
                </div>
                <div class="input-group">
                    <input id="password" v-model.trim="loginForm.password" type="password" autocomplete="off" @input="validateInput" required />
                    <label for="password">密码</label>
                    <span class="highlight"></span>
                </div>
                <div class="captcha-section" v-if="showCaptcha">
                    <div class="input-group captcha-input">
                        <input id="captcha" v-model.trim="loginForm.captcha" type="text" maxlength="4" autocomplete="off" required />
                        <label for="captcha">验证码</label>
                        <span class="highlight"></span>
                    </div>
                    <div class="captcha-image" @click="refreshCaptcha">
                        <img :src="captchaImage" alt="验证码" />
                        <span class="refresh-icon">🔄</span>
                    </div>
                </div>
                <div class="error-message" v-if="errorMsg">{{ errorMsg }}</div>
                <button type="submit" class="submit-btn" :disabled="!isFormValid || loading">
                    <span v-if="!loading">登录</span>
                    <span v-else>登录中...</span>
                    <i class="arrow-icon"></i>
                </button>
                <div class="form-footer">
                    <span>还没有账号？</span>
                    <a href="/register">立即注册</a>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 定义登录表单类型
interface LoginForm {
    username: string
    password: string
    captcha?: string
}

// 表单数据
const loginForm = reactive<LoginForm>({
    username: '',
    password: ''
})

const errorMsg = ref('')
const isFormValid = ref(false)
const showCaptcha = ref(false)
const captchaImage = ref('')
const captchaId = ref('')
const loading = ref(false)

// 刷新验证码
const refreshCaptcha = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/captcha')
        const result = await response.json()
        
        if (result.success) {
            captchaId.value = result.data.uuid
            // 在开发环境中显示真实验证码，生产环境显示星号
            captchaImage.value = `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='40'%3E%3Crect width='100' height='40' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='20' fill='%23333'%3E${result.data.captcha}%3C/text%3E%3C/svg%3E`
            showCaptcha.value = true
        }
    } catch (error) {
        console.error('获取验证码失败:', error)
    }
}

// 输入验证
const validateInput = () => {
    if (loginForm.username && loginForm.password) {
        if (showCaptcha.value && !loginForm.captcha) {
            isFormValid.value = false
            return
        }
        isFormValid.value = true
        errorMsg.value = ''
    } else {
        isFormValid.value = false
    }
}

// 设置错误消息
const setErrorMessage = (text: string) => {
    errorMsg.value = text
    setTimeout(() => {
        errorMsg.value = ''
    }, 3000)
}

// 登录处理
const handleLogin = async () => {
    if (!isFormValid.value) return
    
    loading.value = true
    
    try {
        // 基本的安全检查
        const xssPattern = /[<>]/g
        if (xssPattern.test(loginForm.username) || xssPattern.test(loginForm.password)) {
            setErrorMessage('警告:输入内容包含非法字符')
            return
        }

        // 发送登录请求
        const loginData: any = {
            username: loginForm.username,
            password: loginForm.password
        }
        
        // 如果显示验证码，则添加验证码信息
        if (showCaptcha.value && loginForm.captcha) {
            loginData.captcha = loginForm.captcha
            loginData.captchaId = captchaId.value
        }
        
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        })
        
        const result = await response.json()
        
        if (result.success) {
            // 存储认证令牌
            localStorage.setItem('authToken', result.data.token)
            localStorage.setItem('userInfo', JSON.stringify(result.data.user))
            
            // 跳转到主页
            router.push('/home')
        } else {
            setErrorMessage(result.message || '登录失败')
            // 如果是验证码错误或者失败次数过多，刷新验证码
            if (result.message.includes('验证码') || result.message.includes('错误')) {
                await refreshCaptcha()
            }
        }
    } catch (error) {
        setErrorMessage('网络错误，请稍后重试')
        console.error('登录请求失败:', error)
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    validateInput()
    // 页面加载时获取验证码
    await refreshCaptcha()
})
</script>

<style scoped>
.login-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 20px;
    flex: 1;
}

.login-container {
    width: 100%;
    max-width: 480px;
    background: white;
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.form-header {
    text-align: center;
    margin-bottom: 40px;
}

.form-header h2 {
    color: #2c3e50;
    font-size: 32px;
    margin-bottom: 10px;
    font-weight: 700;
}

.form-header p {
    color: #95a5a6;
    font-size: 16px;
}

.floating-form .input-group {
    position: relative;
    margin-bottom: 30px;
}

.input-group input {
    width: 100%;
    padding: 15px;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    font-size: 16px;
    transition: all 0.3s ease;
    background: transparent;
}

.captcha-section {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 30px;
}

.captcha-input {
    flex: 1;
    margin-bottom: 0;
}

.captcha-image {
    position: relative;
    width: 100px;
    height: 50px;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
}

.captcha-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.refresh-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.captcha-image:hover .refresh-icon {
    opacity: 1;
}

.input-group label {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    background: white;
    padding: 0 5px;
    color: #95a5a6;
    font-size: 16px;
    transition: all 0.3s ease;
    pointer-events: none;
}

.input-group input:focus,
.input-group input:valid {
    border-color: #3498db;
}

.input-group input:focus + label,
.input-group input:valid + label {
    top: 0;
    font-size: 14px;
    color: #3498db;
}

.submit-btn {
    width: 100%;
    padding: 15px;
    background: linear-gradient(to right, #3498db, #2980b9);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
}

.submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.arrow-icon {
    border: solid white;
    border-width: 0 2px 2px 0;
    display: inline-block;
    padding: 3px;
    transform: rotate(-45deg);
}

.form-footer {
    text-align: center;
    margin-top: 20px;
    color: #95a5a6;
}

.form-footer a {
    color: #3498db;
    text-decoration: none;
    margin-left: 5px;
    font-weight: 600;
}

.form-footer a:hover {
    text-decoration: underline;
}

.error-message {
    color: #f56c6c;
    font-size: 14px;
    text-align: center;
    margin-bottom: 20px;
}

@media (max-width: 768px) {
    .login-container {
        max-width: 400px;
        padding: 30px;
    }

    .form-header h2 {
        font-size: 28px;
    }

    .form-header p {
        font-size: 14px;
    }
}

@media (max-width: 480px) {
    .login-container {
        padding: 20px;
        margin: 10px;
        max-width: 100%;
    }

    .form-header h2 {
        font-size: 24px;
    }

    .form-header p {
        font-size: 14px;
    }

    .input-group input {
        padding: 12px;
        font-size: 14px;
    }

    .input-group label {
        font-size: 14px;
    }

    .submit-btn {
        padding: 12px;
        font-size: 16px;
    }
}

@media (max-width: 320px) {
    .login-container {
        padding: 15px;
    }

    .form-header h2 {
        font-size: 20px;
    }

    .input-group {
        margin-bottom: 20px;
    }
}
</style>
