export default function StudentsTable({ students, onToggleBlock }) {
    return (
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
                                    onClick={() => onToggleBlock(student.id)}
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
    );
}
