import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { forgotPassword } from "../../services/auth.service";

const ForgotPassword = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setMessage("");
        setLoading(true);

        try {
            const response = await forgotPassword(email);

            setMessage(response.message);

            /*
             Temporarily save the email because the Verify OTP
             page will need it.
            */
            sessionStorage.setItem("resetEmail", email);

            setTimeout(() => {
                navigate("/verify-otp");
            }, 1000);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Unable to generate OTP. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-card">
                <h1>Forgot Password</h1>

                <p className="auth-subtitle">
                    Enter your registered email to generate an OTP.
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
                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder="Enter your registered email"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Generating OTP..."
                            : "Generate OTP"}
                    </button>
                </form>

                <p className="auth-footer-text">
                    Remember your password?{" "}
                    <Link to="/login">
                        Login
                    </Link>
                </p>
            </section>
        </main>
    );
};

export default ForgotPassword;