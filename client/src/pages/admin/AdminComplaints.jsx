import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { getAdminComplaints } from "../../services/admin.service";

const AdminComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [filters, setFilters] = useState({
        search: "",
        status: "",
        category: "",
        priority: "",
        sort: "newest"
    });

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {
                page,
                limit: 8,
                sort: filters.sort
            };

            if (filters.search.trim()) {
                params.search = filters.search.trim();
            }

            if (filters.status) {
                params.status = filters.status;
            }

            if (filters.category) {
                params.category = filters.category;
            }

            if (filters.priority) {
                params.priority = filters.priority;
            }

            const response = await getAdminComplaints(params);

            setComplaints(response.data || []);
            setTotalPages(response.totalPages || 1);
            setTotal(response.total || 0);
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
    }, [
        page,
        filters.status,
        filters.category,
        filters.priority,
        filters.sort
    ]);

    const handleFilterChange = (event) => {
        const { name, value } = event.target;

        setFilters((previousFilters) => ({
            ...previousFilters,
            [name]: value
        }));

        setPage(1);
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        setPage(1);
        fetchComplaints();
    };

    const handleResetFilters = () => {
        setFilters({
            search: "",
            status: "",
            category: "",
            priority: "",
            sort: "newest"
        });

        setPage(1);
    };

    const getStatusClass = (status = "") => {
        return status
            .toLowerCase()
            .replaceAll(" ", "-");
    };

    return (
        <DashboardLayout>
            <section className="page-header">
                <h1>Department Complaints</h1>

                <p>
                    Search, filter and manage complaints assigned
                    to your department.
                </p>
            </section>

            <section className="filter-card">
                <form
                    className="search-row"
                    onSubmit={handleSearchSubmit}
                >
                    <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Search title or description"
                    />

                    <button
                        type="submit"
                        className="primary-search-button"
                    >
                        Search
                    </button>
                </form>

                <div className="filter-grid">
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                    >
                        <option value="">
                            All Statuses
                        </option>

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

                    <select
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                    >
                        <option value="">
                            All Categories
                        </option>

                        <option value="Maintenance">
                            Maintenance
                        </option>

                        <option value="Academic">
                            Academic
                        </option>

                        <option value="Hostel">
                            Hostel
                        </option>

                        <option value="IT">
                            IT
                        </option>

                        <option value="Transport">
                            Transport
                        </option>

                        <option value="Security">
                            Security
                        </option>

                        <option value="Other">
                            Other
                        </option>
                    </select>

                    <select
                        name="priority"
                        value={filters.priority}
                        onChange={handleFilterChange}
                    >
                        <option value="">
                            All Priorities
                        </option>

                        <option value="Low">
                            Low
                        </option>

                        <option value="Medium">
                            Medium
                        </option>

                        <option value="High">
                            High
                        </option>
                    </select>

                    <select
                        name="sort"
                        value={filters.sort}
                        onChange={handleFilterChange}
                    >
                        <option value="newest">
                            Newest First
                        </option>

                        <option value="oldest">
                            Oldest First
                        </option>
                    </select>

                    <button
                        type="button"
                        className="reset-filter-button"
                        onClick={handleResetFilters}
                    >
                        Reset Filters
                    </button>
                </div>
            </section>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="results-heading">
                <h2>Complaints</h2>

                <span>
                    {total} result{total === 1 ? "" : "s"}
                </span>
            </div>

            {loading ? (
                <div className="empty-state">
                    <p>Loading complaints...</p>
                </div>
            ) : complaints.length === 0 ? (
                <div className="empty-state">
                    <h2>No Complaints Found</h2>

                    <p>
                        No complaints match the selected filters.
                    </p>
                </div>
            ) : (
                <div className="admin-complaints-list">
                    {complaints.map((complaint) => (
                        <article
                            key={complaint._id}
                            className="admin-complaint-card"
                        >
                            <div className="admin-complaint-main">
                                <div className="admin-complaint-title-row">
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

                                <div className="admin-complaint-meta">
                                    <span>
                                        <strong>
                                            Priority:
                                        </strong>{" "}
                                        {complaint.priority}
                                    </span>

                                    <span>
                                        <strong>
                                            Supporters:
                                        </strong>{" "}
                                        {complaint.supporters?.length ||
                                            0}
                                    </span>

                                    <span>
                                        <strong>
                                            Anonymous:
                                        </strong>{" "}
                                        {complaint.anonymous
                                            ? "Yes"
                                            : "No"}
                                    </span>

                                    <span>
                                        <strong>
                                            Submitted:
                                        </strong>{" "}
                                        {new Date(
                                            complaint.createdAt
                                        ).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="admin-complaint-actions">
                                <Link
                                    to={`/admin/complaints/${complaint._id}`}
                                    className="view-button"
                                >
                                    View Details
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        type="button"
                        disabled={page === 1}
                        onClick={() =>
                            setPage((currentPage) =>
                                currentPage - 1
                            )
                        }
                    >
                        Previous
                    </button>

                    <span>
                        Page {page} of {totalPages}
                    </span>

                    <button
                        type="button"
                        disabled={page === totalPages}
                        onClick={() =>
                            setPage((currentPage) =>
                                currentPage + 1
                            )
                        }
                    >
                        Next
                    </button>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminComplaints;