export default function EnrolledStudentsTable({ students }) {
    if (students.length === 0) {
        return <div className="empty-state"><p>No students enrolled yet.</p></div>;
    }

    return (
        <div className="table-container">
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
        </div>
    );
}
