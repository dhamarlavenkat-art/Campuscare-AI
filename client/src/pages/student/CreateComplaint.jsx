import { useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout";
import {
    createComplaint,
    supportComplaint
} from "../../services/complaint.service";

const CreateComplaint = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        anonymous: false,
        image: null
    });

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const [duplicateComplaint, setDuplicateComplaint] =
        useState(null);

    const [supportLoading, setSupportLoading] =
        useState(false);

    const handleChange = (event) => {
        const { name, value, type, checked, files } =
            event.target;

        if (type === "checkbox") {
            setFormData((previousData) => ({
                ...previousData,
                [name]: checked
            }));

            return;
        }

        if (type === "file") {
            setFormData((previousData) => ({
                ...previousData,
                image: files[0] || null
            }));

            return;
        }

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setMessage("");
        setDuplicateComplaint(null);
        setLoading(true);

        try {
            const complaintData = new FormData();

            complaintData.append(
                "title",
                formData.title
            );

            complaintData.append(
                "description",
                formData.description
            );

            complaintData.append(
                "anonymous",
                formData.anonymous
            );

            if (formData.image) {
                complaintData.append(
                    "image",
                    formData.image
                );
            }

            const response =
                await createComplaint(complaintData);

            if (response.duplicate) {
                setDuplicateComplaint(response.data);
                setMessage(response.message);
                return;
            }

            setMessage(response.message);

            setFormData({
                title: "",
                description: "",
                anonymous: false,
                image: null
            });

            setTimeout(() => {
                navigate("/student/complaints");
            }, 1200);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Unable to create complaint."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSupportComplaint = async () => {
        if (!duplicateComplaint?.complaintId) {
            return;
        }

        setError("");
        setSupportLoading(true);

        try {
            const response = await supportComplaint(
                duplicateComplaint.complaintId
            );

            setMessage(response.message);

            setDuplicateComplaint((previousComplaint) => ({
                ...previousComplaint,
                supporters: response.supporters,
                alreadySupported: true
            }));
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Unable to support complaint."
            );
        } finally {
            setSupportLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <section className="page-header">
                <div>
                    <h1>Create Complaint</h1>

                    <p>
                        Describe the issue. AI will identify
                        its department, category and priority.
                    </p>
                </div>
            </section>

            <section className="complaint-form-card">
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
                        <label htmlFor="title">
                            Complaint Title
                        </label>

                        <input
                            id="title"
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Example: College Wi-Fi is not working"
                            minLength="5"
                            maxLength="100"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">
                            Description
                        </label>

                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Explain the issue clearly..."
                            rows="7"
                            minLength="10"
                            maxLength="2000"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="image">
                            Upload Image
                        </label>

                        <input
                            id="image"
                            type="file"
                            name="image"
                            accept=".jpg,.jpeg,.png"
                            onChange={handleChange}
                        />

                        <small className="form-help">
                            Optional. JPG, JPEG or PNG only.
                        </small>
                    </div>

                    <label className="checkbox-field">
                        <input
                            type="checkbox"
                            name="anonymous"
                            checked={formData.anonymous}
                            onChange={handleChange}
                        />

                        <span>
                            Submit this complaint anonymously
                        </span>
                    </label>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={loading}
                    >
                        {loading
                            ? "AI is analyzing..."
                            : "Submit Complaint"}
                    </button>
                </form>
            </section>

            {duplicateComplaint && (
                <section className="duplicate-card">
                    <h2>Similar Complaint Found</h2>

                    <p>
                        Instead of creating another complaint,
                        you can support the existing one.
                    </p>

                    <div className="duplicate-details">
                        <p>
                            <strong>Title:</strong>{" "}
                            {duplicateComplaint.title}
                        </p>

                        <p>
                            <strong>Status:</strong>{" "}
                            {duplicateComplaint.status}
                        </p>

                        <p>
                            <strong>Supporters:</strong>{" "}
                            {duplicateComplaint.supporters}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="support-button"
                        onClick={handleSupportComplaint}
                        disabled={
                            supportLoading ||
                            duplicateComplaint.alreadySupported
                        }
                    >
                        {duplicateComplaint.alreadySupported
                            ? "Already Supported"
                            : supportLoading
                              ? "Supporting..."
                              : "Support Complaint"}
                    </button>
                </section>
            )}
        </DashboardLayout>
    );
};

export default CreateComplaint;