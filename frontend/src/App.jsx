import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
const Dashboard    = lazy(() => import('./pages/Dashboard'));
const Reports      = lazy(() => import('./pages/Reports'));
const Users        = lazy(() => import('./pages/Users'));
const MyAssets     = lazy(() => import('./pages/MyAssets'));
const AssetList    = lazy(() => import('./pages/AssetList'));
const AssetDetail  = lazy(() => import('./pages/AssetDetail'));
const Search       = lazy(() => import('./pages/Search'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Settings     = lazy(() => import('./pages/Settings'));
import './App.css';
import {lazy} from "react";

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
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                <MainLayout title="Dashboard">
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                <MainLayout title="Reports">
                  <Reports />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                <MainLayout title="User Management">
                  <Users />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-assets"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'DEVELOPER']}>
                <MainLayout title="My Assets">
                  <MyAssets />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/assets"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                <MainLayout title="Assets">
                  <AssetList />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'DEVELOPER']}>
                <MainLayout title="Search">
                  <Search />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'DEVELOPER']}>
                <MainLayout title="Notifications">
                  <Notifications />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/assets/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'DEVELOPER']}>
                <MainLayout title="Asset Detail">
                  <AssetDetail />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                <MainLayout title="Settings">
                  <Settings />
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
