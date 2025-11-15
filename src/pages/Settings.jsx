import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { Settings as SettingsIcon, Save, Cpu, Cloud, Key, Info, Zap } from 'lucide-react'
import { apiService } from '../services/api'
import toast from 'react-hot-toast'
import AutoRunner from '../components/AutoRunner'

export default function Settings() {
  const { settings, updateSettings } = useStore()
  const [localSettings, setLocalSettings] = useState(settings)
  const [systemInfo, setSystemInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)

  useEffect(() => {
    loadSystemInfo()
  }, [])

  const loadSystemInfo = async () => {
    try {
      const info = await apiService.getSystemInfo()
      setSystemInfo(info)
    } catch (error) {
      console.error('Failed to load system info:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Save to local storage
      if (localSettings.openAIKey) {
        localStorage.setItem('openai_key', localSettings.openAIKey)
      }

      // Update backend settings
      await apiService.updateSettings(localSettings)

      // Update global state
      updateSettings(localSettings)

      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    setTestingConnection(true)
    try {
      await apiService.healthCheck()
      toast.success('Connection successful!')
    } catch (error) {
      toast.error('Connection failed: ' + (error.message || 'Unknown error'))
    } finally {
      setTestingConnection(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setLocalSettings({
      ...localSettings,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure your AI and system preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Configuration */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-6">
              <Cpu className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold">AI Configuration</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Model Type</label>
                <select
                  name="modelType"
                  value={localSettings.modelType}
                  onChange={handleInputChange}
                  className="input"
                >
                  <option value="local">Local GPU</option>
                  <option value="openai">OpenAI API</option>
                  <option value="hybrid">Hybrid (Fallback to OpenAI)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Choose how predictions are processed
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Cpu className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Use Local GPU</p>
                    <p className="text-xs text-gray-600">
                      {systemInfo?.gpu_available
                        ? `Available: ${systemInfo.gpu_name}`
                        : 'No GPU detected - will use CPU'}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="useLocalGPU"
                    checked={localSettings.useLocalGPU}
                    onChange={handleInputChange}
                    className="sr-only peer"
                    disabled={!systemInfo?.gpu_available}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* OpenAI Settings */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-6">
              <Cloud className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold">OpenAI Integration</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Cloud className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Enable OpenAI</p>
                    <p className="text-xs text-gray-600">Use OpenAI API for predictions</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="useOpenAI"
                    checked={localSettings.useOpenAI}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {localSettings.useOpenAI && (
                <div>
                  <label className="label flex items-center space-x-2">
                    <Key className="w-4 h-4" />
                    <span>OpenAI API Key</span>
                  </label>
                  <input
                    type="password"
                    name="openAIKey"
                    value={localSettings.openAIKey}
                    onChange={handleInputChange}
                    className="input font-mono"
                    placeholder="sk-..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your API key is stored locally and never sent to our servers
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={testConnection}
              disabled={testingConnection}
              className="btn btn-secondary"
            >
              <Zap className="w-4 h-4 inline mr-2" />
              {testingConnection ? 'Testing...' : 'Test Connection'}
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="btn btn-primary"
            >
              <Save className="w-4 h-4 inline mr-2" />
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* System Info Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <Info className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold">System Info</h2>
            </div>

            {systemInfo ? (
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-1">Python Version</p>
                  <p className="font-medium">{systemInfo.python_version}</p>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-1">PyTorch Version</p>
                  <p className="font-medium">{systemInfo.torch_version}</p>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-1">CUDA Available</p>
                  <p className="font-medium">
                    {systemInfo.cuda_available ? (
                      <span className="text-green-600">✓ Yes (v{systemInfo.cuda_version})</span>
                    ) : (
                      <span className="text-yellow-600">✗ No (CPU Mode)</span>
                    )}
                  </p>
                </div>

                {systemInfo.gpu_available && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-1">GPU Device</p>
                    <p className="font-medium text-xs break-words">
                      {systemInfo.gpu_name}
                    </p>
                  </div>
                )}

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-1">Device</p>
                  <p className="font-medium uppercase">{systemInfo.device}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>Loading system information...</p>
              </div>
            )}
          </div>

          <div className="card bg-blue-50 border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-2">💡 Tip</h3>
            <p className="text-sm text-blue-800">
              For best performance, use local GPU mode. OpenAI mode is great for testing or when GPU is unavailable.
            </p>
          </div>

          <div className="card bg-yellow-50 border border-yellow-200">
            <h3 className="font-bold text-yellow-900 mb-2">⚠️ Note</h3>
            <p className="text-sm text-yellow-800">
              Local GPU predictions are processed on your machine and stay private. OpenAI predictions are sent to OpenAI's servers.
            </p>
          </div>
        </div>
      </div>

      {/* Auto Runner Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Auto Runner</h2>
        <p className="text-gray-600 mb-6">Manage scheduled tasks and automated operations</p>
        <AutoRunner />
      </div>
    </div>
  )
}
