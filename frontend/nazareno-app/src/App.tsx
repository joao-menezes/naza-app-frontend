import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Rooms from './pages/Rooms'
import Members from './pages/Members'
import Ranking from './pages/Ranking'
import Media from './pages/Media'
import ManageMembers from './pages/ManageMembers'
import ManageTeachers from './pages/ManageTeachers'

import PrivateRoute from './components/PrivateRoute'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={
          <PrivateRoute>
            <Home />
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
        <Route path="/rooms/:roomId/media" element={
          <PrivateRoute>
            <Media />
          </PrivateRoute>
        } />
        <Route path="/ranking" element={
          <PrivateRoute>
            <Ranking />
          </PrivateRoute>
        } />
        <Route path="/manage-members" element={
          <PrivateRoute>
            <ManageMembers />
          </PrivateRoute>
        } />
        <Route path="/manage-teachers" element={
          <PrivateRoute>
            <ManageTeachers />
          </PrivateRoute>
        } />
        <Route path='/dashboard' element={
          <PrivateRoute>
            <Dashboard/>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}