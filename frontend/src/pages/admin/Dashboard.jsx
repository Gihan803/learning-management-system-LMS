import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Navbar from '../../components/Navbar';
import StatGrid from '../../components/admin/StatGrid';
import InstructorsTable from '../../components/admin/InstructorsTable';
import StudentsTable from '../../components/admin/StudentsTable';
import CoursesTable from '../../components/admin/CoursesTable';

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

    const pendingCourses = courses.filter(c => c.status === 'pending');
    const pendingInstructors = instructors.filter(i => !i.is_approved);

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

                {tab === 'analytics' && (
                    <>
                        <StatGrid analytics={analytics} />

                        {pendingCourses.length > 0 && (
                            <div className="mt-2">
                                <h3>⚠️ Pending Course Approvals</h3>
                                <CoursesTable 
                                    courses={pendingCourses} 
                                    onApprove={handleApproveCourse} 
                                    onReject={handleRejectCourse} 
                                />
                            </div>
                        )}

                        {pendingInstructors.length > 0 && (
                            <div className="mt-2">
                                <h3>⚠️ Pending Instructor Approvals</h3>
                                <InstructorsTable 
                                    instructors={pendingInstructors} 
                                    onApprove={handleApproveInstructor} 
                                    onReject={handleRejectInstructor} 
                                />
                            </div>
                        )}
                    </>
                )}

                {tab === 'instructors' && (
                    <InstructorsTable 
                        instructors={instructors} 
                        onApprove={handleApproveInstructor} 
                        onReject={handleRejectInstructor} 
                    />
                )}

                {tab === 'students' && (
                    <StudentsTable 
                        students={students} 
                        onToggleBlock={handleToggleBlock} 
                    />
                )}

                {tab === 'courses' && (
                    <CoursesTable 
                        courses={courses} 
                        onApprove={handleApproveCourse} 
                        onReject={handleRejectCourse} 
                    />
                )}
            </div>
        </>
    );
}
