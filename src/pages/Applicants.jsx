import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Upload, Users, Trash2, FileSpreadsheet } from 'lucide-react'
import { apiService } from '../services/api'
import toast from 'react-hot-toast'

export default function Applicants() {
  const { applicants, addApplicant, removeApplicant } = useStore()
  const [isUploading, setIsUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    industry: '',
    revenue: '',
    employees: '',
    event_type: '',
    budget: '',
    date: '',
  })

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      toast.error('Please upload a CSV or Excel file')
      return
    }

    setIsUploading(true)
    try {
      const result = await apiService.uploadAndPredict(file)

      if (result.predictions && result.predictions.length > 0) {
        result.predictions.forEach(pred => {
          addApplicant({
            ...pred.applicant_data,
            prediction: pred.prediction,
            risk_level: pred.risk_level,
            confidence: pred.confidence
          })
        })
        toast.success(`Successfully processed ${result.predictions.length} applicants`)
      } else {
        toast.error('No valid data found in file')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error.response?.data?.detail || 'Failed to upload file')
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const result = await apiService.predict({
        applicant_data: formData
      })

      addApplicant({
        ...formData,
        prediction: result.prediction,
        risk_level: result.risk_level,
        confidence: result.confidence,
        recommendation: result.recommendation
      })

      toast.success('Applicant added successfully')
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        industry: '',
        revenue: '',
        employees: '',
        event_type: '',
        budget: '',
        date: '',
      })
      setShowForm(false)
    } catch (error) {
      console.error('Prediction error:', error)
      toast.error('Failed to process applicant')
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const getRiskBadgeColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Applicants</h1>
          <p className="text-gray-600 mt-1">Manage and analyze business applicants</p>
        </div>
        <div className="flex space-x-3">
          <label className="btn btn-secondary cursor-pointer">
            <Upload className="w-4 h-4 inline mr-2" />
            {isUploading ? 'Uploading...' : 'Upload CSV/Excel'}
            <input
              type="file"
              className="hidden"
              accept=".csv,.xlsx"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            <Users className="w-4 h-4 inline mr-2" />
            Add Applicant
          </button>
        </div>
      </div>

      {/* Add Applicant Form */}
      {showForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">New Applicant</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="label">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="input"
              />
            </div>
            <div>
              <label className="label">Company</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="input"
              />
            </div>
            <div>
              <label className="label">Industry</label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                className="input"
              />
            </div>
            <div>
              <label className="label">Annual Revenue</label>
              <input
                type="number"
                name="revenue"
                value={formData.revenue}
                onChange={handleInputChange}
                className="input"
                placeholder="$"
              />
            </div>
            <div>
              <label className="label">Employees</label>
              <input
                type="number"
                name="employees"
                value={formData.employees}
                onChange={handleInputChange}
                className="input"
              />
            </div>
            <div>
              <label className="label">Event Type</label>
              <select
                name="event_type"
                value={formData.event_type}
                onChange={handleInputChange}
                className="input"
              >
                <option value="">Select type</option>
                <option value="wedding">Wedding</option>
                <option value="corporate">Corporate Event</option>
                <option value="meeting">Meeting</option>
                <option value="conference">Conference</option>
              </select>
            </div>
            <div>
              <label className="label">Budget</label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                className="input"
                placeholder="$"
              />
            </div>
            <div>
              <label className="label">Event Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="input"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Add & Analyze
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Applicants Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Company</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Event Type</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Budget</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Risk Level</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Recommendation</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applicants.length > 0 ? (
                applicants.map((applicant) => (
                  <tr key={applicant.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{applicant.name}</div>
                        <div className="text-sm text-gray-600">{applicant.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{applicant.company || '-'}</td>
                    <td className="py-3 px-4">{applicant.event_type || '-'}</td>
                    <td className="py-3 px-4">
                      {applicant.budget ? `$${parseInt(applicant.budget).toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      {applicant.risk_level ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskBadgeColor(applicant.risk_level)}`}>
                          {applicant.risk_level}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        {applicant.recommendation || '-'}
                        {applicant.confidence && (
                          <div className="text-xs text-gray-500 mt-1">
                            {(applicant.confidence * 100).toFixed(0)}% confidence
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this applicant?')) {
                            removeApplicant(applicant.id)
                            toast.success('Applicant deleted')
                          }
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-400">
                    <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No applicants yet. Add one or upload a file to get started.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
