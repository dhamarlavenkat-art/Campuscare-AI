import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const RoleRoute = ({ allowedRole, children }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const allowedRoles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];

    if (!allowedRoles.includes(user.role)) {
        return (
            <Navigate
                to={
                    user.role === "super_admin"
                        ? "/super-admin/infrastructure-import"
                        : user.role === "admin"
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
