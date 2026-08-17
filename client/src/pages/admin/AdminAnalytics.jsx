import { useEffect, useMemo, useState } from "react";
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { getAdminAnalytics } from "../../services/admin.service";
import { getInfrastructureOptions } from "../../services/infrastructure.service";

const initialFilters = {
    period: "thisMonth", startDate: "", endDate: "", building: "",
    floor: "", room: "", category: "", priority: "", assetType: ""
};

const AdminAnalytics = () => {
    const [filters, setFilters] = useState(initialFilters);
    const [rooms, setRooms] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getInfrastructureOptions()
            .then((response) => setRooms(response.data || []))
            .catch(() => setRooms([]));
    }, []);

    useEffect(() => {
        const loadAnalytics = async () => {
            try {
                setLoading(true);
                setError("");
                const params = Object.fromEntries(
                    Object.entries(filters).filter(([, value]) => value !== "")
                );
                const response = await getAdminAnalytics(params);
                setAnalytics(response.data);
            } catch (requestError) {
                setError(requestError.response?.data?.message || "Unable to load analytics.");
            } finally {
                setLoading(false);
            }
        };
        loadAnalytics();
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

    const summary = analytics?.summary || {};
    const trend = analytics?.trend || [];

    return (
        <DashboardLayout>
            <section className="page-header">
                <div>
                    <h1>Complaint Analytics</h1>
                    <p>Explore how complaints are received, resolved and rejected over time.</p>
                </div>
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
                </div>
                <button type="button" className="reset-filter-button" onClick={() => setFilters(initialFilters)}>Reset Filters</button>
            </section>

            {error && <div className="error-message">{error}</div>}
            {loading ? <div className="empty-state"><p>Calculating analytics...</p></div> : analytics && <>
                <section className="stats-grid analytics-stats">
                    <article className="stat-card"><span>Received in period</span><strong>{summary.received}</strong></article>
                    <article className="stat-card"><span>Resolved in period</span><strong>{summary.resolved}</strong></article>
                    <article className="stat-card"><span>Rejected in period</span><strong>{summary.rejected}</strong></article>
                    <article className="stat-card"><span>Currently pending</span><strong>{summary.pending}</strong></article>
                    <article className="stat-card"><span>Currently in progress</span><strong>{summary.inProgress}</strong></article>
                    <article className="stat-card"><span>Resolution rate</span><strong>{summary.resolutionRate}%</strong></article>
                </section>

                <section className="analytics-trend-card">
                    <div className="section-heading-row">
                        <div><h2>Complaint activity trend</h2><p>Hover over any date to compare received, resolved and rejected complaints.</p></div>
                    </div>
                    <div className="analytics-line-chart" role="img" aria-label="Interactive line chart of complaints over time">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trend} margin={{ top: 8, right: 18, left: -12, bottom: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" minTickGap={28} tickFormatter={(value) => value.slice(5)} />
                                <YAxis allowDecimals={false} />
                                <Tooltip labelFormatter={(value) => new Date(`${value}T00:00:00`).toLocaleDateString()} />
                                <Legend />
                                <Line type="monotone" dataKey="received" name="Received" stroke="#4f46e5" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#059669" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="rejected" name="Rejected" stroke="#dc2626" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            </>}
        </DashboardLayout>
    );
};

export default AdminAnalytics;
