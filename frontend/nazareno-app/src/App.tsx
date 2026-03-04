import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Rooms from './pages/Rooms'
import Members from './pages/Members'
import PrivateRoute from './components/PrivateRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/rooms" element={
          <PrivateRoute>
            <Rooms />
          </PrivateRoute>
        } />
        <Route path="/rooms/:roomId" element={
          <PrivateRoute>
            <Members />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}