import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../contexts/AuthContext';

export default function InstructorDashboard() {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('courses');
    const [showCreateCourse, setShowCreateCourse] = useState(false);
    const [showAddMaterial, setShowAddMaterial] = useState(null);
    const [showCreateQuiz, setShowCreateQuiz] = useState(null);
    const [showAddQuestions, setShowAddQuestions] = useState(null);
    const [courseForm, setCourseForm] = useState({ title: '', description: '' });
    const [materialForm, setMaterialForm] = useState({ title: '', type: 'video', content_url: '', sort_order: 0 });
    const [materialFile, setMaterialFile] = useState(null);
    const [quizForm, setQuizForm] = useState({ title: '' });
    const [questions, setQuestions] = useState([{ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a' }]);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [coursesRes, studentsRes] = await Promise.all([
                API.get('/instructor/courses'),
                API.get('/instructor/students'),
            ]);
            setCourses(coursesRes.data);
            setStudents(studentsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            await API.post('/instructor/courses', courseForm);
            setCourseForm({ title: '', description: '' });
            setShowCreateCourse(false);
            loadData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create course');
        }
    };

    const handleDeleteCourse = async (id) => {
        if (!confirm('Delete this course?')) return;
        try {
            await API.delete(`/instructor/courses/${id}`);
            loadData();
        } catch (err) {
            alert('Failed to delete course');
        }
    };

    const handleAddMaterial = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', materialForm.title);
            formData.append('type', materialForm.type);
            formData.append('sort_order', materialForm.sort_order);

            if (materialForm.type === 'video') {
                formData.append('content_url', materialForm.content_url);
            } else if (materialForm.type === 'pdf' && materialFile) {
                formData.append('file', materialFile);
            }

            await API.post(`/instructor/courses/${showAddMaterial}/materials`, formData);

            setMaterialForm({ title: '', type: 'video', content_url: '', sort_order: 0 });
            setMaterialFile(null);
            setShowAddMaterial(null);
            loadData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add material');
        }
    };

    const handleCreateQuiz = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post(`/instructor/courses/${showCreateQuiz}/quizzes`, quizForm);
            setQuizForm({ title: '' });
            setShowCreateQuiz(null);
            setShowAddQuestions(res.data.quiz.id);
            loadData();
        } catch (err) {
            alert('Failed to create quiz');
        }
    };

    const handleAddQuestions = async (e) => {
        e.preventDefault();
        try {
            await API.post(`/instructor/quizzes/${showAddQuestions}/questions`, { questions });
            setQuestions([{ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a' }]);
            setShowAddQuestions(null);
            loadData();
        } catch (err) {
            alert('Failed to add questions');
        }
    };

    const addQuestion = () => {
        setQuestions([...questions, { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a' }]);
    };

    const updateQuestion = (index, field, value) => {
        const updated = [...questions];
        updated[index][field] = value;
        setQuestions(updated);
    };

    const removeQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    if (loading) return <><Navbar /><div className="loading-screen"><div className="spinner"></div></div></>;

    return (
        <>
            <Navbar />
            <div className="dashboard">
                <div className="dashboard-header">
                    <h1>👨‍🏫 Instructor Dashboard</h1>
                    {!user?.is_approved && (
                        <div className="alert alert-warning">
                            ⏳ Your account is pending admin approval. You cannot create courses until approved.
                        </div>
                    )}
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-number">{courses.length}</div>
                        <div className="stat-label">My Courses</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{courses.filter(c => c.status === 'approved').length}</div>
                        <div className="stat-label">Approved</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">{students.length}</div>
                        <div className="stat-label">Students</div>
                    </div>
                </div>

                <div className="tab-nav">
                    <button className={`tab-btn ${tab === 'courses' ? 'active' : ''}`} onClick={() => setTab('courses')}>
                        My Courses
                    </button>
                    <button className={`tab-btn ${tab === 'students' ? 'active' : ''}`} onClick={() => setTab('students')}>
                        Enrolled Students
                    </button>
                </div>

                {tab === 'courses' && (
                    <>
                        {user?.is_approved && (
                            <button onClick={() => setShowCreateCourse(true)} className="btn btn-primary mb-1">
                                + Create New Course
                            </button>
                        )}

                        {/* Create Course Modal */}
                        {showCreateCourse && (
                            <div className="modal-overlay">
                                <div className="modal">
                                    <h3>Create New Course</h3>
                                    <form onSubmit={handleCreateCourse}>
                                        <div className="form-group">
                                            <label>Course Title</label>
                                            <input type="text" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Description</label>
                                            <textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} rows={3}></textarea>
                                        </div>
                                        <div className="modal-actions">
                                            <button type="submit" className="btn btn-primary">Create</button>
                                            <button type="button" className="btn btn-outline" onClick={() => setShowCreateCourse(false)}>Cancel</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Add Material Modal */}
                        {showAddMaterial && (
                            <div className="modal-overlay">
                                <div className="modal">
                                    <h3>Add Material</h3>
                                    <form onSubmit={handleAddMaterial}>
                                        <div className="form-group">
                                            <label>Title</label>
                                            <input type="text" value={materialForm.title} onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Type</label>
                                            <select value={materialForm.type} onChange={(e) => setMaterialForm({ ...materialForm, type: e.target.value })}>
                                                <option value="video">Video Link</option>
                                                <option value="pdf">PDF</option>
                                            </select>
                                        </div>
                                        {materialForm.type === 'video' ? (
                                            <div className="form-group">
                                                <label>Video URL (YouTube link)</label>
                                                <input type="url" value={materialForm.content_url} onChange={(e) => setMaterialForm({ ...materialForm, content_url: e.target.value })} required />
                                            </div>
                                        ) : (
                                            <div className="form-group">
                                                <label>Upload PDF Document</label>
                                                <input type="file" accept=".pdf" onChange={(e) => setMaterialFile(e.target.files[0])} required />
                                            </div>
                                        )}
                                        <div className="form-group">
                                            <label>Sort Order</label>
                                            <input type="number" value={materialForm.sort_order} onChange={(e) => setMaterialForm({ ...materialForm, sort_order: parseInt(e.target.value) })} />
                                        </div>
                                        <div className="modal-actions">
                                            <button type="submit" className="btn btn-primary">Add Material</button>
                                            <button type="button" className="btn btn-outline" onClick={() => { setShowAddMaterial(null); setMaterialFile(null); }}>Cancel</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Create Quiz Modal */}
                        {showCreateQuiz && (
                            <div className="modal-overlay">
                                <div className="modal">
                                    <h3>Create Quiz</h3>
                                    <form onSubmit={handleCreateQuiz}>
                                        <div className="form-group">
                                            <label>Quiz Title</label>
                                            <input type="text" value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} required />
                                        </div>
                                        <div className="modal-actions">
                                            <button type="submit" className="btn btn-primary">Create & Add Questions</button>
                                            <button type="button" className="btn btn-outline" onClick={() => setShowCreateQuiz(null)}>Cancel</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Add Questions Modal */}
                        {showAddQuestions && (
                            <div className="modal-overlay">
                                <div className="modal modal-lg">
                                    <h3>Add Questions</h3>
                                    <form onSubmit={handleAddQuestions}>
                                        {questions.map((q, idx) => (
                                            <div key={idx} className="question-form-block">
                                                <div className="question-form-header">
                                                    <h4>Question {idx + 1}</h4>
                                                    {questions.length > 1 && (
                                                        <button type="button" className="btn btn-danger btn-sm" onClick={() => removeQuestion(idx)}>✕</button>
                                                    )}
                                                </div>
                                                <div className="form-group">
                                                    <label>Question Text</label>
                                                    <input type="text" value={q.question_text} onChange={(e) => updateQuestion(idx, 'question_text', e.target.value)} required />
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-group">
                                                        <label>Option A</label>
                                                        <input type="text" value={q.option_a} onChange={(e) => updateQuestion(idx, 'option_a', e.target.value)} required />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Option B</label>
                                                        <input type="text" value={q.option_b} onChange={(e) => updateQuestion(idx, 'option_b', e.target.value)} required />
                                                    </div>
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-group">
                                                        <label>Option C</label>
                                                        <input type="text" value={q.option_c} onChange={(e) => updateQuestion(idx, 'option_c', e.target.value)} required />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Option D</label>
                                                        <input type="text" value={q.option_d} onChange={(e) => updateQuestion(idx, 'option_d', e.target.value)} required />
                                                    </div>
                                                </div>
                                                <div className="form-group">
                                                    <label>Correct Answer</label>
                                                    <select value={q.correct_option} onChange={(e) => updateQuestion(idx, 'correct_option', e.target.value)}>
                                                        <option value="a">A</option>
                                                        <option value="b">B</option>
                                                        <option value="c">C</option>
                                                        <option value="d">D</option>
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                        <button type="button" className="btn btn-outline mb-1" onClick={addQuestion}>+ Add Another Question</button>
                                        <div className="modal-actions">
                                            <button type="submit" className="btn btn-primary">Save Questions</button>
                                            <button type="button" className="btn btn-outline" onClick={() => setShowAddQuestions(null)}>Cancel</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        <div className="card-grid">
                            {courses.length === 0 ? (
                                <div className="empty-state"><p>No courses yet. Create your first course!</p></div>
                            ) : (
                                courses.map((course) => (
                                    <div key={course.id} className="course-card">
                                        <div className="course-card-header">
                                            <h3>{course.title}</h3>
                                            <span className={`badge ${course.status === 'approved' ? 'badge-success' : course.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                                                {course.status}
                                            </span>
                                        </div>
                                        <p className="course-description">{course.description}</p>
                                        <div className="course-stats">
                                            <span>📄 {course.materials_count} materials</span>
                                            <span>📝 {course.quizzes_count} quizzes</span>
                                            <span>👥 {course.enrollments_count} enrolled</span>
                                        </div>
                                        <div className="course-actions">
                                            <button onClick={() => setShowAddMaterial(course.id)} className="btn btn-outline btn-sm">+ Material</button>
                                            <button onClick={() => setShowCreateQuiz(course.id)} className="btn btn-outline btn-sm">+ Quiz</button>
                                            <button onClick={() => handleDeleteCourse(course.id)} className="btn btn-danger btn-sm">Delete</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}

                {tab === 'students' && (
                    <div className="table-container">
                        {students.length === 0 ? (
                            <div className="empty-state"><p>No students enrolled yet.</p></div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Enrolled Courses</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student) => (
                                        <tr key={student.id}>
                                            <td>{student.name}</td>
                                            <td>{student.email}</td>
                                            <td>
                                                {student.enrolled_courses?.map((ec) => (
                                                    <span key={ec.course_id} className="badge badge-info mr-05">
                                                        {ec.course_title}
                                                        {ec.completed_at && ' ✓'}
                                                    </span>
                                                ))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
