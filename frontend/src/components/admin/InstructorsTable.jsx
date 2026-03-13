export default function InstructorsTable({ instructors, onApprove, onReject }) {
    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Courses</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {instructors.map((inst) => (
                        <tr key={inst.id}>
                            <td>{inst.name}</td>
                            <td>{inst.email}</td>
                            <td>{inst.courses_count}</td>
                            <td>
                                <span className={`badge ${inst.is_approved ? 'badge-success' : 'badge-warning'}`}>
                                    {inst.is_approved ? 'Approved' : 'Pending'}
                                </span>
                            </td>
                            <td>
                                {!inst.is_approved ? (
                                    <button onClick={() => onApprove(inst.id)} className="btn btn-success btn-sm">
                                        Approve
                                    </button>
                                ) : (
                                    <button onClick={() => onReject(inst.id)} className="btn btn-danger btn-sm">
                                        Revoke
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
