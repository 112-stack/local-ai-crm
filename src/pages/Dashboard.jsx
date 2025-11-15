import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { Users, Calendar, Heart, TrendingUp, AlertTriangle, CheckCircle, Zap, Activity, BarChart3, Brain } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const NEON_COLORS = ['#00d9ff', '#10b981', '#fbbf24', '#ec4899']

export default function Dashboard() {
  const { applicants, events, weddings, predictions } = useStore()
  const [stats, setStats] = useState({
    totalApplicants: 0,
    totalEvents: 0,
    totalWeddings: 0,
    totalPredictions: 0,
    riskDistribution: [],
    recentPredictions: []
  })

  useEffect(() => {
    // Calculate statistics
    const riskLevels = predictions.reduce((acc, pred) => {
      const level = pred.risk_level || 'Unknown'
      acc[level] = (acc[level] || 0) + 1
      return acc
    }, {})

    const riskDistribution = Object.entries(riskLevels).map(([name, value]) => ({
      name,
      value
    }))

    setStats({
      totalApplicants: applicants.length,
      totalEvents: events.length,
      totalWeddings: weddings.length,
      totalPredictions: predictions.length,
      riskDistribution,
      recentPredictions: predictions.slice(-10).reverse()
    })
  }, [applicants, events, weddings, predictions])

  const statCards = [
    {
      label: 'Total Applicants',
      value: stats.totalApplicants,
      icon: Users,
      gradient: 'from-neon-blue to-neon-cyan',
      shadowColor: 'shadow-neon',
      change: '+12.5%'
    },
    {
      label: 'Scheduled Events',
      value: stats.totalEvents,
      icon: Calendar,
      gradient: 'from-neon-green to-emerald-400',
      shadowColor: 'shadow-[0_0_20px_rgba(16,185,129,0.5)]',
      change: '+8.3%'
    },
    {
      label: 'Wedding Bookings',
      value: stats.totalWeddings,
      icon: Heart,
      gradient: 'from-neon-pink to-red-400',
      shadowColor: 'shadow-neon-pink',
      change: '+15.2%'
    },
    {
      label: 'AI Predictions',
      value: stats.totalPredictions,
      icon: Brain,
      gradient: 'from-neon-purple to-purple-500',
      shadowColor: 'shadow-neon-purple',
      change: '+23.7%'
    },
  ]

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-2">
          <Activity className="w-8 h-8 text-neon-blue animate-pulse" />
          <h1 className="text-4xl font-bold text-gradient">Command Center</h1>
        </div>
        <p className="text-white/60 text-lg ml-12">Real-time business intelligence analytics</p>
      </div>

      {/* Stat Cards with Futuristic Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="stat-card group cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} ${stat.shadowColor}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-neon-green px-2 py-1 rounded-full bg-neon-green/10 border border-neon-green/30">
                    {stat.change}
                  </span>
                </div>
                <p className="text-sm text-white/60 uppercase tracking-wider mb-2">{stat.label}</p>
                <div className="flex items-end justify-between">
                  <p className="text-4xl font-bold text-white">{stat.value}</p>
                  <Zap className="w-5 h-5 text-neon-yellow opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Animated Progress Bar */}
                <div className="mt-4 progress-bar">
                  <div
                    className={`progress-fill bg-gradient-to-r ${stat.gradient}`}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Glow Effect */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-10 blur-xl transition-opacity`} />
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Chart */}
        <div className="card-glow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-neon-purple/20 border border-neon-purple/30">
                <BarChart3 className="w-5 h-5 text-neon-purple" />
              </div>
              <h2 className="text-xl font-bold text-white">Risk Distribution</h2>
            </div>
            <div className="px-3 py-1 rounded-full bg-neon-blue/10 border border-neon-blue/30 text-xs text-neon-blue font-semibold">
              LIVE
            </div>
          </div>

          {stats.riskDistribution.length > 0 ? (
            <div className="relative">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <defs>
                    {NEON_COLORS.map((color, index) => (
                      <filter key={`glow-${index}`} id={`glow-${index}`}>
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    ))}
                  </defs>
                  <Pie
                    data={stats.riskDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="none"
                  >
                    {stats.riskDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={NEON_COLORS[index % NEON_COLORS.length]}
                        filter={`url(#glow-${index % NEON_COLORS.length})`}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(17, 17, 27, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {stats.riskDistribution.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: NEON_COLORS[index % NEON_COLORS.length] }}
                    />
                    <span className="text-xs text-white/70">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-white/40">
              <BarChart3 className="w-12 h-12 mb-3 opacity-50" />
              <p>No prediction data available</p>
              <p className="text-xs mt-1">Start analyzing applicants to see risk distribution</p>
            </div>
          )}
        </div>

        {/* Recent Predictions */}
        <div className="card-glow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-neon-cyan/20 border border-neon-cyan/30">
                <TrendingUp className="w-5 h-5 text-neon-cyan" />
              </div>
              <h2 className="text-xl font-bold text-white">Recent Analysis</h2>
            </div>
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-custom">
            {stats.recentPredictions.length > 0 ? (
              stats.recentPredictions.map((pred, index) => (
                <div
                  key={index}
                  className="group p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 hover:border-neon-blue/30 hover:bg-white/10 transition-all cursor-pointer"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      pred.risk_level === 'Low' ? 'bg-neon-green/20' :
                      pred.risk_level === 'Medium' ? 'bg-neon-yellow/20' :
                      'bg-neon-pink/20'
                    }`}>
                      {pred.risk_level === 'Low' ? (
                        <CheckCircle className="w-5 h-5 text-neon-green" />
                      ) : (
                        <AlertTriangle className={`w-5 h-5 ${
                          pred.risk_level === 'Medium' ? 'text-neon-yellow' : 'text-neon-pink'
                        }`} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">
                        {pred.applicant_name || 'Unknown'}
                      </p>
                      <p className="text-xs text-white/60 mt-1 line-clamp-2">
                        {pred.recommendation || 'No recommendation'}
                      </p>

                      {pred.confidence && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-white/40">Confidence</span>
                            <span className="text-xs text-neon-cyan font-semibold">
                              {(pred.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className={`h-full rounded-full ${
                                pred.confidence > 0.8 ? 'bg-neon-green' :
                                pred.confidence > 0.6 ? 'bg-neon-yellow' :
                                'bg-neon-pink'
                              }`}
                              style={{ width: `${pred.confidence * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      pred.risk_level === 'Low' ? 'badge-success' :
                      pred.risk_level === 'Medium' ? 'badge-warning' :
                      'badge-danger'
                    }`}>
                      {pred.risk_level || 'Unknown'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-white/40">
                <Activity className="w-12 h-12 mb-3 opacity-50 animate-pulse" />
                <p>No recent predictions</p>
                <p className="text-xs mt-1">Add applicants to generate AI predictions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions (Optional Enhancement) */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-glow p-4 cursor-pointer group">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-neon-blue/20 group-hover:bg-neon-blue/30 transition-colors">
              <Users className="w-6 h-6 text-neon-blue" />
            </div>
            <div>
              <p className="text-white font-semibold">Add Applicant</p>
              <p className="text-xs text-white/50">Upload new data</p>
            </div>
          </div>
        </div>

        <div className="card-glow p-4 cursor-pointer group">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-neon-green/20 group-hover:bg-neon-green/30 transition-colors">
              <Brain className="w-6 h-6 text-neon-green" />
            </div>
            <div>
              <p className="text-white font-semibold">Run Analysis</p>
              <p className="text-xs text-white/50">AI-powered insights</p>
            </div>
          </div>
        </div>

        <div className="card-glow p-4 cursor-pointer group">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-neon-purple/20 group-hover:bg-neon-purple/30 transition-colors">
              <TrendingUp className="w-6 h-6 text-neon-purple" />
            </div>
            <div>
              <p className="text-white font-semibold">View Reports</p>
              <p className="text-xs text-white/50">Detailed analytics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
