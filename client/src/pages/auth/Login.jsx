import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { loginUser } from "../../services/auth.service";
import useAuth from "../../hooks/useAuth";
import AuthLayout from "../../components/auth/AuthLayout";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await loginUser(formData);

            login(response.user, response.token);

            if (response.user.role === "super_admin") {
                navigate("/super-admin/infrastructure-import");
            } else if (response.user.role === "admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/student/dashboard");
            }
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to login. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

return (
    <AuthLayout
        title="Welcome Back"
        subtitle="Login to continue to CampusCare AI."
        footerText="Don't have an account?"
        footerLinkText="Register"
        footerLinkTo="/register"
    >
        {error && (
            <div className="error-message">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="email">
                    Email
                </label>

                <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="password">
                    Password
                </label>

                <input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                />
            </div>

            <div className="auth-options">
                <Link to="/forgot-password">
                    Forgot password?
                </Link>
            </div>

            <button
                type="submit"
                className="primary-button"
                disabled={loading}
            >
                {loading ? "Logging in..." : "Login"}
            </button>
        </form>
    </AuthLayout>
);
};

export default Login;
