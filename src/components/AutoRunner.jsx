import { useState, useEffect } from 'react'
import { Play, Pause, Plus, Trash2, RefreshCw, Clock, CheckCircle, XCircle, Activity } from 'lucide-react'
import { apiService } from '../services/api'
import toast from 'react-hot-toast'

export default function AutoRunner() {
  const [status, setStatus] = useState(null)
  const [jobs, setJobs] = useState([])
  const [tasks, setTasks] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAddJob, setShowAddJob] = useState(false)
  const [newJob, setNewJob] = useState({
    job_id: '',
    task_name: '',
    schedule_type: 'interval',
    schedule_config: {},
    enabled: true
  })

  useEffect(() => {
    loadData()
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const [statusData, jobsData, tasksData, historyData] = await Promise.all([
        apiService.getAutoRunnerStatus(),
        apiService.getAutoRunnerJobs(),
        apiService.getAvailableTasks(),
        apiService.getAutoRunnerHistory()
      ])
      setStatus(statusData)
      setJobs(jobsData.jobs || [])
      setTasks(tasksData.tasks || [])
      setHistory(historyData.history || [])
    } catch (error) {
      console.error('Failed to load auto runner data:', error)
    }
  }

  const handleStart = async () => {
    setLoading(true)
    try {
      await apiService.startAutoRunner()
      toast.success('Auto Runner started')
      await loadData()
    } catch (error) {
      toast.error('Failed to start Auto Runner')
    } finally {
      setLoading(false)
    }
  }

  const handleStop = async () => {
    setLoading(true)
    try {
      await apiService.stopAutoRunner()
      toast.success('Auto Runner stopped')
      await loadData()
    } catch (error) {
      toast.error('Failed to stop Auto Runner')
    } finally {
      setLoading(false)
    }
  }

  const handleAddJob = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await apiService.createAutoRunnerJob(newJob)
      toast.success('Job created successfully')
      setShowAddJob(false)
      setNewJob({
        job_id: '',
        task_name: '',
        schedule_type: 'interval',
        schedule_config: {},
        enabled: true
      })
      await loadData()
    } catch (error) {
      toast.error('Failed to create job: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteJob = async (jobId) => {
    if (!confirm(`Are you sure you want to delete job ${jobId}?`)) return

    setLoading(true)
    try {
      await apiService.deleteAutoRunnerJob(jobId)
      toast.success('Job deleted')
      await loadData()
    } catch (error) {
      toast.error('Failed to delete job')
    } finally {
      setLoading(false)
    }
  }

  const handleScheduleConfigChange = (key, value) => {
    setNewJob({
      ...newJob,
      schedule_config: {
        ...newJob.schedule_config,
        [key]: value
      }
    })
  }

  const formatNextRun = (nextRun) => {
    if (!nextRun) return 'Not scheduled'
    const date = new Date(nextRun)
    return date.toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold">Auto Runner Status</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadData}
              className="btn btn-secondary btn-sm"
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {status?.is_running ? (
              <button
                onClick={handleStop}
                disabled={loading}
                className="btn btn-secondary btn-sm"
              >
                <Pause className="w-4 h-4 mr-1" />
                Stop
              </button>
            ) : (
              <button
                onClick={handleStart}
                disabled={loading}
                className="btn btn-primary btn-sm"
              >
                <Play className="w-4 h-4 mr-1" />
                Start
              </button>
            )}
          </div>
        </div>

        {status && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <p className="font-semibold flex items-center">
                {status.is_running ? (
                  <span className="text-green-600 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Running
                  </span>
                ) : (
                  <span className="text-gray-600 flex items-center">
                    <XCircle className="w-4 h-4 mr-1" />
                    Stopped
                  </span>
                )}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Active Jobs</p>
              <p className="font-semibold text-2xl">{status.job_count}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Available Tasks</p>
              <p className="font-semibold text-2xl">{status.available_tasks?.length || 0}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">History Items</p>
              <p className="font-semibold text-2xl">{status.history_count}</p>
            </div>
          </div>
        )}
      </div>

      {/* Jobs List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Scheduled Jobs</h3>
          <button
            onClick={() => setShowAddJob(!showAddJob)}
            className="btn btn-primary btn-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Job
          </button>
        </div>

        {/* Add Job Form */}
        {showAddJob && (
          <form onSubmit={handleAddJob} className="mb-4 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Job ID</label>
                <input
                  type="text"
                  value={newJob.job_id}
                  onChange={(e) => setNewJob({ ...newJob, job_id: e.target.value })}
                  className="input"
                  placeholder="e.g., daily_task"
                  required
                />
              </div>
              <div>
                <label className="label">Task</label>
                <select
                  value={newJob.task_name}
                  onChange={(e) => setNewJob({ ...newJob, task_name: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select a task</option>
                  {tasks.map(task => (
                    <option key={task} value={task}>{task}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Schedule Type</label>
              <select
                value={newJob.schedule_type}
                onChange={(e) => setNewJob({ ...newJob, schedule_type: e.target.value, schedule_config: {} })}
                className="input"
              >
                <option value="interval">Interval</option>
                <option value="cron">Cron</option>
              </select>
            </div>

            {newJob.schedule_type === 'interval' && (
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="label text-xs">Hours</label>
                  <input
                    type="number"
                    min="0"
                    value={newJob.schedule_config.hours || ''}
                    onChange={(e) => handleScheduleConfigChange('hours', parseInt(e.target.value) || 0)}
                    className="input"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="label text-xs">Minutes</label>
                  <input
                    type="number"
                    min="0"
                    value={newJob.schedule_config.minutes || ''}
                    onChange={(e) => handleScheduleConfigChange('minutes', parseInt(e.target.value) || 0)}
                    className="input"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="label text-xs">Days</label>
                  <input
                    type="number"
                    min="0"
                    value={newJob.schedule_config.days || ''}
                    onChange={(e) => handleScheduleConfigChange('days', parseInt(e.target.value) || 0)}
                    className="input"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="label text-xs">Weeks</label>
                  <input
                    type="number"
                    min="0"
                    value={newJob.schedule_config.weeks || ''}
                    onChange={(e) => handleScheduleConfigChange('weeks', parseInt(e.target.value) || 0)}
                    className="input"
                    placeholder="0"
                  />
                </div>
              </div>
            )}

            {newJob.schedule_type === 'cron' && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label text-xs">Hour (0-23)</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={newJob.schedule_config.hour || ''}
                    onChange={(e) => handleScheduleConfigChange('hour', parseInt(e.target.value))}
                    className="input"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="label text-xs">Minute (0-59)</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={newJob.schedule_config.minute || ''}
                    onChange={(e) => handleScheduleConfigChange('minute', parseInt(e.target.value))}
                    className="input"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="label text-xs">Day of Week (0-6)</label>
                  <input
                    type="number"
                    min="0"
                    max="6"
                    value={newJob.schedule_config.day_of_week || ''}
                    onChange={(e) => handleScheduleConfigChange('day_of_week', parseInt(e.target.value))}
                    className="input"
                    placeholder="Any"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newJob.enabled}
                  onChange={(e) => setNewJob({ ...newJob, enabled: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Enabled</span>
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddJob(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-sm"
                >
                  Create Job
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Jobs Table */}
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No scheduled jobs</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">Job ID</th>
                  <th className="text-left py-2 px-3">Task</th>
                  <th className="text-left py-2 px-3">Next Run</th>
                  <th className="text-left py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.job_id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-3 font-mono text-sm">{job.job_id}</td>
                    <td className="py-3 px-3">{job.name}</td>
                    <td className="py-3 px-3 text-sm text-gray-600">
                      {formatNextRun(job.next_run)}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleDeleteJob(job.job_id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent History */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4">Recent Executions</h3>
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No execution history yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 10).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {item.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium">{item.task_name}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  item.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
