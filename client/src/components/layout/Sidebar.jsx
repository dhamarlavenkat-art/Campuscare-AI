import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    PlusCircle,
    ClipboardList,
    Building2,
    ChartNoAxesCombined,
    FileText,
    FileUp
} from "lucide-react";

import useAuth from "../../hooks/useAuth";

const Sidebar = ({ isOpen, onClose }) => {
    const { user } = useAuth();

    const studentLinks = [
        {
            label: "Dashboard",
            path: "/student/dashboard",
            icon: LayoutDashboard
        },
        {
            label: "Create Complaint",
            path: "/student/create-complaint",
            icon: PlusCircle
        },
        {
            label: "My Complaints",
            path: "/student/complaints",
            icon: ClipboardList
        }
    ];

    const adminLinks = [
        {
            label: "Dashboard",
            path: "/admin/dashboard",
            icon: LayoutDashboard
        },
        {
            label: "Complaints",
            path: "/admin/complaints",
            icon: ClipboardList
        },
        {
            label: "Infrastructure",
            path: "/admin/infrastructure",
            icon: Building2
        },
        {
            label: "Analytics",
            path: "/admin/analytics",
            icon: ChartNoAxesCombined
        },
        {
            label: "Reports",
            path: "/admin/reports",
            icon: FileText
        }
    ];

    const superAdminLinks = [
        {
            label: "Infrastructure Import",
            path: "/super-admin/infrastructure-import",
            icon: FileUp
        },
        {
            label: "College Infrastructure",
            path: "/admin/infrastructure",
            icon: Building2
        },
        {
            label: "College Analytics",
            path: "/super-admin/analytics",
            icon: ChartNoAxesCombined
        }
    ];

    const links =
        user?.role === "super_admin"
            ? superAdminLinks
            : user?.role === "admin"
            ? adminLinks
            : studentLinks;

    return (
        <aside
    className={`sidebar ${isOpen ? "open" : ""}`}
>
            <div className="sidebar-brand">
                <h2>CampusCare AI</h2>

                <p>
                    {user?.role === "super_admin"
                        ? "College Super Admin"
                        : user?.role === "admin"
                        ? `${user.department} Admin`
                        : "Student Portal"}
                </p>
            </div>

            <nav className="sidebar-nav">
                {links.map((link) => {
                    const Icon = link.icon;

                    return (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            onClick={onClose}
                            className={({ isActive }) =>
                                isActive
                                    ? "sidebar-link active"
                                    : "sidebar-link"
                            }
                        >
                            <Icon size={19} />
                            <span>{link.label}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </aside>
    );
};

export default Sidebar;
