import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";

const AuthLayout = ({
    title,
    subtitle,
    children,
    footerText,
    footerLinkText,
    footerLinkTo
}) => {
    return (
        <main className="auth-shell">
            <section className="auth-brand-panel">
                <Link to="/" className="auth-brand">
                    <div className="auth-brand-icon">
                        <Building2 size={25} />
                    </div>

                    <div>
                        <strong>CampusCare AI</strong>
                        <span>Smart Complaint Management</span>
                    </div>
                </Link>

                <div className="auth-brand-content">
                    <span className="auth-brand-badge">
                        AI-Powered Campus Support
                    </span>

                    <h1>
                        Report campus issues and reach the correct
                        department automatically.
                    </h1>

                    <p>
                        CampusCare AI analyzes complaints, detects
                        priority and routes each issue to the concerned
                        administrator.
                    </p>
                </div>
            </section>

            <section className="auth-form-panel">
                <div className="auth-form-container">
                    <div className="auth-heading">
                        <h2>{title}</h2>
                        <p>{subtitle}</p>
                    </div>

                    {children}

                    {footerText && (
                        <p className="auth-footer-text">
                            {footerText}{" "}
                            <Link to={footerLinkTo}>
                                {footerLinkText}
                            </Link>
                        </p>
                    )}
                </div>
            </section>
        </main>
    );
};

export default AuthLayout;