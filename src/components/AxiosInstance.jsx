// src/components/AxiosInstance.js
import axios from 'axios'

const baseUrl = 'http://127.0.0.1:8000/'

const AxiosInstance = axios.create({
    baseURL: baseUrl,
    timeout: 10000, // Augmenté à 10 secondes
    headers: {
        "Content-Type": "application/json",
        "accept": "application/json"
    }
})

AxiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('Token')
        console.log('📤 Making request to:', config.url, 'with token:', !!token)
        
        if(token){
            config.headers.Authorization = `Token ${token}`
        } else {
            config.headers.Authorization = ``
        }
        return config
    },
    (error) => {
        console.error('❌ Request interceptor error:', error)
        return Promise.reject(error)
    }
)

AxiosInstance.interceptors.response.use(
    (response) => {
        console.log('✅ Response received:', response.status, response.config.url)
        return response
    }, 
    (error) => {
        console.error('❌ Response error:', error.response?.status, error.config?.url)
        
        if(error.response && error.response.status === 401){
            console.log('🔒 Unauthorized, removing token')
            localStorage.removeItem('Token')
            localStorage.removeItem('User')
        }
        return Promise.reject(error)
    }
)

export default AxiosInstance