import { Link } from "react-router-dom";
import {
    Bot,
    Building2,
    CheckCircle2,
    ClipboardCheck,
    ShieldCheck,
    Users
} from "lucide-react";

const Home = () => {
    return (
        <div className="home-page">
            <header className="home-navbar">
                <Link to="/" className="home-logo">
                    <div className="home-logo-icon">
                        <Building2 size={24} />
                    </div>

                    <div>
                        <strong>CampusCare AI</strong>
                        <span>Smart Complaint Management</span>
                    </div>
                </Link>

                <nav className="home-nav-links">
                    <a href="#features">Features</a>
                    <a href="#workflow">How It Works</a>
                </nav>

                <div className="home-nav-actions">
                    <Link
                        to="/login"
                        className="home-login-button"
                    >
                        Login
                    </Link>

                    <Link
                        to="/register"
                        className="home-register-button"
                    >
                        Register
                    </Link>
                </div>
            </header>

            <main>
                <section className="home-hero">
                    <div className="home-hero-content">
                        <span className="home-badge">
                            <Bot size={17} />
                            AI-Powered Campus Support
                        </span>

                        <h1>
                            Raise campus complaints and reach the
                            right department automatically.
                        </h1>

                        <p>
                            CampusCare AI analyzes student complaints,
                            identifies the correct department and helps
                            administrators resolve issues efficiently.
                        </p>

                        <div className="home-hero-actions">
                            <Link
                                to="/register"
                                className="home-primary-button"
                            >
                                Get Started
                            </Link>

                            <Link
                                to="/login"
                                className="home-secondary-button"
                            >
                                Login to Portal
                            </Link>
                        </div>

                        <div className="home-trust-row">
                            <span>
                                <CheckCircle2 size={18} />
                                Automatic routing
                            </span>

                            <span>
                                <CheckCircle2 size={18} />
                                Complaint tracking
                            </span>

                            <span>
                                <CheckCircle2 size={18} />
                                Secure role access
                            </span>
                        </div>
                    </div>

                    <div className="home-hero-card">
                        <div className="hero-card-header">
                            <div>
                                <span>AI Complaint Analysis</span>
                                <h2>Wi-Fi not working in lab</h2>
                            </div>

                            <span className="hero-ai-label">
                                AI
                            </span>
                        </div>

                        <div className="hero-analysis-item">
                            <span>Category</span>
                            <strong>IT</strong>
                        </div>

                        <div className="hero-analysis-item">
                            <span>Department</span>
                            <strong>IT</strong>
                        </div>

                        <div className="hero-analysis-item">
                            <span>Priority</span>
                            <strong className="priority-high">
                                High
                            </strong>
                        </div>

                        <div className="hero-routing-result">
                            <CheckCircle2 size={21} />

                            <div>
                                <strong>
                                    Routed successfully
                                </strong>

                                <span>
                                    Sent to the IT department admin
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    id="features"
                    className="home-section"
                >
                    <div className="home-section-heading">
                        <span>Platform Features</span>

                        <h2>
                            Everything needed to manage campus
                            complaints
                        </h2>

                        <p>
                            Students can report issues easily while
                            administrators receive only complaints
                            assigned to their department.
                        </p>
                    </div>

                    <div className="home-features-grid">
                        <article className="home-feature-card">
                            <div className="feature-icon">
                                <Bot size={25} />
                            </div>

                            <h3>AI Analysis</h3>

                            <p>
                                Automatically identifies category,
                                priority, department and troubleshooting
                                suggestions.
                            </p>
                        </article>

                        <article className="home-feature-card">
                            <div className="feature-icon">
                                <ClipboardCheck size={25} />
                            </div>

                            <h3>Complaint Tracking</h3>

                            <p>
                                Students can view status changes,
                                admin remarks and complete complaint
                                history.
                            </p>
                        </article>

                        <article className="home-feature-card">
                            <div className="feature-icon">
                                <Users size={25} />
                            </div>

                            <h3>Duplicate Support</h3>

                            <p>
                                Similar complaints are detected so
                                students can support an existing issue
                                instead of creating duplicates.
                            </p>
                        </article>

                        <article className="home-feature-card">
                            <div className="feature-icon">
                                <ShieldCheck size={25} />
                            </div>

                            <h3>Department Security</h3>

                            <p>
                                Each administrator can access and manage
                                complaints belonging only to their
                                department.
                            </p>
                        </article>
                    </div>
                </section>

                <section
                    id="workflow"
                    className="home-workflow-section"
                >
                    <div className="home-section-heading">
                        <span>Simple Workflow</span>

                        <h2>How CampusCare AI works</h2>
                    </div>

                    <div className="workflow-grid">
                        <article>
                            <strong>01</strong>
                            <h3>Submit Complaint</h3>
                            <p>
                                The student enters the complaint title,
                                description and optional image.
                            </p>
                        </article>

                        <article>
                            <strong>02</strong>
                            <h3>AI Analyzes It</h3>
                            <p>
                                AI detects its category, priority and
                                correct department.
                            </p>
                        </article>

                        <article>
                            <strong>03</strong>
                            <h3>Admin Takes Action</h3>
                            <p>
                                The concerned department admin updates
                                the status and adds remarks.
                            </p>
                        </article>

                        <article>
                            <strong>04</strong>
                            <h3>Student Tracks Progress</h3>
                            <p>
                                The student sees every update through
                                the complaint history.
                            </p>
                        </article>
                    </div>
                </section>

                <section className="home-cta">
                    <div>
                        <h2>
                            Make your campus complaints easier to
                            manage.
                        </h2>

                        <p>
                            Register now and start using the smart
                            complaint portal.
                        </p>
                    </div>

                    <Link
                        to="/register"
                        className="home-cta-button"
                    >
                        Create Account
                    </Link>
                </section>
            </main>

            <footer className="home-footer">
                <div>
                    <strong>CampusCare AI</strong>
                    <p>
                        Smart college complaint management system.
                    </p>
                </div>

                <span>
                    © {new Date().getFullYear()} CampusCare AI
                </span>
            </footer>
        </div>
    );
};

export default Home;