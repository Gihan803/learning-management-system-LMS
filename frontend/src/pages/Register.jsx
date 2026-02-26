import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
    const [form, setForm] = useState({
        name: '', email: '', password: '', password_confirmation: '', role: 'student'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await register(form.name, form.email, form.password, form.password_confirmation, form.role);
            switch (user.role) {
                case 'instructor': navigate('/instructor/dashboard'); break;
                default: navigate('/student/dashboard');
            }
        } catch (err) {
            const messages = err.response?.data?.errors;
            if (messages) {
                setError(Object.values(messages).flat().join('. '));
            } else {
                setError(err.response?.data?.message || 'Registration failed.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <span className="auth-icon">🎓</span>
                    <h1>Create Account</h1>
                    <p>Join the Learning Management System</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text" id="name" name="name"
                            value={form.name} onChange={handleChange}
                            placeholder="Enter your full name" required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email" id="email" name="email"
                            value={form.email} onChange={handleChange}
                            placeholder="Enter your email" required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password" id="password" name="password"
                            value={form.password} onChange={handleChange}
                            placeholder="Min 8 characters" required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password_confirmation">Confirm Password</label>
                        <input
                            type="password" id="password_confirmation" name="password_confirmation"
                            value={form.password_confirmation} onChange={handleChange}
                            placeholder="Confirm your password" required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">Register as</label>
                        <select id="role" name="role" value={form.role} onChange={handleChange}>
                            <option value="student">Student</option>
                            <option value="instructor">Instructor</option>
                        </select>
                    </div>

                    {form.role === 'instructor' && (
                        <div className="alert alert-info">
                            ℹ️ Instructor accounts require admin approval before you can create courses.
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
