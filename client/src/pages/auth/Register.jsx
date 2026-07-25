import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "../../services/auth.service";
import useAuth from "../../hooks/useAuth";
import departments from "../../utils/departments";
import AuthLayout from "../../components/auth/AuthLayout";

const Register = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "student",
        department: ""
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
            const userData = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role
            };

            if (formData.role === "admin") {
                userData.department = formData.department;
            }

            const response = await registerUser(userData);

            login(response.user, response.token);

            if (response.user.role === "admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/student/dashboard");
            }
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Unable to register. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

return (
    <AuthLayout
        title="Create Account"
        subtitle="Register to start using CampusCare AI."
        footerText="Already have an account?"
        footerLinkText="Login"
        footerLinkTo="/login"
    >
        {error && (
            <div className="error-message">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="name">
                    Full Name
                </label>

                <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                />
            </div>

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
                    placeholder="Minimum 8 characters"
                    minLength="8"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="role">
                    Register As
                </label>

                <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                >
                    <option value="student">
                        Student
                    </option>

                    <option value="admin">
                        Admin
                    </option>
                </select>
            </div>

            {formData.role === "admin" && (
                <div className="form-group">
                    <label htmlFor="department">
                        Department
                    </label>

                    <select
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        required
                    >
                        <option value="">
                            Select department
                        </option>

                        {departments.map((department) => (
                            <option
                                key={department}
                                value={department}
                            >
                                {department}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <button
                type="submit"
                className="primary-button"
                disabled={loading}
            >
                {loading
                    ? "Creating Account..."
                    : "Register"}
            </button>
        </form>
    </AuthLayout>
);
};

export default Register;