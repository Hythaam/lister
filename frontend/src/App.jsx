import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute, { PublicRoute } from './components/ProtectedRoute';
import AppLayout from './components/navigation/AppLayout';

// Page imports
import Dashboard from './pages/dashboard/Dashboard';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Lists from './pages/lists/Lists';
import Groups from './pages/groups/Groups';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes (redirect authenticated users) */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />

          {/* Protected routes (require authentication) */}
          <Route path="/*" element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/lists" element={<Lists />} />
                  <Route path="/groups" element={<Groups />} />
                  
                  {/* Catch all - redirect to dashboard */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
