import {
    Navigate,
    Route,
    Routes
} from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import StudentDashboard from "../pages/student/StudentDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";

import ProtectedRoute from "../components/auth/ProtectedRoute";
import RoleRoute from "../components/auth/RoleRoute";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VerifyOTP from "../pages/auth/VerifyOTP";
import ResetPassword from "../pages/auth/ResetPassword";
import CreateComplaint from "../pages/student/CreateComplaint";
import MyComplaints from "../pages/student/MyComplaints";
import ComplaintDetails from "../pages/student/ComplaintDetails";
import AdminComplaints from "../pages/admin/AdminComplaints";
import AdminComplaintDetails from "../pages/admin/AdminComplaintDetails";
import AdminInfrastructure from "../pages/admin/AdminInfrastructure";
import AdminAnalytics from "../pages/admin/AdminAnalytics";
import AdminReports from "../pages/admin/AdminReports";
import InfrastructureImport from "../pages/superAdmin/InfrastructureImport";
import SuperAdminAnalytics from "../pages/superAdmin/SuperAdminAnalytics";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />
            <Route
                path="/forgot-password"
                element={<ForgotPassword />}
            />
            <Route
                path="/verify-otp"
                element={<VerifyOTP />}
            />
            <Route
                path="/reset-password"
                element={<ResetPassword />}
            />
            <Route
                path="/student/create-complaint"
                element={
             <ProtectedRoute>
             <RoleRoute allowedRole="student">
                <CreateComplaint />
            </RoleRoute>
            </ProtectedRoute>
        }
        />
        <Route
    path="/student/complaints/:id"
    element={
        <ProtectedRoute>
            <RoleRoute allowedRole="student">
                <ComplaintDetails />
            </RoleRoute>
        </ProtectedRoute>
    }
/>
        <Route
    path="/student/complaints"
    element={
        <ProtectedRoute>
            <RoleRoute allowedRole="student">
                <MyComplaints />
            </RoleRoute>
        </ProtectedRoute>
    }
/>

            <Route
                path="/student/dashboard"
                element={
                    <ProtectedRoute>
                        <RoleRoute allowedRole="student">
                            <StudentDashboard />
                        </RoleRoute>
                    </ProtectedRoute>
                }
            />
<Route
    path="/admin/complaints"
    element={
        <ProtectedRoute>
            <RoleRoute allowedRole="admin">
                <AdminComplaints />
            </RoleRoute>
        </ProtectedRoute>
    }
/>
<Route
    path="/admin/complaints/:id"
    element={
        <ProtectedRoute>
            <RoleRoute allowedRole="admin">
                <AdminComplaintDetails />
            </RoleRoute>
        </ProtectedRoute>
    }
/>
<Route
    path="/admin/infrastructure"
    element={
        <ProtectedRoute>
            <RoleRoute allowedRole={["admin", "super_admin"]}>
                <AdminInfrastructure />
            </RoleRoute>
        </ProtectedRoute>
    }
/>
<Route
    path="/super-admin/infrastructure-import"
    element={
        <ProtectedRoute>
            <RoleRoute allowedRole="super_admin">
                <InfrastructureImport />
            </RoleRoute>
        </ProtectedRoute>
    }
/>
<Route
    path="/super-admin/analytics"
    element={
        <ProtectedRoute>
            <RoleRoute allowedRole="super_admin">
                <SuperAdminAnalytics />
            </RoleRoute>
        </ProtectedRoute>
    }
/>
<Route
    path="/admin/analytics"
    element={
        <ProtectedRoute>
            <RoleRoute allowedRole="admin">
                <AdminAnalytics />
            </RoleRoute>
        </ProtectedRoute>
    }
/>
<Route
    path="/admin/reports"
    element={
        <ProtectedRoute>
            <RoleRoute allowedRole="admin">
                <AdminReports />
            </RoleRoute>
        </ProtectedRoute>
    }
/>
            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute>
                        <RoleRoute allowedRole="admin">
                            <AdminDashboard />
                        </RoleRoute>
                    </ProtectedRoute>
                }
            />

            <Route
                path="*"
                element={<Navigate to="/" replace />}
            />
        </Routes>
    );
};

export default AppRoutes;
