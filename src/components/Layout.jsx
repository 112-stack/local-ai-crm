import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Heart,
  TrendingUp,
  Settings as SettingsIcon,
  Activity,
  Cpu,
  Zap
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { apiService } from '../services/api'

const navigation = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, gradient: 'from-neon-blue to-neon-cyan' },
  { name: 'Applicants', path: '/applicants', icon: Users, gradient: 'from-neon-purple to-neon-pink' },
  { name: 'Events', path: '/events', icon: Calendar, gradient: 'from-neon-green to-emerald-400' },
  { name: 'Weddings', path: '/weddings', icon: Heart, gradient: 'from-neon-pink to-red-400' },
  { name: 'Predictions', path: '/predictions', icon: TrendingUp, gradient: 'from-neon-yellow to-orange-400' },
  { name: 'Settings', path: '/settings', icon: SettingsIcon, gradient: 'from-gray-400 to-gray-600' },
]

export default function Layout() {
  const location = useLocation()
  const [systemInfo, setSystemInfo] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    checkSystemHealth()
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
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
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-br from-neon-blue/5 via-transparent to-neon-purple/5 pointer-events-none" />

      {/* Futuristic Sidebar */}
      <aside className="w-72 relative z-10 flex flex-col">
        <div className="glass-container h-full m-4 flex flex-col overflow-hidden">
          {/* Logo Section */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center space-x-3 mb-2">
              <div className="relative">
                <Activity className="w-10 h-10 text-neon-blue animate-pulse-slow" />
                <div className="absolute inset-0 blur-lg bg-neon-blue/50 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">CRM Predictor</h1>
                <p className="text-xs text-white/60 tracking-wider">AI INTELLIGENCE</p>
              </div>
            </div>

            {/* Time Display */}
            <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="text-xs text-white/40 uppercase tracking-wider mb-1">System Time</div>
              <div className="text-sm font-mono text-neon-cyan">
                {currentTime.toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 scrollbar-custom overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group relative ${isActive ? 'nav-item-active' : 'nav-item'}`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r opacity-10 rounded-xl blur-xl"
                         style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }} />
                  )}
                  <div className="relative flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-neon-blue/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-neon-blue' : 'text-white/60 group-hover:text-white'}`} />
                    </div>
                    <span className="font-semibold">{item.name}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-neon-blue animate-pulse shadow-neon" />
                    )}
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* System Status */}
          {systemInfo && (
            <div className="p-4 border-t border-white/10">
              <div className="glass-container p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-wider text-white/60">System Status</span>
                  <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>

                {/* GPU Status */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {systemInfo.gpu_available ? (
                        <Zap className="w-4 h-4 text-neon-green" />
                      ) : (
                        <Cpu className="w-4 h-4 text-neon-yellow" />
                      )}
                      <span className="text-xs text-white/80">
                        {systemInfo.gpu_available ? 'GPU' : 'CPU'}
                      </span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      systemInfo.gpu_available
                        ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                        : 'bg-neon-yellow/20 text-neon-yellow border border-neon-yellow/30'
                    }`}>
                      {systemInfo.gpu_available ? 'Active' : 'Fallback'}
                    </span>
                  </div>

                  {systemInfo.gpu_name && (
                    <div className="text-xs text-white/50 truncate font-mono">
                      {systemInfo.gpu_name}
                    </div>
                  )}

                  {/* Performance Indicator */}
                  <div className="mt-2">
                    <div className="text-xs text-white/40 mb-1">Performance</div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: systemInfo.gpu_available ? '95%' : '60%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative z-10 scrollbar-custom">
        <div className="min-h-full">
          <Outlet />
        </div>
      </main>

      {/* Decorative Elements */}
      <div className="fixed top-10 right-10 w-64 h-64 bg-neon-blue/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="fixed bottom-10 left-10 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" style={{ animationDelay: '1s' }} />
    </div>
  )
}
