import { useStore } from '../store/useStore'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, BarChart } from 'lucide-react'
import { format } from 'date-fns'

export default function Predictions() {
  const { predictions, applicants } = useStore()

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low':
        return 'text-green-600 bg-green-50'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50'
      case 'high':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getRiskIcon = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low':
        return <CheckCircle className="w-8 h-8 text-green-500" />
      case 'medium':
        return <AlertTriangle className="w-8 h-8 text-yellow-500" />
      case 'high':
        return <AlertTriangle className="w-8 h-8 text-red-500" />
      default:
        return <BarChart className="w-8 h-8 text-gray-500" />
    }
  }

  // Combine predictions from both sources
  const allPredictions = [
    ...predictions,
    ...applicants.filter(a => a.prediction || a.risk_level)
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Predictions & Analysis</h1>
        <p className="text-gray-600 mt-1">AI-powered business forecasts and risk assessments</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <p className="text-sm text-gray-600">Total Predictions</p>
          <p className="text-2xl font-bold mt-1">{allPredictions.length}</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Risk</p>
              <p className="text-2xl font-bold mt-1 text-green-600">
                {allPredictions.filter(p => p.risk_level?.toLowerCase() === 'low').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Medium Risk</p>
              <p className="text-2xl font-bold mt-1 text-yellow-600">
                {allPredictions.filter(p => p.risk_level?.toLowerCase() === 'medium').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Risk</p>
              <p className="text-2xl font-bold mt-1 text-red-600">
                {allPredictions.filter(p => p.risk_level?.toLowerCase() === 'high').length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Predictions List */}
      <div className="space-y-4">
        {allPredictions.length > 0 ? (
          allPredictions
            .sort((a, b) => (b.createdAt || b.id) - (a.createdAt || a.id))
            .map((prediction, index) => (
              <div key={prediction.id || index} className={`card ${getRiskColor(prediction.risk_level)} border-l-4 ${
                prediction.risk_level?.toLowerCase() === 'low' ? 'border-green-500' :
                prediction.risk_level?.toLowerCase() === 'medium' ? 'border-yellow-500' :
                prediction.risk_level?.toLowerCase() === 'high' ? 'border-red-500' :
                'border-gray-500'
              }`}>
                <div className="flex items-start space-x-4">
                  <div className="mt-1">
                    {getRiskIcon(prediction.risk_level)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">
                          {prediction.name || prediction.applicant_name || 'Analysis Result'}
                        </h3>
                        {prediction.company && (
                          <p className="text-sm text-gray-600 mt-1">{prediction.company}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          prediction.risk_level?.toLowerCase() === 'low' ? 'bg-green-200 text-green-800' :
                          prediction.risk_level?.toLowerCase() === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                          prediction.risk_level?.toLowerCase() === 'high' ? 'bg-red-200 text-red-800' :
                          'bg-gray-200 text-gray-800'
                        }`}>
                          {prediction.risk_level || 'Unknown'} Risk
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
                      {prediction.recommendation && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase mb-1">Recommendation</p>
                          <p className="font-medium flex items-center">
                            {prediction.recommendation === 'Worth It' || prediction.recommendation?.includes('Proceed') ? (
                              <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
                            ) : (
                              <TrendingDown className="w-4 h-4 mr-1 text-red-600" />
                            )}
                            {prediction.recommendation}
                          </p>
                        </div>
                      )}

                      {prediction.confidence && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase mb-1">Confidence</p>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  prediction.confidence > 0.8 ? 'bg-green-500' :
                                  prediction.confidence > 0.6 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${prediction.confidence * 100}%` }}
                              />
                            </div>
                            <span className="font-medium text-sm">
                              {(prediction.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      )}

                      {prediction.event_type && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase mb-1">Event Type</p>
                          <p className="font-medium">{prediction.event_type}</p>
                        </div>
                      )}

                      {prediction.budget && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase mb-1">Budget</p>
                          <p className="font-medium">${parseInt(prediction.budget).toLocaleString()}</p>
                        </div>
                      )}

                      {prediction.revenue && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase mb-1">Annual Revenue</p>
                          <p className="font-medium">${parseInt(prediction.revenue).toLocaleString()}</p>
                        </div>
                      )}

                      {prediction.industry && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase mb-1">Industry</p>
                          <p className="font-medium">{prediction.industry}</p>
                        </div>
                      )}
                    </div>

                    {prediction.prediction && typeof prediction.prediction === 'string' && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm">
                          <span className="font-medium">Analysis:</span> {prediction.prediction}
                        </p>
                      </div>
                    )}

                    {prediction.reasoning && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm">
                          <span className="font-medium">Reasoning:</span> {prediction.reasoning}
                        </p>
                      </div>
                    )}

                    {prediction.createdAt && (
                      <div className="mt-3 text-xs text-gray-500">
                        {format(new Date(prediction.createdAt), 'MMM d, yyyy \'at\' h:mm a')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
        ) : (
          <div className="card text-center py-12">
            <BarChart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-400 mb-2">No predictions yet</p>
            <p className="text-sm text-gray-500">Add applicants or upload data to generate predictions</p>
          </div>
        )}
      </div>
    </div>
  )
}
