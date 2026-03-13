export default function CourseCard({ course, onAddMaterial, onCreateQuiz, onDelete }) {
    return (
        <div className="course-card">
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
                <button 
                    onClick={() => onAddMaterial(course.id)} 
                    className="btn btn-outline btn-sm"
                >
                    + Material
                </button>
                <button 
                    onClick={() => onCreateQuiz(course.id)} 
                    className="btn btn-outline btn-sm"
                >
                    + Quiz
                </button>
                <button 
                    onClick={() => onDelete(course.id)} 
                    className="btn btn-danger btn-sm"
                >
                    Delete
                </button>
            </div>
        </div>
    );
}
