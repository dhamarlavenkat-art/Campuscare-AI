import { useEffect, useState } from "react";
import {
    Link,
    useParams
} from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout";

import {
    getComplaintById,
    getComplaintHistory
} from "../../services/complaint.service";

const ComplaintDetails = () => {
    const { id } = useParams();

    const [complaint, setComplaint] = useState(null);
    const [history, setHistory] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchComplaintDetails = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    complaintResponse,
                    historyResponse
                ] = await Promise.all([
                    getComplaintById(id),
                    getComplaintHistory(id)
                ]);

                setComplaint(complaintResponse.data);
                setHistory(historyResponse.history || []);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                        "Unable to load complaint details."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchComplaintDetails();
    }, [id]);

    const getStatusClass = (status = "") => {
        return status
            .toLowerCase()
            .replaceAll(" ", "-");
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="empty-state">
                    <p>Loading complaint details...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="error-message">
                    {error}
                </div>

                <Link
                    to="/student/complaints"
                    className="primary-link-button"
                >
                    Back to My Complaints
                </Link>
            </DashboardLayout>
        );
    }

    if (!complaint) {
        return (
            <DashboardLayout>
                <div className="empty-state">
                    <h2>Complaint Not Found</h2>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <section className="page-header page-header-row">
                <div>
                    <h1>Complaint Details</h1>

                    <p>
                        View the complete complaint information
                        and progress history.
                    </p>
                </div>

                <Link
                    to="/student/complaints"
                    className="header-action-button"
                >
                    Back
                </Link>
            </section>

            <section className="details-layout">
                <article className="details-card">
                    <div className="details-title-row">
                        <div>
                            <span className="complaint-category">
                                {complaint.category}
                            </span>

                            <h2>{complaint.title}</h2>
                        </div>

                        <span
                            className={`status-badge ${getStatusClass(
                                complaint.status
                            )}`}
                        >
                            {complaint.status}
                        </span>
                    </div>

                    <div className="details-meta-grid">
                        <div>
                            <span>Department</span>
                            <strong>
                                {complaint.department}
                            </strong>
                        </div>

                        <div>
                            <span>Priority</span>
                            <strong>
                                {complaint.priority}
                            </strong>
                        </div>

                        <div>
                            <span>Supporters</span>
                            <strong>
                                {complaint.supporters?.length || 0}
                            </strong>
                        </div>

                        <div>
                            <span>Submitted</span>
                            <strong>
                                {new Date(
                                    complaint.createdAt
                                ).toLocaleString()}
                            </strong>
                        </div>

                        <div>
                            <span>Location</span>
                            <strong>
                                {complaint.location?.roomNumber
                                    ? `${complaint.location.building}, Floor ${complaint.location.floor}, Room ${complaint.location.roomNumber}`
                                    : "Not linked"}
                            </strong>
                        </div>

                        <div>
                            <span>Asset</span>
                            <strong>
                                {complaint.location?.assetName || "Whole room"}
                            </strong>
                        </div>

                        {complaint.location?.assetId && (
                            <div>
                                <span>Units Affected</span>
                                <strong>{complaint.location.affectedQuantity || 1}</strong>
                            </div>
                        )}
                    </div>

                    <div className="details-section">
                        <h3>Description</h3>

                        <p>{complaint.description}</p>
                    </div>

                    {complaint.summary && (
                        <div className="details-section ai-summary-box">
                            <h3>AI Summary</h3>

                            <p>{complaint.summary}</p>
                        </div>
                    )}

                    {complaint.troubleshooting?.length > 0 && (
                        <div className="details-section">
                            <h3>
                                Suggested Troubleshooting
                            </h3>

                            <ol className="troubleshooting-list">
                                {complaint.troubleshooting.map(
                                    (step, index) => (
                                        <li key={index}>
                                            {step}
                                        </li>
                                    )
                                )}
                            </ol>
                        </div>
                    )}

                    {complaint.adminRemark && (
                        <div className="details-section admin-remark-box">
                            <h3>Admin Remark</h3>

                            <p>
                                {complaint.adminRemark}
                            </p>
                        </div>
                    )}

                    {complaint.image && (
                        <div className="details-section">
                            <h3>Complaint Image</h3>

                            <img
                                src={`http://localhost:5000/uploads/${complaint.image}`}
                                alt={complaint.title}
                                className="complaint-image"
                            />
                        </div>
                    )}

                    <div className="details-section">
                        <h3>Submission Type</h3>

                        <p>
                            {complaint.anonymous
                                ? "Anonymous complaint"
                                : "Normal complaint"}
                        </p>
                    </div>
                </article>

                <aside className="history-card">
                    <h2>Complaint History</h2>

                    {history.length === 0 ? (
                        <p className="history-empty">
                            No history available.
                        </p>
                    ) : (
                        <div className="history-timeline">
                            {history.map((item, index) => (
                                <div
                                    className="history-item"
                                    key={`${item.action}-${index}`}
                                >
                                    <div className="history-dot" />

                                    <div className="history-content">
                                        <h3>{item.action}</h3>

                                        <span
                                            className={`status-badge ${getStatusClass(
                                                item.status
                                            )}`}
                                        >
                                            {item.status}
                                        </span>

                                        {item.remark && (
                                            <p>
                                                {item.remark}
                                            </p>
                                        )}

                                        <small>
                                            Updated by{" "}
                                            {item.updatedBy}
                                            {item.date &&
                                                ` • ${new Date(
                                                    item.date
                                                ).toLocaleString()}`}
                                        </small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </aside>
            </section>
        </DashboardLayout>
    );
};

export default ComplaintDetails;
