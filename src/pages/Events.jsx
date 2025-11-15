import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Calendar, Plus, Trash2, Clock, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function Events() {
  const { events, addEvent, removeEvent } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    type: 'meeting',
    date: '',
    time: '',
    duration: '60',
    location: '',
    attendees: '',
    description: '',
    status: 'scheduled'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    addEvent({
      ...formData,
      createdAt: new Date().toISOString()
    })
    toast.success('Event created successfully')
    setFormData({
      title: '',
      type: 'meeting',
      date: '',
      time: '',
      duration: '60',
      location: '',
      attendees: '',
      description: '',
      status: 'scheduled'
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
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'meeting':
        return '👥'
      case 'conference':
        return '🎯'
      case 'presentation':
        return '📊'
      case 'call':
        return '📞'
      default:
        return '📅'
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events & Meetings</h1>
          <p className="text-gray-600 mt-1">Schedule and manage your business events</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          New Event
        </button>
      </div>

      {/* Create Event Form */}
      {showForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Create Event</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Event Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="input"
                required
              >
                <option value="meeting">Meeting</option>
                <option value="conference">Conference</option>
                <option value="presentation">Presentation</option>
                <option value="call">Call</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="input"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="label">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Time *</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Duration (minutes)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="input"
                min="15"
                step="15"
              />
            </div>
            <div>
              <label className="label">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="input"
                placeholder="Office, Online, etc."
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Attendees</label>
              <input
                type="text"
                name="attendees"
                value={formData.attendees}
                onChange={handleInputChange}
                className="input"
                placeholder="Comma-separated names or emails"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="input"
                rows="3"
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
                Create Event
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events.length > 0 ? (
          events
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map((event) => (
              <div key={event.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <span className="text-3xl">{getTypeIcon(event.type)}</span>
                    <div>
                      <h3 className="font-bold text-lg">{event.title}</h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)} mt-1`}>
                        {event.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this event?')) {
                        removeEvent(event.id)
                        toast.success('Event deleted')
                      }
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {event.date && format(new Date(event.date), 'MMMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{event.time} ({event.duration} minutes)</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>

                {event.attendees && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Attendees:</span> {event.attendees}
                    </p>
                  </div>
                )}

                {event.description && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-700">{event.description}</p>
                  </div>
                )}
              </div>
            ))
        ) : (
          <div className="col-span-2 card text-center py-12">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-400">No events scheduled yet. Create your first event!</p>
          </div>
        )}
      </div>
    </div>
  )
}
