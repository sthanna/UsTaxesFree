import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { ReturnView } from './pages/ReturnView';
import { FormInput } from './pages/FormInput';
import { Schedule1 } from './pages/Schedule1';
import { Dependents } from './pages/Dependents';
import { Payments } from './pages/Payments';
import { ScheduleA } from './pages/ScheduleA';
import { Profile } from './pages/Profile';
import { Onboarding } from './pages/Onboarding';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/return/:id"
                element={
                    <ProtectedRoute>
                        <ReturnView />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/return/:id/forms"
                element={
                    <ProtectedRoute>
                        <FormInput />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/return/:id/schedule1"
                element={
                    <ProtectedRoute>
                        <Schedule1 />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/return/:id/dependents"
                element={
                    <ProtectedRoute>
                        <Dependents />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/return/:id/payments"
                element={
                    <ProtectedRoute>
                        <Payments />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/return/:id/schedule-a"
                element={
                    <ProtectedRoute>
                        <ScheduleA />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/onboarding"
                element={
                    <ProtectedRoute>
                        <Onboarding />
                    </ProtectedRoute>
                }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <ToastProvider position="top-right">
                    <AppRoutes />
                </ToastProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
