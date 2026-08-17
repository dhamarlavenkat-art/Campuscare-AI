import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip
} from "recharts";

const COLORS = [
    "#f59e0b",
    "#3b82f6",
    "#10b981",
    "#ef4444"
];

const ComplaintStatusChart = ({ stats }) => {
    const chartData = [
        {
            name: "Pending",
            value: stats.pending || 0
        },
        {
            name: "In Progress",
            value: stats.inProgress || 0
        },
        {
            name: "Resolved",
            value: stats.resolved || 0
        },
        {
            name: "Rejected",
            value: stats.rejected || 0
        }
    ];

    const total = chartData.reduce(
        (sum, item) => sum + item.value,
        0
    );

    return (
        <section className="chart-card">
            <div className="chart-heading">
                <div>
                    <h2>Complaint Status</h2>

                    <p>
                        Distribution of complaints in your department.
                    </p>
                </div>

                <span className="chart-total">
                    Total: {total}
                </span>
            </div>

            {total === 0 ? (
                <div className="chart-empty">
                    No complaint data available.
                </div>
            ) : (
                <div className="chart-container">
                    <ResponsiveContainer
                        width="100%"
                        height={320}
                    >
                        <PieChart>
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={110}
                                paddingAngle={3}
                            >
                                {chartData.map((item, index) => (
                                    <Cell
                                        key={item.name}
                                        fill={
                                            COLORS[
                                                index % COLORS.length
                                            ]
                                        }
                                    />
                                ))}
                            </Pie>

                            <Tooltip />

                            <Legend
                                verticalAlign="bottom"
                                height={36}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </section>
    );
};

export default ComplaintStatusChart;