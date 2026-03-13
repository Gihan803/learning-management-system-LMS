import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/Dashboard';
import CourseDetail from './pages/student/CourseDetail';
import InstructorDashboard from './pages/instructor/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import Profile from './pages/Profile';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Student Routes */}
                    <Route path="/student/dashboard" element={
                        <ProtectedRoute roles={['student']}>
                            <StudentDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/student/course/:id" element={
                        <ProtectedRoute roles={['student']}>
                            <CourseDetail />
                        </ProtectedRoute>
                    } />

                    {/* Instructor Routes */}
                    <Route path="/instructor/dashboard" element={
                        <ProtectedRoute roles={['instructor']}>
                            <InstructorDashboard />
                        </ProtectedRoute>
                    } />

                    {/* Admin Routes */}
                    <Route path="/admin/dashboard" element={
                        <ProtectedRoute roles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />

                    {/* Shared Routes */}
                    <Route path="/profile" element={
                        <ProtectedRoute roles={['student', 'instructor', 'admin']}>
                            <Profile />
                        </ProtectedRoute>
                    } />

                    {/* Default redirect */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
