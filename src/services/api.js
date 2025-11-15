import axios from 'axios'

const API_BASE_URL = '/api'

// Retry configuration
const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY = 1000 // 1 second
const MAX_RETRY_DELAY = 10000 // 10 seconds

// Circuit breaker state
let circuitBreakerState = {
  failures: 0,
  lastFailureTime: null,
  isOpen: false,
  threshold: 5,
  resetTimeout: 30000 // 30 seconds
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
})

// Utility: Check if circuit breaker should reset
const shouldResetCircuitBreaker = () => {
  if (!circuitBreakerState.isOpen) return false
  const timeSinceLastFailure = Date.now() - circuitBreakerState.lastFailureTime
  return timeSinceLastFailure > circuitBreakerState.resetTimeout
}

// Utility: Exponential backoff delay
const getRetryDelay = (retryCount) => {
  const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, retryCount), MAX_RETRY_DELAY)
  return delay + Math.random() * 1000 // Add jitter
}

// Utility: Sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Interceptor for OpenAI key
api.interceptors.request.use((config) => {
  const openAIKey = localStorage.getItem('openai_key')
  if (openAIKey) {
    config.headers['X-OpenAI-Key'] = openAIKey
  }
  return config
})

// Response interceptor for retry logic
api.interceptors.response.use(
  (response) => {
    // Reset circuit breaker on success
    circuitBreakerState.failures = 0
    circuitBreakerState.isOpen = false
    return response
  },
  async (error) => {
    const config = error.config

    // Check if circuit breaker should reset
    if (shouldResetCircuitBreaker()) {
      circuitBreakerState.failures = 0
      circuitBreakerState.isOpen = false
    }

    // Don't retry if circuit breaker is open
    if (circuitBreakerState.isOpen) {
      console.warn('⚠️ Circuit breaker is open. Backend may be down.')
      error.circuitBreakerOpen = true
      return Promise.reject(error)
    }

    // Initialize retry count
    config._retryCount = config._retryCount || 0

    // Check if we should retry
    const shouldRetry =
      config._retryCount < MAX_RETRIES &&
      (!error.response || error.response.status >= 500 || error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK')

    if (!shouldRetry) {
      // Update circuit breaker
      circuitBreakerState.failures++
      circuitBreakerState.lastFailureTime = Date.now()

      if (circuitBreakerState.failures >= circuitBreakerState.threshold) {
        circuitBreakerState.isOpen = true
        console.error('🔴 Circuit breaker opened. Backend is unreachable.')
      }

      return Promise.reject(error)
    }

    // Increment retry count
    config._retryCount++

    // Calculate delay
    const delay = getRetryDelay(config._retryCount - 1)

    console.log(`🔄 Retrying request (${config._retryCount}/${MAX_RETRIES}) after ${Math.round(delay)}ms...`)

    // Wait before retrying
    await sleep(delay)

    // Retry the request
    return api(config)
  }
)

// Export circuit breaker status checker
export const getCircuitBreakerStatus = () => ({
  isOpen: circuitBreakerState.isOpen,
  failures: circuitBreakerState.failures,
  lastFailureTime: circuitBreakerState.lastFailureTime
})

// Export function to manually reset circuit breaker
export const resetCircuitBreaker = () => {
  circuitBreakerState.failures = 0
  circuitBreakerState.isOpen = false
  circuitBreakerState.lastFailureTime = null
}

export const apiService = {
  // Health check
  healthCheck: async () => {
    const response = await api.get('/health')
    return response.data
  },

  // Predictions
  predict: async (data) => {
    const response = await api.post('/predict', data)
    return response.data
  },

  // Risk Analysis
  analyzeRisk: async (data) => {
    const response = await api.post('/risk-analysis', data)
    return response.data
  },

  // Upload file for prediction
  uploadAndPredict: async (file, additionalData = {}) => {
    const formData = new FormData()
    formData.append('file', file)
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key])
    })

    const response = await api.post('/upload-predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Events
  getEvents: async () => {
    const response = await api.get('/events')
    return response.data
  },

  createEvent: async (event) => {
    const response = await api.post('/events', event)
    return response.data
  },

  updateEvent: async (id, event) => {
    const response = await api.put(`/events/${id}`, event)
    return response.data
  },

  deleteEvent: async (id) => {
    const response = await api.delete(`/events/${id}`)
    return response.data
  },

  // Weddings
  getWeddings: async () => {
    const response = await api.get('/weddings')
    return response.data
  },

  createWedding: async (wedding) => {
    const response = await api.post('/weddings', wedding)
    return response.data
  },

  updateWedding: async (id, wedding) => {
    const response = await api.put(`/weddings/${id}`, wedding)
    return response.data
  },

  deleteWedding: async (id) => {
    const response = await api.delete(`/weddings/${id}`)
    return response.data
  },

  // Settings
  getSettings: async () => {
    const response = await api.get('/settings')
    return response.data
  },

  updateSettings: async (settings) => {
    const response = await api.post('/settings', settings)
    return response.data
  },

  // System info
  getSystemInfo: async () => {
    const response = await api.get('/system-info')
    return response.data
  },

  // Auto Runner
  getAutoRunnerStatus: async () => {
    const response = await api.get('/auto-runner/status')
    return response.data
  },

  getAvailableTasks: async () => {
    const response = await api.get('/auto-runner/tasks')
    return response.data
  },

  getAutoRunnerJobs: async () => {
    const response = await api.get('/auto-runner/jobs')
    return response.data
  },

  getAutoRunnerJob: async (jobId) => {
    const response = await api.get(`/auto-runner/jobs/${jobId}`)
    return response.data
  },

  createAutoRunnerJob: async (job) => {
    const response = await api.post('/auto-runner/jobs', job)
    return response.data
  },

  deleteAutoRunnerJob: async (jobId) => {
    const response = await api.delete(`/auto-runner/jobs/${jobId}`)
    return response.data
  },

  getAutoRunnerHistory: async (limit = 20) => {
    const response = await api.get(`/auto-runner/history?limit=${limit}`)
    return response.data
  },

  startAutoRunner: async () => {
    const response = await api.post('/auto-runner/start')
    return response.data
  },

  stopAutoRunner: async () => {
    const response = await api.post('/auto-runner/stop')
    return response.data
  },
}

export default api
