import { useState, useEffect } from 'react';
import API from '../../api/axios';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import InstructorStatGrid from '../../components/instructor/InstructorStatGrid';
import CourseCard from '../../components/instructor/CourseCard';
import EnrolledStudentsTable from '../../components/instructor/EnrolledStudentsTable';
import CreateCourseModal from '../../components/instructor/CreateCourseModal';
import AddMaterialModal from '../../components/instructor/AddMaterialModal';
import CreateQuizModal from '../../components/instructor/CreateQuizModal';
import AddQuestionsModal from '../../components/instructor/AddQuestionsModal';

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

                <InstructorStatGrid courses={courses} students={students} />

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

                        <div className="card-grid">
                            {courses.length === 0 ? (
                                <div className="empty-state"><p>No courses yet. Create your first course!</p></div>
                            ) : (
                                courses.map((course) => (
                                    <CourseCard 
                                        key={course.id} 
                                        course={course} 
                                        onAddMaterial={setShowAddMaterial}
                                        onCreateQuiz={setShowCreateQuiz}
                                        onDelete={handleDeleteCourse}
                                    />
                                ))
                            )}
                        </div>
                    </>
                )}

                {tab === 'students' && (
                    <EnrolledStudentsTable students={students} />
                )}
            </div>

            {/* Modals */}
            <CreateCourseModal 
                isOpen={showCreateCourse}
                onClose={() => setShowCreateCourse(false)}
                onSubmit={handleCreateCourse}
                courseForm={courseForm}
                setCourseForm={setCourseForm}
            />

            <AddMaterialModal 
                courseId={showAddMaterial}
                onClose={() => { setShowAddMaterial(null); setMaterialFile(null); }}
                onSubmit={handleAddMaterial}
                materialForm={materialForm}
                setMaterialForm={setMaterialForm}
                setMaterialFile={setMaterialFile}
            />

            <CreateQuizModal 
                courseId={showCreateQuiz}
                onClose={() => setShowCreateQuiz(null)}
                onSubmit={handleCreateQuiz}
                quizForm={quizForm}
                setQuizForm={setQuizForm}
            />

            <AddQuestionsModal 
                quizId={showAddQuestions}
                onClose={() => setShowAddQuestions(null)}
                onSubmit={handleAddQuestions}
                questions={questions}
                addQuestion={addQuestion}
                updateQuestion={updateQuestion}
                removeQuestion={removeQuestion}
            />
        </>
    );
}
