import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="dashboard-layout">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {sidebarOpen && (
                <button
                    type="button"
                    className="sidebar-overlay"
                    aria-label="Close sidebar"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="dashboard-content">
                <Navbar
                    onMenuClick={() =>
                        setSidebarOpen(true)
                    }
                />

                <main className="dashboard-main">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;