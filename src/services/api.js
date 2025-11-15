import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor for OpenAI key
api.interceptors.request.use((config) => {
  const openAIKey = localStorage.getItem('openai_key')
  if (openAIKey) {
    config.headers['X-OpenAI-Key'] = openAIKey
  }
  return config
})

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
