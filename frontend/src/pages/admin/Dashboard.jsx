import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Navbar from '../../components/Navbar';

export default function AdminDashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [instructors, setInstructors] = useState([]);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('analytics');

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [analyticsRes, instructorsRes, studentsRes, coursesRes] = await Promise.all([
                API.get('/admin/analytics'),
                API.get('/admin/instructors'),
                API.get('/admin/students'),
                API.get('/admin/courses'),
            ]);
            setAnalytics(analyticsRes.data);
            setInstructors(instructorsRes.data);
            setStudents(studentsRes.data);
            setCourses(coursesRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveInstructor = async (id) => {
        try {
            await API.put(`/admin/instructors/${id}/approve`);
            loadData();
        } catch (err) {
            alert('Failed to approve instructor');
        }
    };

    const handleRejectInstructor = async (id) => {
        try {
            await API.put(`/admin/instructors/${id}/reject`);
            loadData();
        } catch (err) {
            alert('Failed to reject instructor');
        }
    };

    const handleToggleBlock = async (id) => {
        try {
            await API.put(`/admin/students/${id}/toggle-block`);
            loadData();
        } catch (err) {
            alert('Failed to update student status');
        }
    };

    const handleApproveCourse = async (id) => {
        try {
            await API.put(`/admin/courses/${id}/approve`);
            loadData();
        } catch (err) {
            alert('Failed to approve course');
        }
    };

    const handleRejectCourse = async (id) => {
        try {
            await API.put(`/admin/courses/${id}/reject`);
            loadData();
        } catch (err) {
            alert('Failed to reject course');
        }
    };

    if (loading) return <><Navbar /><div className="loading-screen"><div className="spinner"></div></div></>;

    return (
        <>
            <Navbar />
            <div className="dashboard">
                <div className="dashboard-header">
                    <h1>🛡️ Admin Dashboard</h1>
                    <p>Manage the Learning Management System</p>
                </div>

                <div className="tab-nav">
                    <button className={`tab-btn ${tab === 'analytics' ? 'active' : ''}`} onClick={() => setTab('analytics')}>
                        📊 Analytics
                    </button>
                    <button className={`tab-btn ${tab === 'instructors' ? 'active' : ''}`} onClick={() => setTab('instructors')}>
                        👨‍🏫 Instructors
                    </button>
                    <button className={`tab-btn ${tab === 'students' ? 'active' : ''}`} onClick={() => setTab('students')}>
                        🎓 Students
                    </button>
                    <button className={`tab-btn ${tab === 'courses' ? 'active' : ''}`} onClick={() => setTab('courses')}>
                        📚 Courses
                    </button>
                </div>

                {tab === 'analytics' && analytics && (
                    <div className="stats-grid stats-grid-wide">
                        <div className="stat-card stat-primary">
                            <div className="stat-number">{analytics.total_users}</div>
                            <div className="stat-label">Total Users</div>
                        </div>
                        <div className="stat-card stat-info">
                            <div className="stat-number">{analytics.total_students}</div>
                            <div className="stat-label">Students</div>
                        </div>
                        <div className="stat-card stat-warning">
                            <div className="stat-number">{analytics.total_instructors}</div>
                            <div className="stat-label">Instructors</div>
                        </div>
                        <div className="stat-card stat-success">
                            <div className="stat-number">{analytics.approved_instructors}</div>
                            <div className="stat-label">Approved Instructors</div>
                        </div>
                        <div className="stat-card stat-primary">
                            <div className="stat-number">{analytics.total_courses}</div>
                            <div className="stat-label">Total Courses</div>
                        </div>
                        <div className="stat-card stat-success">
                            <div className="stat-number">{analytics.approved_courses}</div>
                            <div className="stat-label">Approved Courses</div>
                        </div>
                        <div className="stat-card stat-warning">
                            <div className="stat-number">{analytics.pending_courses}</div>
                            <div className="stat-label">Pending Courses</div>
                        </div>
                        <div className="stat-card stat-info">
                            <div className="stat-number">{analytics.total_enrollments}</div>
                            <div className="stat-label">Total Enrollments</div>
                        </div>
                        <div className="stat-card stat-success">
                            <div className="stat-number">{analytics.completed_enrollments}</div>
                            <div className="stat-label">Completed Enrollments</div>
                        </div>
                    </div>
                )}

                {tab === 'analytics' && courses.some(c => c.status === 'pending') && (
                    <div className="mt-2">
                        <h3>⚠️ Pending Course Approvals</h3>
                        <div className="table-container mt-1">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Course Title</th>
                                        <th>Instructor</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.filter(c => c.status === 'pending').map(course => (
                                        <tr key={course.id}>
                                            <td>{course.title}</td>
                                            <td>{course.instructor?.name}</td>
                                            <td>
                                                <button onClick={() => handleApproveCourse(course.id)} className="btn btn-success btn-sm mr-05">
                                                    Approve
                                                </button>
                                                <button onClick={() => handleRejectCourse(course.id)} className="btn btn-danger btn-sm">
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {tab === 'analytics' && instructors.some(i => !i.is_approved) && (
                    <div className="mt-2">
                        <h3>⚠️ Pending Instructor Approvals</h3>
                        <div className="table-container mt-1">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Instructor Name</th>
                                        <th>Email</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {instructors.filter(i => !i.is_approved).map(inst => (
                                        <tr key={inst.id}>
                                            <td>{inst.name}</td>
                                            <td>{inst.email}</td>
                                            <td>
                                                <button onClick={() => handleApproveInstructor(inst.id)} className="btn btn-success btn-sm mr-05">
                                                    Approve
                                                </button>
                                                <button onClick={() => handleRejectInstructor(inst.id)} className="btn btn-danger btn-sm">
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {tab === 'instructors' && (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Courses</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {instructors.map((inst) => (
                                    <tr key={inst.id}>
                                        <td>{inst.name}</td>
                                        <td>{inst.email}</td>
                                        <td>{inst.courses_count}</td>
                                        <td>
                                            <span className={`badge ${inst.is_approved ? 'badge-success' : 'badge-warning'}`}>
                                                {inst.is_approved ? 'Approved' : 'Pending'}
                                            </span>
                                        </td>
                                        <td>
                                            {!inst.is_approved ? (
                                                <button onClick={() => handleApproveInstructor(inst.id)} className="btn btn-success btn-sm">
                                                    Approve
                                                </button>
                                            ) : (
                                                <button onClick={() => handleRejectInstructor(inst.id)} className="btn btn-danger btn-sm">
                                                    Revoke
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === 'students' && (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Enrollments</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr key={student.id}>
                                        <td>{student.name}</td>
                                        <td>{student.email}</td>
                                        <td>{student.enrollments_count}</td>
                                        <td>
                                            <span className={`badge ${student.is_blocked ? 'badge-danger' : 'badge-success'}`}>
                                                {student.is_blocked ? 'Blocked' : 'Active'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleToggleBlock(student.id)}
                                                className={`btn btn-sm ${student.is_blocked ? 'btn-success' : 'btn-danger'}`}
                                            >
                                                {student.is_blocked ? 'Unblock' : 'Block'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {tab === 'courses' && (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Instructor</th>
                                    <th>Materials</th>
                                    <th>Enrollments</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map((course) => (
                                    <tr key={course.id}>
                                        <td>{course.title}</td>
                                        <td>{course.instructor?.name}</td>
                                        <td>{course.materials_count}</td>
                                        <td>{course.enrollments_count}</td>
                                        <td>
                                            <span className={`badge ${course.status === 'approved' ? 'badge-success' : course.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                                                {course.status}
                                            </span>
                                        </td>
                                        <td>
                                            {course.status !== 'approved' && (
                                                <button onClick={() => handleApproveCourse(course.id)} className="btn btn-success btn-sm mr-05">
                                                    Approve
                                                </button>
                                            )}
                                            {course.status !== 'rejected' && (
                                                <button onClick={() => handleRejectCourse(course.id)} className="btn btn-danger btn-sm">
                                                    Reject
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
