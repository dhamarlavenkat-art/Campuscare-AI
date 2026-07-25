import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout";
import useAuth from "../../hooks/useAuth";

import {
    getAdminDashboardStats,
    getAdminComplaints
} from "../../services/admin.service";

const AdminDashboard = () => {
    const { user } = useAuth();

    const [stats, setStats] = useState({
        totalComplaints: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        rejected: 0,
        highPriority: 0,
        anonymous: 0
    });

    const [recentComplaints, setRecentComplaints] =
        useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    statsResponse,
                    complaintsResponse
                ] = await Promise.all([
                    getAdminDashboardStats(),
                    getAdminComplaints({
                        sort: "newest",
                        page: 1,
                        limit: 5
                    })
                ]);

                setStats(statsResponse.data);

                setRecentComplaints(
                    complaintsResponse.data || []
                );
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                        "Unable to load admin dashboard."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const getStatusClass = (status = "") => {
        return status
            .toLowerCase()
            .replaceAll(" ", "-");
    };

    return (
        <DashboardLayout>
            <section className="page-header page-header-row">
                <div>
                    <h1>Admin Dashboard</h1>

                    <p>
                        Manage complaints assigned to the{" "}
                        <strong>
                            {user?.department}
                        </strong>{" "}
                        department.
                    </p>
                </div>

                <Link
                    to="/admin/complaints"
                    className="header-action-button"
                >
                    View Complaints
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
                            <strong>
                                {stats.totalComplaints}
                            </strong>
                        </article>

                        <article className="stat-card">
                            <span>Pending</span>
                            <strong>
                                {stats.pending}
                            </strong>
                        </article>

                        <article className="stat-card">
                            <span>In Progress</span>
                            <strong>
                                {stats.inProgress}
                            </strong>
                        </article>

                        <article className="stat-card">
                            <span>Resolved</span>
                            <strong>
                                {stats.resolved}
                            </strong>
                        </article>

                        <article className="stat-card">
                            <span>Rejected</span>
                            <strong>
                                {stats.rejected}
                            </strong>
                        </article>

                        <article className="stat-card">
                            <span>High Priority</span>
                            <strong>
                                {stats.highPriority}
                            </strong>
                        </article>

                        <article className="stat-card">
                            <span>Anonymous</span>
                            <strong>
                                {stats.anonymous}
                            </strong>
                        </article>
                    </section>

                    <section className="dashboard-section">
                        <div className="section-heading-row">
                            <div>
                                <h2>
                                    Recent Department Complaints
                                </h2>

                                <p>
                                    Latest complaints routed to{" "}
                                    {user?.department}.
                                </p>
                            </div>

                            <Link
                                to="/admin/complaints"
                                className="text-link"
                            >
                                View All
                            </Link>
                        </div>

                        {recentComplaints.length === 0 ? (
                            <div className="empty-state">
                                <h2>
                                    No Complaints Found
                                </h2>

                                <p>
                                    There are currently no complaints
                                    assigned to your department.
                                </p>
                            </div>
                        ) : (
                            <div className="recent-complaints-list">
                                {recentComplaints.map(
                                    (complaint) => (
                                        <article
                                            key={complaint._id}
                                            className="recent-complaint-row"
                                        >
                                            <div>
                                                <span className="complaint-category">
                                                    {
                                                        complaint.category
                                                    }
                                                </span>

                                                <h3>
                                                    {
                                                        complaint.title
                                                    }
                                                </h3>

                                                <p>
                                                    Priority:{" "}
                                                    {
                                                        complaint.priority
                                                    }
                                                </p>
                                            </div>

                                            <div className="recent-complaint-actions">
                                                <span
                                                    className={`status-badge ${getStatusClass(
                                                        complaint.status
                                                    )}`}
                                                >
                                                    {
                                                        complaint.status
                                                    }
                                                </span>

                                                <Link
                                                    to={`/admin/complaints/${complaint._id}`}
                                                    className="view-button"
                                                >
                                                    View
                                                </Link>
                                            </div>
                                        </article>
                                    )
                                )}
                            </div>
                        )}
                    </section>
                </>
            )}
        </DashboardLayout>
    );
};

export default AdminDashboard;