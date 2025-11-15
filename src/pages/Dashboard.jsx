import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { Users, Calendar, Heart, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444']

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
    { label: 'Total Applicants', value: stats.totalApplicants, icon: Users, color: 'bg-blue-500' },
    { label: 'Scheduled Events', value: stats.totalEvents, icon: Calendar, color: 'bg-green-500' },
    { label: 'Wedding Bookings', value: stats.totalWeddings, icon: Heart, color: 'bg-pink-500' },
    { label: 'Predictions Made', value: stats.totalPredictions, icon: TrendingUp, color: 'bg-purple-500' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your business analytics</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Risk Distribution</h2>
          {stats.riskDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.riskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              No prediction data available
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Recent Predictions</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {stats.recentPredictions.length > 0 ? (
              stats.recentPredictions.map((pred, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  {pred.risk_level === 'Low' || pred.recommendation === 'Worth It' ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{pred.applicant_name || 'Unknown'}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {pred.recommendation || 'No recommendation'}
                    </p>
                    {pred.confidence && (
                      <p className="text-xs text-gray-500 mt-1">
                        Confidence: {(pred.confidence * 100).toFixed(1)}%
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">
                No recent predictions
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
