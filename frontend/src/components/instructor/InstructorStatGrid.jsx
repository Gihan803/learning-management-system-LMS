export default function InstructorStatGrid({ courses, students }) {
    const approvedCourses = courses.filter(c => c.status === 'approved').length;

    return (
        <div className="stats-grid">
            <div className="stat-card stat-primary">
                <div className="stat-number">{courses.length}</div>
                <div className="stat-label">My Courses</div>
            </div>
            <div className="stat-card stat-success">
                <div className="stat-number">{approvedCourses}</div>
                <div className="stat-label">Approved</div>
            </div>
            <div className="stat-card stat-info">
                <div className="stat-number">{students.length}</div>
                <div className="stat-label">Enrolled Students</div>
            </div>
        </div>
    );
}
