import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const getDashboardLink = () => {
        if (!user) return '/login';
        switch (user.role) {
            case 'admin': return '/admin/dashboard';
            case 'instructor': return '/instructor/dashboard';
            default: return '/student/dashboard';
        }
    };

    return (
        <nav className="navbar">
            <Link to={getDashboardLink()} className="navbar-brand">
                <span className="brand-icon">📚</span>
                <span className="brand-text">LMS</span>
            </Link>

            {user && (
                <div className="navbar-right">
                    <div className="user-info">
                        <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
                        <div className="user-details">
                            <span className="user-name">{user.name}</span>
                            <span className="user-role">{user.role}</span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn btn-outline btn-sm">
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
}
