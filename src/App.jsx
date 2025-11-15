import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Applicants from './pages/Applicants'
import Events from './pages/Events'
import Weddings from './pages/Weddings'
import Predictions from './pages/Predictions'
import Settings from './pages/Settings'

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="applicants" element={<Applicants />} />
          <Route path="events" element={<Events />} />
          <Route path="weddings" element={<Weddings />} />
          <Route path="predictions" element={<Predictions />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
