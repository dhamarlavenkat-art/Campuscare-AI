import { useEffect, useMemo, useState } from "react";
import {
    Brush,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import { SlidersHorizontal } from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { getAdminAnalytics } from "../../services/admin.service";
import { getInfrastructureOptions } from "../../services/infrastructure.service";

const initialFilters = {
    period: "thisMonth",
    startDate: "",
    endDate: "",
    building: "",
    floor: "",
    room: "",
    category: "",
    priority: "",
    status: "",
    assetType: ""
};

const seriesConfig = [
    { key: "received", label: "Received", color: "#4f46e5" },
    { key: "resolved", label: "Resolved", color: "#059669" },
    { key: "rejected", label: "Rejected", color: "#dc2626" }
];

const AdminAnalytics = () => {
    const [filters, setFilters] = useState(initialFilters);
    const [showFilters, setShowFilters] = useState(false);
    const [visibleSeries, setVisibleSeries] = useState({
        received: true,
        resolved: true,
        rejected: true
    });
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

    const buildings = useMemo(
        () => [...new Set(rooms.map((room) => room.building))],
        [rooms]
    );
    const floors = useMemo(
        () => [...new Set(
            rooms
                .filter((room) => !filters.building || room.building === filters.building)
                .map((room) => room.floor)
        )].sort((a, b) => a - b),
        [rooms, filters.building]
    );
    const filteredRooms = rooms.filter(
        (room) => (!filters.building || room.building === filters.building) &&
            (!filters.floor || String(room.floor) === filters.floor)
    );
    const assetTypes = [...new Set(
        filteredRooms.flatMap((room) => room.assets.map((asset) => asset.type))
    )].sort();

    const activeFilterCount = Object.entries(filters).filter(
        ([key, value]) => key !== "period" && value !== ""
    ).length;

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFilters((current) => {
            const next = { ...current, [name]: value };
            if (name === "building") {
                next.floor = "";
                next.room = "";
                next.assetType = "";
            }
            if (name === "floor") {
                next.room = "";
                next.assetType = "";
            }
            if (name === "room") next.assetType = "";
            return next;
        });
    };

    const toggleSeries = (key) => {
        setVisibleSeries((current) => ({ ...current, [key]: !current[key] }));
    };

    const summary = analytics?.summary || {};
    const trend = analytics?.trend || [];

    return (
        <DashboardLayout>
            <section className="page-header page-header-row">
                <div>
                    <h1>Complaint Analytics</h1>
                    <p>Interact with complaint activity, categories and resolution performance for your department.</p>
                </div>
                <button type="button" className="header-action-button analytics-filter-toggle" onClick={() => setShowFilters((value) => !value)}>
                    <SlidersHorizontal size={17} /> {showFilters ? "Hide Filters" : "Show Filters"}
                    {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
                </button>
            </section>

            {showFilters && (
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
                    <button type="button" className="reset-filter-button" onClick={() => setFilters(initialFilters)}>Reset Filters</button>
                </section>
            )}

            {error && <div className="error-message">{error}</div>}
            {loading ? <div className="empty-state"><p>Calculating analytics...</p></div> : analytics && <>
                <section className="stats-grid analytics-stats">
                    <article className="stat-card"><span>Received</span><strong>{summary.received}</strong></article>
                    <article className="stat-card"><span>Resolved</span><strong>{summary.resolved}</strong></article>
                    <article className="stat-card"><span>Rejected</span><strong>{summary.rejected}</strong></article>
                    <article className="stat-card"><span>Pending</span><strong>{summary.pending}</strong></article>
                    <article className="stat-card"><span>In progress</span><strong>{summary.inProgress}</strong></article>
                    <article className="stat-card"><span>Resolution rate</span><strong>{summary.resolutionRate}%</strong></article>
                    <article className="stat-card"><span>Average resolution</span><strong>{summary.averageResolutionHours || 0}h</strong></article>
                </section>

                <section className="analytics-trend-card analytics-main-chart">
                    <div className="section-heading-row analytics-chart-heading">
                        <div>
                            <h2>Complaint activity</h2>
                            <p>Hover for exact values, drag the lower selector to zoom, or hide individual lines.</p>
                        </div>
                        <div className="analytics-series-controls" aria-label="Chart series controls">
                            {seriesConfig.map((series) => (
                                <button
                                    type="button"
                                    key={series.key}
                                    className={visibleSeries[series.key] ? "active" : ""}
                                    aria-pressed={visibleSeries[series.key]}
                                    onClick={() => toggleSeries(series.key)}
                                >
                                    <span style={{ backgroundColor: series.color }} />{series.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    {trend.length ? (
                        <div className="analytics-line-chart" role="img" aria-label="Interactive complaint activity line chart">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trend} margin={{ top: 12, right: 22, left: -8, bottom: 12 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" minTickGap={28} tickFormatter={(value) => value.slice(5)} />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip labelFormatter={(value) => new Date(`${value}T00:00:00`).toLocaleDateString()} />
                                    <Legend />
                                    {seriesConfig.map((series) => visibleSeries[series.key] && (
                                        <Line key={series.key} type="monotone" dataKey={series.key} name={series.label} stroke={series.color} strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                                    ))}
                                    <Brush dataKey="date" height={26} travellerWidth={10} tickFormatter={(value) => value.slice(5)} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : <div className="empty-state compact"><p>No activity in this period.</p></div>}
                </section>

            </>}
        </DashboardLayout>
    );
};

export default AdminAnalytics;
