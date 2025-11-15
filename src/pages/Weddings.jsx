import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Heart, Plus, Trash2, Calendar, Users, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function Weddings() {
  const { weddings, addWedding, removeWedding } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    coupleName: '',
    weddingDate: '',
    venue: '',
    guestCount: '',
    budget: '',
    package: 'standard',
    contactEmail: '',
    contactPhone: '',
    status: 'inquiry',
    notes: '',
    deposit: '',
    balance: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    addWedding({
      ...formData,
      createdAt: new Date().toISOString()
    })
    toast.success('Wedding reservation created')
    setFormData({
      coupleName: '',
      weddingDate: '',
      venue: '',
      guestCount: '',
      budget: '',
      package: 'standard',
      contactEmail: '',
      contactPhone: '',
      status: 'inquiry',
      notes: '',
      deposit: '',
      balance: ''
    })
    setShowForm(false)
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'inquiry':
        return 'bg-blue-100 text-blue-800'
      case 'booked':
        return 'bg-green-100 text-green-800'
      case 'confirmed':
        return 'bg-purple-100 text-purple-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPackageBadge = (pkg) => {
    const colors = {
      basic: 'bg-gray-200 text-gray-800',
      standard: 'bg-blue-200 text-blue-800',
      premium: 'bg-purple-200 text-purple-800',
      luxury: 'bg-yellow-200 text-yellow-800'
    }
    return colors[pkg] || colors.standard
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wedding Reservations</h1>
          <p className="text-gray-600 mt-1">Manage wedding bookings and events</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          New Reservation
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <p className="text-sm text-gray-600">Total Bookings</p>
          <p className="text-2xl font-bold mt-1">{weddings.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Confirmed</p>
          <p className="text-2xl font-bold mt-1 text-green-600">
            {weddings.filter(w => w.status === 'confirmed' || w.status === 'booked').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Inquiries</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">
            {weddings.filter(w => w.status === 'inquiry').length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold mt-1 text-purple-600">
            ${weddings.reduce((sum, w) => sum + (parseInt(w.deposit) || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Create Wedding Form */}
      {showForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">New Wedding Reservation</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Couple Name *</label>
              <input
                type="text"
                name="coupleName"
                value={formData.coupleName}
                onChange={handleInputChange}
                className="input"
                placeholder="John & Jane"
                required
              />
            </div>
            <div>
              <label className="label">Wedding Date *</label>
              <input
                type="date"
                name="weddingDate"
                value={formData.weddingDate}
                onChange={handleInputChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Venue</label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                className="input"
                placeholder="Venue name or location"
              />
            </div>
            <div>
              <label className="label">Guest Count</label>
              <input
                type="number"
                name="guestCount"
                value={formData.guestCount}
                onChange={handleInputChange}
                className="input"
                min="1"
              />
            </div>
            <div>
              <label className="label">Budget</label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                className="input"
                placeholder="Total budget"
              />
            </div>
            <div>
              <label className="label">Package *</label>
              <select
                name="package"
                value={formData.package}
                onChange={handleInputChange}
                className="input"
                required
              >
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
            <div>
              <label className="label">Contact Email *</label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleInputChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Contact Phone</label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleInputChange}
                className="input"
              />
            </div>
            <div>
              <label className="label">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="input"
              >
                <option value="inquiry">Inquiry</option>
                <option value="booked">Booked</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="label">Deposit Paid</label>
              <input
                type="number"
                name="deposit"
                value={formData.deposit}
                onChange={handleInputChange}
                className="input"
                placeholder="$"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="input"
                rows="3"
                placeholder="Special requests, preferences, etc."
              />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create Reservation
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Weddings List */}
      <div className="grid grid-cols-1 gap-4">
        {weddings.length > 0 ? (
          weddings
            .sort((a, b) => new Date(a.weddingDate) - new Date(b.weddingDate))
            .map((wedding) => (
              <div key={wedding.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Heart className="w-6 h-6 text-pink-500" />
                      <div>
                        <h3 className="font-bold text-lg">{wedding.coupleName}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(wedding.status)}`}>
                            {wedding.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPackageBadge(wedding.package)}`}>
                            {wedding.package}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="flex items-center space-x-2 text-gray-600 mb-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {wedding.weddingDate && format(new Date(wedding.weddingDate), 'MMMM d, yyyy')}
                          </span>
                        </div>
                        {wedding.venue && (
                          <p className="text-gray-600">📍 {wedding.venue}</p>
                        )}
                      </div>

                      <div>
                        {wedding.guestCount && (
                          <div className="flex items-center space-x-2 text-gray-600 mb-2">
                            <Users className="w-4 h-4" />
                            <span>{wedding.guestCount} guests</span>
                          </div>
                        )}
                        <p className="text-gray-600">
                          📧 {wedding.contactEmail}
                        </p>
                        {wedding.contactPhone && (
                          <p className="text-gray-600">📞 {wedding.contactPhone}</p>
                        )}
                      </div>

                      <div>
                        {wedding.budget && (
                          <div className="flex items-center space-x-2 text-gray-600 mb-2">
                            <DollarSign className="w-4 h-4" />
                            <span>Budget: ${parseInt(wedding.budget).toLocaleString()}</span>
                          </div>
                        )}
                        {wedding.deposit && (
                          <p className="text-green-600 font-medium">
                            Deposit: ${parseInt(wedding.deposit).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {wedding.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Notes:</span> {wedding.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this reservation?')) {
                        removeWedding(wedding.id)
                        toast.success('Reservation deleted')
                      }
                    }}
                    className="text-red-600 hover:text-red-800 ml-4"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
        ) : (
          <div className="card text-center py-12">
            <Heart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-400">No wedding reservations yet. Create your first one!</p>
          </div>
        )}
      </div>
    </div>
  )
}
