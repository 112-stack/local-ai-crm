import { useStore } from '../store/useStore'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Brain, Sparkles, Target, Zap } from 'lucide-react'
import { format } from 'date-fns'

export default function Predictions() {
  const { predictions, applicants } = useStore()

  const getRiskBadgeClass = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low':
        return 'badge-success'
      case 'medium':
        return 'badge-warning'
      case 'high':
        return 'badge-danger'
      default:
        return 'badge-info'
    }
  }

  const getRiskIcon = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low':
        return <CheckCircle className="w-7 h-7 text-neon-green" />
      case 'medium':
        return <AlertTriangle className="w-7 h-7 text-neon-yellow" />
      case 'high':
        return <AlertTriangle className="w-7 h-7 text-neon-pink" />
      default:
        return <Target className="w-7 h-7 text-neon-cyan" />
    }
  }

  const allPredictions = [
    ...predictions,
    ...applicants.filter(a => a.prediction || a.risk_level)
  ]

  const lowRisk = allPredictions.filter(p => p.risk_level?.toLowerCase() === 'low').length
  const mediumRisk = allPredictions.filter(p => p.risk_level?.toLowerCase() === 'medium').length
  const highRisk = allPredictions.filter(p => p.risk_level?.toLowerCase() === 'high').length

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-2">
          <Brain className="w-8 h-8 text-neon-purple animate-pulse" />
          <h1 className="text-4xl font-bold text-gradient-2">AI Predictions</h1>
        </div>
        <p className="text-white/60 text-lg ml-12">Advanced risk analysis & business forecasting</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-white/60 uppercase tracking-wider">Total Predictions</p>
            <Sparkles className="w-4 h-4 text-neon-cyan" />
          </div>
          <p className="text-3xl font-bold text-white">{allPredictions.length}</p>
          <div className="mt-3 progress-bar">
            <div className="progress-fill bg-gradient-cyber" style={{ width: '100%' }} />
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-white/60 uppercase tracking-wider">Low Risk</p>
            <CheckCircle className="w-4 h-4 text-neon-green" />
          </div>
          <p className="text-3xl font-bold text-neon-green">{lowRisk}</p>
          <div className="mt-3 progress-bar">
            <div className="h-full rounded-full bg-neon-green" style={{ width: `${(lowRisk / Math.max(allPredictions.length, 1)) * 100}%` }} />
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-white/60 uppercase tracking-wider">Medium Risk</p>
            <AlertTriangle className="w-4 h-4 text-neon-yellow" />
          </div>
          <p className="text-3xl font-bold text-neon-yellow">{mediumRisk}</p>
          <div className="mt-3 progress-bar">
            <div className="h-full rounded-full bg-neon-yellow" style={{ width: `${(mediumRisk / Math.max(allPredictions.length, 1)) * 100}%` }} />
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-white/60 uppercase tracking-wider">High Risk</p>
            <AlertTriangle className="w-4 h-4 text-neon-pink" />
          </div>
          <p className="text-3xl font-bold text-neon-pink">{highRisk}</p>
          <div className="mt-3 progress-bar">
            <div className="h-full rounded-full bg-neon-pink" style={{ width: `${(highRisk / Math.max(allPredictions.length, 1)) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Predictions List */}
      <div className="space-y-4 scrollbar-custom">
        {allPredictions.length > 0 ? (
          allPredictions
            .sort((a, b) => (b.createdAt || b.id) - (a.createdAt || a.id))
            .map((prediction, index) => (
              <div
                key={prediction.id || index}
                className="card-glow group relative overflow-hidden"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Neon Border Indicator */}
                <div className={`absolute top-0 left-0 w-1 h-full ${
                  prediction.risk_level?.toLowerCase() === 'low' ? 'bg-neon-green shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                  prediction.risk_level?.toLowerCase() === 'medium' ? 'bg-neon-yellow shadow-[0_0_10px_rgba(251,191,36,0.5)]' :
                  'bg-neon-pink shadow-[0_0_10px_rgba(236,72,153,0.5)]'
                }`} />

                <div className="flex items-start space-x-4 pl-4">
                  <div className={`p-3 rounded-xl ${
                    prediction.risk_level?.toLowerCase() === 'low' ? 'bg-neon-green/20' :
                    prediction.risk_level?.toLowerCase() === 'medium' ? 'bg-neon-yellow/20' :
                    'bg-neon-pink/20'
                  }`}>
                    {getRiskIcon(prediction.risk_level)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                          <span>{prediction.name || prediction.applicant_name || 'Analysis Result'}</span>
                          <Zap className="w-4 h-4 text-neon-yellow opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        {prediction.company && (
                          <p className="text-sm text-white/60 mt-1">{prediction.company}</p>
                        )}
                      </div>
                      <span className={`${getRiskBadgeClass(prediction.risk_level)} px-4 py-2 text-sm`}>
                        {prediction.risk_level || 'Unknown'} Risk
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {prediction.recommendation && (
                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Recommendation</p>
                          <p className="font-semibold text-white flex items-center">
                            {prediction.recommendation?.includes('Worth It') || prediction.recommendation?.includes('Proceed') ? (
                              <TrendingUp className="w-4 h-4 mr-2 text-neon-green" />
                            ) : (
                              <TrendingDown className="w-4 h-4 mr-2 text-neon-pink" />
                            )}
                            {prediction.recommendation}
                          </p>
                        </div>
                      )}

                      {prediction.confidence && (
                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <p className="text-xs text-white/40 uppercase tracking-wider mb-2">AI Confidence</p>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 progress-bar">
                              <div
                                className={`h-full rounded-full ${
                                  prediction.confidence > 0.8 ? 'bg-neon-green' :
                                  prediction.confidence > 0.6 ? 'bg-neon-yellow' :
                                  'bg-neon-pink'
                                }`}
                                style={{ width: `${prediction.confidence * 100}%` }}
                              />
                            </div>
                            <span className="font-bold text-neon-cyan text-sm">
                              {(prediction.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      )}

                      {prediction.budget && (
                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Budget</p>
                          <p className="font-semibold text-white">${parseInt(prediction.budget).toLocaleString()}</p>
                        </div>
                      )}

                      {prediction.revenue && (
                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Revenue</p>
                          <p className="font-semibold text-white">${parseInt(prediction.revenue).toLocaleString()}</p>
                        </div>
                      )}

                      {prediction.industry && (
                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Industry</p>
                          <p className="font-semibold text-white">{prediction.industry}</p>
                        </div>
                      )}

                      {prediction.event_type && (
                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Event Type</p>
                          <p className="font-semibold text-white">{prediction.event_type}</p>
                        </div>
                      )}
                    </div>

                    {(prediction.prediction || prediction.reasoning) && (
                      <div className="p-4 bg-white/5 rounded-lg border border-neon-blue/20">
                        {prediction.prediction && typeof prediction.prediction === 'string' && (
                          <p className="text-sm text-white/80">
                            <span className="font-semibold text-neon-cyan">Analysis:</span> {prediction.prediction}
                          </p>
                        )}
                        {prediction.reasoning && (
                          <p className="text-sm text-white/80 mt-2">
                            <span className="font-semibold text-neon-purple">Reasoning:</span> {prediction.reasoning}
                          </p>
                        )}
                      </div>
                    )}

                    {prediction.createdAt && (
                      <div className="mt-3 text-xs text-white/40 font-mono">
                        {format(new Date(prediction.createdAt), 'MMM d, yyyy \'at\' h:mm a')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
        ) : (
          <div className="card-glow text-center py-16">
            <Brain className="w-16 h-16 mx-auto mb-4 text-neon-purple opacity-50 animate-pulse" />
            <p className="text-white/60 text-lg mb-2">No predictions generated yet</p>
            <p className="text-sm text-white/40">Upload applicant data to start AI-powered analysis</p>
          </div>
        )}
      </div>
    </div>
  )
}
