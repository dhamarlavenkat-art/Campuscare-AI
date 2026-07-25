import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { resetPassword } from "../../services/auth.service";

const ResetPassword = () => {
    const navigate = useNavigate();

    const email = sessionStorage.getItem("resetEmail");
    const otp = sessionStorage.getItem("resetOTP");

    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setMessage("");

        if (!email || !otp) {
            setError(
                "Password reset session is missing. Please generate a new OTP."
            );
            return;
        }

        if (newPassword.length < 8) {
            setError(
                "Password must contain at least 8 characters."
            );
            return;
        }

        setLoading(true);

        try {
            const response = await resetPassword({
                email,
                otp,
                newPassword
            });

            setMessage(response.message);

            sessionStorage.removeItem("resetEmail");
            sessionStorage.removeItem("resetOTP");

            setTimeout(() => {
                navigate("/login");
            }, 1200);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Unable to reset password. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-card">
                <h1>Reset Password</h1>

                <p className="auth-subtitle">
                    Enter a new password for your account.
                </p>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="success-message">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="newPassword">
                            New Password
                        </label>

                        <input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(event) =>
                                setNewPassword(event.target.value)
                            }
                            placeholder="Minimum 8 characters"
                            minLength="8"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Resetting Password..."
                            : "Reset Password"}
                    </button>
                </form>

                <p className="auth-footer-text">
                    Return to{" "}
                    <Link to="/login">
                        Login
                    </Link>
                </p>
            </section>
        </main>
    );
};

export default ResetPassword;