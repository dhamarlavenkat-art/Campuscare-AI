import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const RoleRoute = ({ allowedRole, children }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== allowedRole) {
        return (
            <Navigate
                to={
                    user.role === "admin"
                        ? "/admin/dashboard"
                        : "/student/dashboard"
                }
                replace
            />
        );
    }

    return children;
};

export default RoleRoute;