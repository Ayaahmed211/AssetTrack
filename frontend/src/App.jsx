import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Users from './pages/Users';
import MyAssets from './pages/MyAssets';
import AssetList from './pages/AssetList';
import AssetDetail from './pages/AssetDetail';
import Search from './pages/Search';
import Notifications from './pages/Notifications';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <MainLayout title="Dashboard">
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <MainLayout title="Reports">
                  <Reports />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute>
                <MainLayout title="User Management">
                  <Users />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-assets" 
            element={
              <ProtectedRoute>
                <MainLayout title="My Assets">
                  <MyAssets />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/assets" 
            element={
              <ProtectedRoute>
                <MainLayout title="Assets">
                  <AssetList />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/search" 
            element={
              <ProtectedRoute>
                <MainLayout title="Search">
                  <Search />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notifications" 
            element={
              <ProtectedRoute>
                <MainLayout title="Notifications">
                  <Notifications />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/assets/:id" 
            element={
              <ProtectedRoute>
                <MainLayout title="Asset Detail">
                  <AssetDetail />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
