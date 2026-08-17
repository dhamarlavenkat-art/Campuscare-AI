import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { getAdminAnalytics } from "../../services/admin.service";
import { getInfrastructureOptions } from "../../services/infrastructure.service";

const initialFilters = {
    period: "thisMonth", startDate: "", endDate: "", building: "", floor: "",
    room: "", category: "", priority: "", status: "", assetType: ""
};

const AdminReports = () => {
    const [filters, setFilters] = useState(initialFilters);
    const [rooms, setRooms] = useState([]);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getInfrastructureOptions()
            .then((response) => setRooms(response.data || []))
            .catch(() => setRooms([]));
    }, []);

    useEffect(() => {
        const loadReport = async () => {
            try {
                setLoading(true);
                setError("");
                const params = Object.fromEntries(
                    Object.entries(filters).filter(([, value]) => value !== "")
                );
                const response = await getAdminAnalytics(params);
                setReport(response.data);
            } catch (requestError) {
                setError(requestError.response?.data?.message || "Unable to load report.");
            } finally {
                setLoading(false);
            }
        };
        loadReport();
    }, [filters]);

    const buildings = useMemo(() => [...new Set(rooms.map((room) => room.building))], [rooms]);
    const floors = useMemo(
        () => [...new Set(rooms.filter((room) => !filters.building || room.building === filters.building).map((room) => room.floor))].sort((a, b) => a - b),
        [rooms, filters.building]
    );
    const filteredRooms = rooms.filter(
        (room) => (!filters.building || room.building === filters.building) &&
            (!filters.floor || String(room.floor) === filters.floor)
    );
    const assetTypes = [...new Set(filteredRooms.flatMap((room) => room.assets.map((asset) => asset.type)))].sort();

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFilters((current) => {
            const next = { ...current, [name]: value };
            if (name === "building") {
                next.floor = ""; next.room = ""; next.assetType = "";
            }
            if (name === "floor") {
                next.room = ""; next.assetType = "";
            }
            if (name === "room") next.assetType = "";
            return next;
        });
    };

    const exportCsv = () => {
        const complaints = report?.complaints || [];
        if (!complaints.length) return;

        const escapeCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
        const headers = ["Complaint", "Building", "Floor", "Room", "Asset", "Category", "Priority", "Status", "Created"];
        const rows = complaints.map((complaint) => [
            complaint.title,
            complaint.location?.building || "",
            complaint.location?.floor ?? "",
            complaint.location?.roomNumber || "",
            complaint.location?.assetType || "",
            complaint.category,
            complaint.priority,
            complaint.status,
            new Date(complaint.createdAt).toLocaleDateString()
        ]);
        const csv = [headers, ...rows].map((row) => row.map(escapeCell).join(",")).join("\n");
        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = "campuscare-complaint-report.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    const complaints = report?.complaints || [];

    return (
        <DashboardLayout>
            <section className="page-header">
                <div><h1>Complaint Reports</h1><p>Filter, review and export department complaint records.</p></div>
            </section>

            <section className="analytics-filter-card">
                <div className="analytics-filter-grid">
                    <label>Period<select name="period" value={filters.period} onChange={handleChange}><option value="today">Today</option><option value="thisWeek">This week</option><option value="thisMonth">This month</option><option value="lastMonth">Last month</option><option value="thisYear">This year</option><option value="custom">Custom dates</option></select></label>
                    {filters.period === "custom" && <><label>From<input type="date" name="startDate" value={filters.startDate} onChange={handleChange} /></label><label>To<input type="date" name="endDate" value={filters.endDate} onChange={handleChange} /></label></>}
                    <label>Building<select name="building" value={filters.building} onChange={handleChange}><option value="">All buildings</option>{buildings.map((building) => <option key={building}>{building}</option>)}</select></label>
                    <label>Floor<select name="floor" value={filters.floor} onChange={handleChange}><option value="">All floors</option>{floors.map((floor) => <option key={floor} value={floor}>Floor {floor}</option>)}</select></label>
                    <label>Room<select name="room" value={filters.room} onChange={handleChange}><option value="">All rooms</option>{filteredRooms.map((room) => <option key={room._id} value={room._id}>Room {room.roomNumber}</option>)}</select></label>
                    <label>Asset type<select name="assetType" value={filters.assetType} onChange={handleChange}><option value="">All assets</option>{assetTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
                    <label>Category<select name="category" value={filters.category} onChange={handleChange}><option value="">All categories</option>{["Academic", "Maintenance", "Hostel", "IT", "Transport", "Security", "Library", "Cafeteria", "Sports", "Other"].map((value) => <option key={value}>{value}</option>)}</select></label>
                    <label>Priority<select name="priority" value={filters.priority} onChange={handleChange}><option value="">All priorities</option><option>Low</option><option>Medium</option><option>High</option></select></label>
                    <label>Status<select name="status" value={filters.status} onChange={handleChange}><option value="">All statuses</option><option>Pending</option><option>In Progress</option><option>Resolved</option><option>Rejected</option></select></label>
                </div>
                <div className="report-filter-actions">
                    <button type="button" className="reset-filter-button" onClick={() => setFilters(initialFilters)}>Reset Filters</button>
                    <button type="button" className="primary-search-button" onClick={exportCsv} disabled={!complaints.length}>Export CSV</button>
                </div>
            </section>

            {error && <div className="error-message">{error}</div>}
            {loading ? <div className="empty-state"><p>Preparing report...</p></div> : report && (
                <section className="infrastructure-panel">
                    <div className="section-heading-row">
                        <div><h2>Filtered complaints</h2><p>{new Date(report.range.startDate).toLocaleDateString()} – {new Date(report.range.endDate).toLocaleDateString()}</p></div>
                        <span>{complaints.length} shown</span>
                    </div>
                    {complaints.length === 0 ? <div className="empty-state compact"><p>No complaints match these filters.</p></div> : <div className="infrastructure-table-wrap"><table className="infrastructure-table"><thead><tr><th>Complaint</th><th>Location</th><th>Asset</th><th>Priority</th><th>Status</th><th></th></tr></thead><tbody>
                        {complaints.map((complaint) => <tr key={complaint._id}><td>{complaint.title}</td><td>{complaint.location?.roomNumber ? `${complaint.location.building}, Room ${complaint.location.roomNumber}` : "Not linked"}</td><td>{complaint.location?.assetType || "—"}</td><td>{complaint.priority}</td><td><span className={`status-badge ${complaint.status.toLowerCase().replaceAll(" ", "-")}`}>{complaint.status}</span></td><td><Link className="text-link" to={`/admin/complaints/${complaint._id}`}>View</Link></td></tr>)}
                    </tbody></table></div>}
                </section>
            )}
        </DashboardLayout>
    );
};

export default AdminReports;
