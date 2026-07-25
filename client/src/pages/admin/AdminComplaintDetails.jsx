import { useEffect, useState } from "react";
import {
    Link,
    useParams
} from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout";

import {
    getAdminComplaintById,
    updateComplaintStatus
} from "../../services/admin.service";

const AdminComplaintDetails = () => {
    const { id } = useParams();

    const [complaint, setComplaint] = useState(null);

    const [formData, setFormData] = useState({
        status: "",
        adminRemark: ""
    });

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const fetchComplaint = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await getAdminComplaintById(id);

            setComplaint(response.data);

            setFormData({
                status: response.data.status || "Pending",
                adminRemark:
                    response.data.adminRemark || ""
            });
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Unable to load complaint details."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaint();
    }, [id]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setUpdating(true);
        setError("");
        setMessage("");

        try {
            const response =
                await updateComplaintStatus(id, formData);

            setComplaint(response.data);
            setMessage(response.message);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Unable to update complaint status."
            );
        } finally {
            setUpdating(false);
        }
    };

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

    if (error && !complaint) {
        return (
            <DashboardLayout>
                <div className="error-message">
                    {error}
                </div>

                <Link
                    to="/admin/complaints"
                    className="primary-link-button"
                >
                    Back to Complaints
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
                        Review the complaint and update its progress.
                    </p>
                </div>

                <Link
                    to="/admin/complaints"
                    className="header-action-button"
                >
                    Back
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

            <section className="admin-details-layout">
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
                        <h3>Submitted By</h3>

                        {complaint.anonymous ? (
                            <p>Anonymous Student</p>
                        ) : complaint.createdBy ? (
                            <div>
                                <p>
                                    <strong>Name:</strong>{" "}
                                    {complaint.createdBy.name}
                                </p>

                                <p>
                                    <strong>Email:</strong>{" "}
                                    {complaint.createdBy.email}
                                </p>
                            </div>
                        ) : (
                            <p>Student details unavailable</p>
                        )}
                    </div>

                    <div className="details-section">
                        <h3>Complaint History</h3>

                        {complaint.history?.length ? (
                            <div className="history-timeline">
                                {complaint.history.map(
                                    (item, index) => (
                                        <div
                                            className="history-item"
                                            key={`${item.action}-${index}`}
                                        >
                                            <div className="history-dot" />

                                            <div className="history-content">
                                                <h3>
                                                    {item.action}
                                                </h3>

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
                                    )
                                )}
                            </div>
                        ) : (
                            <p>No history available.</p>
                        )}
                    </div>
                </article>

                <aside className="status-update-card">
                    <h2>Update Complaint</h2>

                    <p>
                        Change the complaint status and add a remark.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="status">
                                Status
                            </label>

                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                            >
                                <option value="Pending">
                                    Pending
                                </option>

                                <option value="In Progress">
                                    In Progress
                                </option>

                                <option value="Resolved">
                                    Resolved
                                </option>

                                <option value="Rejected">
                                    Rejected
                                </option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="adminRemark">
                                Admin Remark
                            </label>

                            <textarea
                                id="adminRemark"
                                name="adminRemark"
                                value={formData.adminRemark}
                                onChange={handleChange}
                                rows="6"
                                placeholder="Explain the action taken..."
                                maxLength="1000"
                            />
                        </div>

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={updating}
                        >
                            {updating
                                ? "Updating..."
                                : "Update Complaint"}
                        </button>
                    </form>
                </aside>
            </section>
        </DashboardLayout>
    );
};

export default AdminComplaintDetails;