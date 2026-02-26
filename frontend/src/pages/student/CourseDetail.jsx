import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import Navbar from '../../components/Navbar';

export default function CourseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizResult, setQuizResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { loadCourse(); }, [id]);

    const loadCourse = async () => {
        try {
            const res = await API.get(`/courses/${id}`);
            setData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        try {
            await API.post(`/courses/${id}/enroll`);
            loadCourse();
        } catch (err) {
            alert(err.response?.data?.message || 'Enrollment failed');
        }
    };

    const handleCompleteMaterial = async (materialId) => {
        try {
            await API.post(`/materials/${materialId}/complete`);
            loadCourse();
        } catch (err) {
            if (err.response?.status !== 409) {
                alert('Failed to mark as complete');
            }
        }
    };

    const handleSubmitQuiz = async (quizId) => {
        setSubmitting(true);
        try {
            const answers = Object.entries(quizAnswers).map(([questionId, selectedOption]) => ({
                question_id: parseInt(questionId),
                selected_option: selectedOption,
            }));
            const res = await API.post(`/quizzes/${quizId}/attempt`, { answers });
            setQuizResult(res.data);
            loadCourse();
        } catch (err) {
            alert(err.response?.data?.message || 'Quiz submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        return match ? `https://www.youtube.com/embed/${match[1]}` : url;
    };

    if (loading) return <><Navbar /><div className="loading-screen"><div className="spinner"></div></div></>;
    if (!data) return <><Navbar /><div className="dashboard"><p>Course not found.</p></div></>;

    const { course, is_enrolled, completed_materials } = data;
    const totalMaterials = course.materials?.length || 0;
    const completedCount = completed_materials?.length || 0;
    const progress = totalMaterials > 0 ? Math.round((completedCount / totalMaterials) * 100) : 0;

    return (
        <>
            <Navbar />
            <div className="dashboard">
                <button onClick={() => navigate('/student/dashboard')} className="btn btn-outline btn-sm mb-1">
                    ← Back to Dashboard
                </button>

                <div className="course-detail-header">
                    <div>
                        <h1>{course.title}</h1>
                        <p className="course-instructor">👨‍🏫 {course.instructor?.name}</p>
                        <p>{course.description}</p>
                    </div>
                    {!is_enrolled && (
                        <button onClick={handleEnroll} className="btn btn-primary btn-lg">
                            Enroll in Course
                        </button>
                    )}
                </div>

                {is_enrolled && (
                    <div className="progress-section">
                        <div className="progress-info">
                            <span>Progress: {progress}%</span>
                            <span>{completedCount}/{totalMaterials} materials completed</span>
                        </div>
                        <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                )}

                {/* Materials Section */}
                <div className="section">
                    <h2>📚 Course Materials</h2>
                    {course.materials?.length === 0 ? (
                        <p className="text-muted">No materials added yet.</p>
                    ) : (
                        <div className="materials-list">
                            {course.materials?.map((material) => {
                                const isCompleted = completed_materials?.includes(material.id);
                                return (
                                    <div key={material.id} className={`material-item ${isCompleted ? 'completed' : ''}`}>
                                        <div className="material-info">
                                            <span className="material-icon">{material.type === 'video' ? '🎬' : '📄'}</span>
                                            <div>
                                                <h4>{material.title}</h4>
                                                <span className="badge badge-sm">{material.type.toUpperCase()}</span>
                                            </div>
                                        </div>
                                        <div className="material-actions">
                                            {material.type === 'video' && material.content_url && (
                                                <div className="video-container">
                                                    <iframe
                                                        src={getYouTubeEmbedUrl(material.content_url)}
                                                        title={material.title}
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    ></iframe>
                                                </div>
                                            )}
                                            {material.type === 'pdf' && material.file_path && (
                                                <a
                                                    href={`http://localhost:8000/storage/${material.file_path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-outline btn-sm"
                                                >
                                                    View PDF
                                                </a>
                                            )}
                                            {is_enrolled && !isCompleted && (
                                                <button
                                                    onClick={() => handleCompleteMaterial(material.id)}
                                                    className="btn btn-success btn-sm"
                                                >
                                                    ✓ Mark Complete
                                                </button>
                                            )}
                                            {isCompleted && <span className="badge badge-success">✓ Completed</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Quizzes Section */}
                {is_enrolled && (
                    <div className="section">
                        <h2>📝 Quizzes</h2>
                        {course.quizzes?.length === 0 ? (
                            <p className="text-muted">No quizzes available yet.</p>
                        ) : (
                            course.quizzes?.map((quiz) => (
                                <div key={quiz.id} className="quiz-card">
                                    <div className="quiz-header">
                                        <h3>{quiz.title}</h3>
                                        <span className="badge badge-info">{quiz.questions?.length || 0} questions</span>
                                    </div>

                                    {activeQuiz === quiz.id ? (
                                        <div className="quiz-form">
                                            {quizResult ? (
                                                <div className="quiz-result">
                                                    <h4>Quiz Results</h4>
                                                    <div className="result-score">
                                                        <span className="score-number">{quizResult.score}%</span>
                                                        <span className="score-detail">
                                                            {quizResult.correct_answers}/{quizResult.total_questions} correct
                                                        </span>
                                                    </div>
                                                    <button onClick={() => { setActiveQuiz(null); setQuizResult(null); setQuizAnswers({}); }}
                                                        className="btn btn-outline">
                                                        Close
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    {quiz.questions?.map((q, idx) => (
                                                        <div key={q.id} className="question-block">
                                                            <p className="question-text"><strong>Q{idx + 1}:</strong> {q.question_text}</p>
                                                            <div className="options">
                                                                {['a', 'b', 'c', 'd'].map((opt) => (
                                                                    <label key={opt} className={`option-label ${quizAnswers[q.id] === opt ? 'selected' : ''}`}>
                                                                        <input
                                                                            type="radio"
                                                                            name={`q-${q.id}`}
                                                                            value={opt}
                                                                            checked={quizAnswers[q.id] === opt}
                                                                            onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: opt })}
                                                                        />
                                                                        <span className="option-key">{opt.toUpperCase()}</span>
                                                                        {q[`option_${opt}`]}
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div className="quiz-actions">
                                                        <button
                                                            onClick={() => handleSubmitQuiz(quiz.id)}
                                                            className="btn btn-primary"
                                                            disabled={submitting || Object.keys(quizAnswers).length < (quiz.questions?.length || 0)}
                                                        >
                                                            {submitting ? 'Submitting...' : 'Submit Quiz'}
                                                        </button>
                                                        <button onClick={() => { setActiveQuiz(null); setQuizAnswers({}); }}
                                                            className="btn btn-outline">
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <button onClick={() => { setActiveQuiz(quiz.id); setQuizAnswers({}); setQuizResult(null); }}
                                            className="btn btn-primary">
                                            Take Quiz
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
