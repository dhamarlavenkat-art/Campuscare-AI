import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { verifyOTP } from "../../services/auth.service";

const VerifyOTP = () => {
    const navigate = useNavigate();

    const email = sessionStorage.getItem("resetEmail");

    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setMessage("");

        if (!email) {
            setError(
                "Reset email is missing. Please generate a new OTP."
            );
            return;
        }

        setLoading(true);

        try {
            const response = await verifyOTP({
                email,
                otp
            });

            setMessage(response.message);

            /*
             Store the verified OTP temporarily.
             The reset-password page needs the email and OTP.
            */
            sessionStorage.setItem("resetOTP", otp);

            setTimeout(() => {
                navigate("/reset-password");
            }, 1000);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Unable to verify OTP. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <section className="auth-card">
                <h1>Verify OTP</h1>

                <p className="auth-subtitle">
                    Enter the 6-digit OTP generated for{" "}
                    <strong>
                        {email || "your email"}
                    </strong>
                    .
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
                        <label htmlFor="otp">
                            OTP
                        </label>

                        <input
                            id="otp"
                            type="text"
                            inputMode="numeric"
                            maxLength="6"
                            value={otp}
                            onChange={(event) => {
                                const value =
                                    event.target.value.replace(
                                        /\D/g,
                                        ""
                                    );

                                setOtp(value);
                            }}
                            placeholder="Enter 6-digit OTP"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={
                            loading ||
                            otp.length !== 6
                        }
                    >
                        {loading
                            ? "Verifying..."
                            : "Verify OTP"}
                    </button>
                </form>

                <p className="auth-footer-text">
                    Need a new OTP?{" "}
                    <Link to="/forgot-password">
                        Generate again
                    </Link>
                </p>
            </section>
        </main>
    );
};

export default VerifyOTP;