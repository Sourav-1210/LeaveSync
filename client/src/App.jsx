import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LeaveProvider } from './context/LeaveContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { ReimbursementProvider } from './context/ReimbursementContext';

import ProtectedRoute from './routes/ProtectedRoute';
import RoleBasedRoute from './routes/RoleBasedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import EmployeeDashboard from './pages/dashboard/EmployeeDashboard';
import ManagerDashboard from './pages/dashboard/ManagerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import MyLeavesPage from './pages/dashboard/MyLeavesPage';
import LeaveRequestsPage from './pages/dashboard/LeaveRequestsPage';
import MyTeamPage from './pages/dashboard/MyTeamPage';
import AllLeavesPage from './pages/dashboard/AllLeavesPage';
import UsersPage from './pages/dashboard/UsersPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import ReimbursementsPage from './pages/dashboard/ReimbursementsPage';

// Auto-redirect logged-in users from / or /login to their dashboard
const HomeRedirect = () => {
  const { user } = useAuth();
  const map = { admin: '/dashboard/admin', manager: '/dashboard/manager', employee: '/dashboard/employee' };
  if (user) return <Navigate to={map[user.role] || '/dashboard/employee'} replace />;
  return <LandingPage />;
};

const LoginRedirect = () => {
  const { user } = useAuth();
  const map = { admin: '/dashboard/admin', manager: '/dashboard/manager', employee: '/dashboard/employee' };
  if (user) return <Navigate to={map[user.role] || '/dashboard/employee'} replace />;
  return <LoginPage />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginRedirect />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Employee routes */}
      <Route path="/dashboard/employee" element={
        <ProtectedRoute><RoleBasedRoute roles={['employee']}><EmployeeDashboard /></RoleBasedRoute></ProtectedRoute>
      } />
      <Route path="/dashboard/employee/leaves" element={
        <ProtectedRoute><RoleBasedRoute roles={['employee']}><MyLeavesPage /></RoleBasedRoute></ProtectedRoute>
      } />
      <Route path="/dashboard/employee/profile" element={
        <ProtectedRoute><RoleBasedRoute roles={['employee']}><ProfilePage /></RoleBasedRoute></ProtectedRoute>
      } />
      <Route path="/dashboard/employee/reimbursements" element={
        <ProtectedRoute><RoleBasedRoute roles={['employee']}><ReimbursementsPage /></RoleBasedRoute></ProtectedRoute>
      } />

      {/* Manager routes */}
      <Route path="/dashboard/manager" element={
        <ProtectedRoute><RoleBasedRoute roles={['manager', 'admin']}><ManagerDashboard /></RoleBasedRoute></ProtectedRoute>
      } />
      <Route path="/dashboard/manager/leaves" element={
        <ProtectedRoute><RoleBasedRoute roles={['manager', 'admin']}><LeaveRequestsPage /></RoleBasedRoute></ProtectedRoute>
      } />
      <Route path="/dashboard/manager/team" element={
        <ProtectedRoute><RoleBasedRoute roles={['manager', 'admin']}><MyTeamPage /></RoleBasedRoute></ProtectedRoute>
      } />
      <Route path="/dashboard/manager/profile" element={
        <ProtectedRoute><RoleBasedRoute roles={['manager', 'admin']}><ProfilePage /></RoleBasedRoute></ProtectedRoute>
      } />
      <Route path="/dashboard/manager/reimbursements" element={
        <ProtectedRoute><RoleBasedRoute roles={['manager', 'admin']}><ReimbursementsPage /></RoleBasedRoute></ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/dashboard/admin" element={
        <ProtectedRoute><RoleBasedRoute roles={['admin']}><AdminDashboard /></RoleBasedRoute></ProtectedRoute>
      } />
      <Route path="/dashboard/admin/users" element={
        <ProtectedRoute><RoleBasedRoute roles={['admin']}><UsersPage /></RoleBasedRoute></ProtectedRoute>
      } />
      <Route path="/dashboard/admin/leaves" element={
        <ProtectedRoute><RoleBasedRoute roles={['admin']}><AllLeavesPage /></RoleBasedRoute></ProtectedRoute>
      } />
      <Route path="/dashboard/admin/profile" element={
        <ProtectedRoute><RoleBasedRoute roles={['admin']}><ProfilePage /></RoleBasedRoute></ProtectedRoute>
      } />
      <Route path="/dashboard/admin/reimbursements" element={
        <ProtectedRoute><RoleBasedRoute roles={['admin']}><ReimbursementsPage /></RoleBasedRoute></ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
          <h1 className="text-6xl font-black text-green-500 mb-4">404</h1>
          <p className="text-gray-500 mb-6">Page not found</p>
          <a href="/" className="btn-primary">Go Home</a>
        </div>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <LeaveProvider>
            <ReimbursementProvider>
              <BrowserRouter>
                <AppRoutes />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      borderRadius: '12px',
                      background: '#fff',
                      color: '#1f2937',
                      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
                      fontSize: '14px',
                      fontWeight: 500,
                    },
                    success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                  }}
                />
              </BrowserRouter>
            </ReimbursementProvider>
          </LeaveProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

