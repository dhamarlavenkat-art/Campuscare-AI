import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../../components/common/Loader";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
    getMyComplaints,
    deleteComplaint
} from "../../services/complaint.service";

const MyComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getMyComplaints();

            setComplaints(response.data || []);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Unable to load complaints."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const handleDelete = async (complaintId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this complaint?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setMessage("");

            const response = await deleteComplaint(
                complaintId
            );

            setMessage(response.message);

            setComplaints((previousComplaints) =>
                previousComplaints.filter(
                    (complaint) =>
                        complaint._id !== complaintId
                )
            );
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Unable to delete complaint."
            );
        }
    };

    const getStatusClass = (status) => {
        return status
            .toLowerCase()
            .replaceAll(" ", "-");
    };

    return (
        <DashboardLayout>
            <section className="page-header page-header-row">
                <div>
                    <h1>My Complaints</h1>

                    <p>
                        Track all complaints you have submitted.
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

            {message && (
                <div className="success-message">
                    {message}
                </div>
            )}

            {loading ? (
            <Loader message="Loading complaints..." />
            ) : complaints.length === 0 ? (
                <div className="empty-state">
                    <h2>No Complaints Yet</h2>

                    <p>
                        You have not submitted any complaints.
                    </p>

                    <Link
                        to="/student/create-complaint"
                        className="primary-link-button"
                    >
                        Create Your First Complaint
                    </Link>
                </div>
            ) : (
                <div className="complaints-grid">
                    {complaints.map((complaint) => (
                        <article
                            key={complaint._id}
                            className="complaint-card"
                        >
                            <div className="complaint-card-header">
                                <div>
                                    <span className="complaint-category">
                                        {complaint.category}
                                    </span>

                                    <h2>
                                        {complaint.title}
                                    </h2>
                                </div>

                                <span
                                    className={`status-badge ${getStatusClass(
                                        complaint.status
                                    )}`}
                                >
                                    {complaint.status}
                                </span>
                            </div>

                            <p className="complaint-summary">
                                {complaint.summary ||
                                    complaint.description}
                            </p>

                            <div className="complaint-meta">
                                <span>
                                    <strong>Department:</strong>{" "}
                                    {complaint.department}
                                </span>

                                <span>
                                    <strong>Priority:</strong>{" "}
                                    {complaint.priority}
                                </span>

                                <span>
                                    <strong>Supporters:</strong>{" "}
                                    {complaint.supporters?.length ||
                                        0}
                                </span>
                            </div>

                            <div className="complaint-date">
                                Submitted on{" "}
                                {new Date(
                                    complaint.createdAt
                                ).toLocaleDateString()}
                            </div>

                            <div className="complaint-actions">
                                <Link
                                    to={`/student/complaints/${complaint._id}`}
                                    className="view-button"
                                >
                                    View Details
                                </Link>

                                {complaint.status ===
                                    "Pending" && (
                                    <button
                                        type="button"
                                        className="delete-button"
                                        onClick={() =>
                                            handleDelete(
                                                complaint._id
                                            )
                                        }
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
};

export default MyComplaints;