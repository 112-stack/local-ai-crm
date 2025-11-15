import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Heart,
  TrendingUp,
  Settings as SettingsIcon,
  Activity
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import toast from 'react-hot-toast'

const navigation = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Applicants', path: '/applicants', icon: Users },
  { name: 'Events', path: '/events', icon: Calendar },
  { name: 'Weddings', path: '/weddings', icon: Heart },
  { name: 'Predictions', path: '/predictions', icon: TrendingUp },
  { name: 'Settings', path: '/settings', icon: SettingsIcon },
]

export default function Layout() {
  const location = useLocation()
  const [systemInfo, setSystemInfo] = useState(null)

  useEffect(() => {
    checkSystemHealth()
  }, [])

  const checkSystemHealth = async () => {
    try {
      const info = await apiService.getSystemInfo()
      setSystemInfo(info)
    } catch (error) {
      console.error('Failed to fetch system info:', error)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <Activity className="w-8 h-8 text-primary-400" />
            <div>
              <h1 className="text-xl font-bold">CRM Predictor</h1>
              <p className="text-xs text-gray-400">Business Intelligence</p>
            </div>
          </div>
        </div>

        <nav className="mt-6 px-3">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 mb-1 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* System Status */}
        {systemInfo && (
          <div className="absolute bottom-0 left-0 right-0 w-64 p-4 bg-gray-800">
            <div className="text-xs text-gray-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>GPU:</span>
                <span className={systemInfo.gpu_available ? 'text-green-400' : 'text-yellow-400'}>
                  {systemInfo.gpu_available ? 'Available' : 'CPU Mode'}
                </span>
              </div>
              {systemInfo.gpu_name && (
                <div className="text-gray-500 text-xs truncate">
                  {systemInfo.gpu_name}
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
