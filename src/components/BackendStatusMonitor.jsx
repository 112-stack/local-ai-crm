import { useState, useEffect } from 'react'
import { apiService, getCircuitBreakerStatus, resetCircuitBreaker } from '../services/api'
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

export default function BackendStatusMonitor() {
  const [status, setStatus] = useState('checking') // 'checking', 'connected', 'disconnected', 'error'
  const [backendInfo, setBackendInfo] = useState(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const checkBackendStatus = async () => {
    try {
      const health = await apiService.healthCheck()
      setStatus('connected')
      setBackendInfo(health)
    } catch (error) {
      const cbStatus = getCircuitBreakerStatus()
      if (cbStatus.isOpen) {
        setStatus('error')
      } else {
        setStatus('disconnected')
      }
      setBackendInfo(null)
    }
  }

  useEffect(() => {
    // Check status on mount
    checkBackendStatus()

    // Check every 10 seconds
    const interval = setInterval(checkBackendStatus, 10000)

    return () => clearInterval(interval)
  }, [])

  const handleRetry = async () => {
    setIsRetrying(true)
    resetCircuitBreaker()
    await checkBackendStatus()
    setIsRetrying(false)
  }

  if (status === 'connected') {
    // Don't show anything when everything is working
    return null
  }

  if (status === 'checking') {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span>Connecting to backend...</span>
      </div>
    )
  }

  if (status === 'disconnected' || status === 'error') {
    return (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-md">
        <div className="flex items-start gap-3">
          <XCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold mb-1">Backend Server Disconnected</div>
            <div className="text-sm opacity-90 mb-3">
              {status === 'error'
                ? 'Cannot reach the backend server. Multiple connection attempts failed.'
                : 'The backend server is not responding. Retrying automatically...'
              }
            </div>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm underline mb-2"
            >
              {showDetails ? 'Hide' : 'Show'} troubleshooting steps
            </button>

            {showDetails && (
              <div className="bg-red-600 bg-opacity-50 p-3 rounded text-sm mb-3">
                <div className="font-semibold mb-2">To fix this issue:</div>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Make sure you started the app with: <code className="bg-black bg-opacity-30 px-1 rounded">npm start</code></li>
                  <li>If you only ran <code className="bg-black bg-opacity-30 px-1 rounded">npm run dev</code>, stop it and run <code className="bg-black bg-opacity-30 px-1 rounded">npm start</code> instead</li>
                  <li>Check if the backend is running on port 8000</li>
                  <li>Verify Python dependencies are installed: <code className="bg-black bg-opacity-30 px-1 rounded">pip install -r backend/requirements.txt</code></li>
                </ol>
              </div>
            )}

            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex items-center gap-2 bg-white text-red-600 px-3 py-1.5 rounded font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : 'Retry Connection'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
