import {
    LogOut,
    Menu,
    UserCircle
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Navbar = ({ onMenuClick }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <header className="dashboard-navbar">
            <div className="navbar-left">
                <button
                    type="button"
                    className="menu-button"
                    onClick={onMenuClick}
                    aria-label="Open sidebar"
                >
                    <Menu size={22} />
                </button>

                <div>
                    <h3>Welcome, {user?.name}</h3>

                    <p>
                        {user?.role === "super_admin"
                            ? "College-wide administration"
                            : user?.role === "admin"
                            ? `${user.department} Department`
                            : "Manage your complaints"}
                    </p>
                </div>
            </div>

            <div className="navbar-actions">
                <div className="navbar-user">
                    <UserCircle size={34} />

                    <div>
                        <strong>{user?.name}</strong>

                        <span>
                            {user?.role === "super_admin"
                                ? "Super Administrator"
                                : user?.role === "admin"
                                ? "Administrator"
                                : "Student"}
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    className="logout-button"
                    onClick={handleLogout}
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </button>
            </div>
        </header>
    );
};

export default Navbar;
