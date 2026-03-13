export default function StatGrid({ analytics }) {
    if (!analytics) return null;

    const stats = [
        { label: 'Total Users', value: analytics.total_users, class: 'stat-primary' },
        { label: 'Students', value: analytics.total_students, class: 'stat-info' },
        { label: 'Instructors', value: analytics.total_instructors, class: 'stat-warning' },
        { label: 'Approved Instructors', value: analytics.approved_instructors, class: 'stat-success' },
        { label: 'Total Courses', value: analytics.total_courses, class: 'stat-primary' },
        { label: 'Approved Courses', value: analytics.approved_courses, class: 'stat-success' },
        { label: 'Pending Courses', value: analytics.pending_courses, class: 'stat-warning' },
        { label: 'Total Enrollments', value: analytics.total_enrollments, class: 'stat-info' },
        { label: 'Completed Enrollments', value: analytics.completed_enrollments, class: 'stat-success' },
    ];

    return (
        <div className="stats-grid stats-grid-wide">
            {stats.map((stat, index) => (
                <div key={index} className={`stat-card ${stat.class}`}>
                    <div className="stat-number">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                </div>
            ))}
        </div>
    );
}
