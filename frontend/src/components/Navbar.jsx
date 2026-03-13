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
                    <Link to="/profile" className="user-info-link">
                        <div className="user-info">
                            <img 
                                src={user.profile_picture_url} 
                                alt={user.name} 
                                className="user-avatar-img"
                            />
                            <div className="user-details">
                                <span className="user-name">{user.name}</span>
                                <span className="user-role">{user.role}</span>
                            </div>
                        </div>
                    </Link>
                    <button onClick={handleLogout} className="btn btn-outline btn-sm">
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
}
