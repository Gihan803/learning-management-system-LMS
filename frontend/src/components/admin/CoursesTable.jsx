export default function CoursesTable({ courses, onApprove, onReject }) {
    return (
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
                                    <button onClick={() => onApprove(course.id)} className="btn btn-success btn-sm mr-05">
                                        Approve
                                    </button>
                                )}
                                {course.status !== 'rejected' && (
                                    <button onClick={() => onReject(course.id)} className="btn btn-danger btn-sm">
                                        Reject
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
