import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import Navbar from '../../components/Navbar';

export default function StudentDashboard() {
    const [enrollments, setEnrollments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('my-courses');

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [enrollRes, courseRes] = await Promise.all([
                API.get('/enrollments'),
                API.get('/courses'),
            ]);
            setEnrollments(enrollRes.data);
            setCourses(courseRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (courseId) => {
        try {
            await API.post(`/courses/${courseId}/enroll`);
            loadData();
        } catch (err) {
            alert(err.response?.data?.message || 'Enrollment failed');
        }
    };

    const enrolledCourseIds = enrollments.map(e => e.course?.id);

    if (loading) return <><Navbar /><div className="loading-screen"><div className="spinner"></div></div></>;

    return (
        <>
            <Navbar />
            <div className="dashboard">
                <div className="dashboard-header">
                    <h1>🎓 Student Dashboard</h1>
                    <p>Track your learning progress</p>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-number">{enrollments.length}</div>
                        <div className="stat-label">Enrolled Courses</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{enrollments.filter(e => e.progress >= 100).length}</div>
                        <div className="stat-label">Completed</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{enrollments.filter(e => e.progress > 0 && e.progress < 100).length}</div>
                        <div className="stat-label">In Progress</div>
                    </div>
                </div>

                <div className="tab-nav">
                    <button className={`tab-btn ${tab === 'my-courses' ? 'active' : ''}`} onClick={() => setTab('my-courses')}>
                        My Courses
                    </button>
                    <button className={`tab-btn ${tab === 'browse' ? 'active' : ''}`} onClick={() => setTab('browse')}>
                        Browse Courses
                    </button>
                </div>

                {tab === 'my-courses' && (
                    <div className="card-grid">
                        {enrollments.length === 0 ? (
                            <div className="empty-state">
                                <p>📖 You haven't enrolled in any courses yet.</p>
                                <button className="btn btn-primary" onClick={() => setTab('browse')}>Browse Courses</button>
                            </div>
                        ) : (
                            enrollments.map((enrollment) => (
                                <div key={enrollment.id} className="course-card">
                                    <div className="course-card-header">
                                        <h3>{enrollment.course?.title}</h3>
                                        <span className={`badge ${enrollment.progress >= 100 ? 'badge-success' : 'badge-warning'}`}>
                                            {enrollment.progress >= 100 ? 'Completed' : `${enrollment.progress}%`}
                                        </span>
                                    </div>
                                    <p className="course-instructor">👨‍🏫 {enrollment.course?.instructor?.name}</p>
                                    <div className="progress-bar-container">
                                        <div className="progress-bar" style={{ width: `${enrollment.progress}%` }}></div>
                                    </div>
                                    <div className="course-stats">
                                        <span>📄 {enrollment.completed_materials}/{enrollment.total_materials} Materials</span>
                                        <span>📝 {enrollment.completed_quizzes}/{enrollment.total_quizzes} Quizzes</span>
                                    </div>
                                    <Link to={`/student/course/${enrollment.course?.id}`} className="btn btn-primary btn-full">
                                        Continue Learning
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {tab === 'browse' && (
                    <div className="card-grid">
                        {courses.length === 0 ? (
                            <div className="empty-state"><p>No courses available yet.</p></div>
                        ) : (
                            courses.map((course) => (
                                <div key={course.id} className="course-card">
                                    <div className="course-card-header">
                                        <h3>{course.title}</h3>
                                        <span className="badge badge-info">{course.materials_count} materials</span>
                                    </div>
                                    <p className="course-description">{course.description}</p>
                                    <p className="course-instructor">👨‍🏫 {course.instructor?.name}</p>
                                    <div className="course-stats">
                                        <span>👥 {course.enrollments_count} enrolled</span>
                                        <span>📝 {course.quizzes_count} quizzes</span>
                                    </div>
                                    {enrolledCourseIds.includes(course.id) ? (
                                        <Link to={`/student/course/${course.id}`} className="btn btn-secondary btn-full">
                                            Go to Course
                                        </Link>
                                    ) : (
                                        <button onClick={() => handleEnroll(course.id)} className="btn btn-primary btn-full">
                                            Enroll Now
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
