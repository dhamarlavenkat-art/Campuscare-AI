import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { getMyComplaints } from "../../services/complaint.service";

const StudentDashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getMyComplaints();

                setComplaints(response.data || []);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                        "Unable to load dashboard data."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const stats = useMemo(() => {
        return complaints.reduce(
            (result, complaint) => {
                result.total += 1;

                if (complaint.status === "Pending") {
                    result.pending += 1;
                }

                if (complaint.status === "In Progress") {
                    result.inProgress += 1;
                }

                if (complaint.status === "Resolved") {
                    result.resolved += 1;
                }

                if (complaint.status === "Rejected") {
                    result.rejected += 1;
                }

                return result;
            },
            {
                total: 0,
                pending: 0,
                inProgress: 0,
                resolved: 0,
                rejected: 0
            }
        );
    }, [complaints]);

    const recentComplaints = complaints.slice(0, 5);

    const getStatusClass = (status = "") => {
        return status
            .toLowerCase()
            .replaceAll(" ", "-");
    };

    return (
        <DashboardLayout>
            <section className="page-header page-header-row">
                <div>
                    <h1>Student Dashboard</h1>

                    <p>
                        Track your complaints and their current progress.
                    </p>
                </div>

                <Link
                    to="/student/create-complaint"
                    className="header-action-button"
                >
                    Create Complaint
                </Link>
            </section>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="empty-state">
                    <p>Loading dashboard...</p>
                </div>
            ) : (
                <>
                    <section className="stats-grid">
                        <article className="stat-card">
                            <span>Total Complaints</span>
                            <strong>{stats.total}</strong>
                        </article>

                        <article className="stat-card">
                            <span>Pending</span>
                            <strong>{stats.pending}</strong>
                        </article>

                        <article className="stat-card">
                            <span>In Progress</span>
                            <strong>{stats.inProgress}</strong>
                        </article>

                        <article className="stat-card">
                            <span>Resolved</span>
                            <strong>{stats.resolved}</strong>
                        </article>

                        <article className="stat-card">
                            <span>Rejected</span>
                            <strong>{stats.rejected}</strong>
                        </article>
                    </section>

                    <section className="dashboard-section">
                        <div className="section-heading-row">
                            <div>
                                <h2>Recent Complaints</h2>

                                <p>
                                    Your latest complaint submissions.
                                </p>
                            </div>

                            <Link
                                to="/student/complaints"
                                className="text-link"
                            >
                                View All
                            </Link>
                        </div>

                        {recentComplaints.length === 0 ? (
                            <div className="empty-state">
                                <h2>No Complaints Yet</h2>

                                <p>
                                    Submit your first complaint to begin tracking it.
                                </p>

                                <Link
                                    to="/student/create-complaint"
                                    className="primary-link-button"
                                >
                                    Create Complaint
                                </Link>
                            </div>
                        ) : (
                            <div className="recent-complaints-list">
                                {recentComplaints.map((complaint) => (
                                    <article
                                        key={complaint._id}
                                        className="recent-complaint-row"
                                    >
                                        <div>
                                            <span className="complaint-category">
                                                {complaint.category}
                                            </span>

                                            <h3>{complaint.title}</h3>

                                            <p>
                                                {complaint.department} Department
                                            </p>
                                        </div>

                                        <div className="recent-complaint-actions">
                                            <span
                                                className={`status-badge ${getStatusClass(
                                                    complaint.status
                                                )}`}
                                            >
                                                {complaint.status}
                                            </span>

                                            <Link
                                                to={`/student/complaints/${complaint._id}`}
                                                className="view-button"
                                            >
                                                View
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}
        </DashboardLayout>
    );
};

export default StudentDashboard;