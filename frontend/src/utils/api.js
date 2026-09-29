import axios from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('syncvault_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export const getApiError = (error, fallback = 'Something went wrong. Please try again.') => {
  if (error.response?.data?.message) {
    return error.response.data.message
  }

  if (error.code === 'ERR_NETWORK') {
    return 'Unable to reach the server. Start the backend and check its database connection.'
  }

  return fallback
}

export default api
