import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout";
import {
    analyzeComplaintBeforeSubmit,
    createComplaint,
    supportComplaint
} from "../../services/complaint.service";
import { getInfrastructureOptions } from "../../services/infrastructure.service";

const CreateComplaint = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        anonymous: false,
        image: null,
        building: "",
        floor: "",
        roomId: "",
        assetId: "",
        affectedQuantity: 1
    });

    const [infrastructureRooms, setInfrastructureRooms] = useState([]);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [analysisPreview, setAnalysisPreview] = useState(null);
    const [checkedSteps, setCheckedSteps] = useState([]);

    const [duplicateComplaint, setDuplicateComplaint] =
        useState(null);

    const [supportLoading, setSupportLoading] =
        useState(false);

    useEffect(() => {
        getInfrastructureOptions()
            .then((response) => setInfrastructureRooms(response.data || []))
            .catch(() => setInfrastructureRooms([]));
    }, []);

    const handleChange = (event) => {
        const { name, value, type, checked, files } =
            event.target;

        if (name === "title" || name === "description") {
            setAnalysisPreview(null);
            setCheckedSteps([]);
            setMessage("");
        }

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
            [name]: value,
            ...(name === "building" && { floor: "", roomId: "", assetId: "", affectedQuantity: 1 }),
            ...(name === "floor" && { roomId: "", assetId: "", affectedQuantity: 1 }),
            ...(name === "roomId" && { assetId: "", affectedQuantity: 1 }),
            ...(name === "assetId" && { affectedQuantity: 1 })
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setMessage("");
        setDuplicateComplaint(null);
        setLoading(true);

        try {
            if (!analysisPreview) {
                const response = await analyzeComplaintBeforeSubmit({
                    title: formData.title,
                    description: formData.description
                });

                setAnalysisPreview(response.data);
                setCheckedSteps(
                    response.data.troubleshooting.map(() => false)
                );
                setMessage(response.message);
                return;
            }

            const allStepsConfirmed =
                checkedSteps.length === analysisPreview.troubleshooting.length &&
                checkedSteps.every(Boolean);

            if (!allStepsConfirmed) {
                setError("Confirm every troubleshooting step before submitting.");
                return;
            }

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

            complaintData.append(
                "analysisToken",
                analysisPreview.analysisToken
            );

            complaintData.append(
                "troubleshootingAcknowledged",
                "true"
            );

            complaintData.append(
                "confirmedTroubleshooting",
                JSON.stringify(analysisPreview.troubleshooting)
            );

            if (formData.image) {
                complaintData.append(
                    "image",
                    formData.image
                );
            }

            if (formData.roomId) {
                complaintData.append("roomId", formData.roomId);
            }

            if (formData.assetId) {
                complaintData.append("assetId", formData.assetId);
                complaintData.append("affectedQuantity", formData.affectedQuantity);
            }

            const response =
                await createComplaint(complaintData);

            if (response.duplicate) {
                setDuplicateComplaint(response.data);
                setMessage(response.message);
                setAnalysisPreview(null);
                setCheckedSteps([]);
                return;
            }

            setMessage(response.message);
            setAnalysisPreview(null);
            setCheckedSteps([]);

            setFormData({
                title: "",
                description: "",
                anonymous: false,
                image: null,
                building: "",
                floor: "",
                roomId: "",
                assetId: "",
                affectedQuantity: 1
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

    const buildings = [...new Set(infrastructureRooms.map((room) => room.building))];
    const floors = [...new Set(
        infrastructureRooms
            .filter((room) => room.building === formData.building)
            .map((room) => room.floor)
    )].sort((a, b) => a - b);
    const availableRooms = infrastructureRooms.filter(
        (room) => room.building === formData.building &&
            String(room.floor) === formData.floor
    );
    const selectedRoom = infrastructureRooms.find((room) => room._id === formData.roomId);
    const selectedAsset = selectedRoom?.assets.find((asset) => asset._id === formData.assetId);

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

                    {analysisPreview && (
                        <section className="troubleshooting-confirmation">
                            <div>
                                <h2>Try these steps first</h2>
                                <p>
                                    Mark every step after checking it. You can submit only after all steps are confirmed.
                                </p>
                            </div>

                            {analysisPreview.summary && (
                                <p className="troubleshooting-summary">
                                    <strong>AI summary:</strong> {analysisPreview.summary}
                                </p>
                            )}

                            <div className="troubleshooting-checklist">
                                {analysisPreview.troubleshooting.map((step, index) => (
                                    <label key={`${step}-${index}`}>
                                        <input
                                            type="checkbox"
                                            checked={checkedSteps[index] || false}
                                            onChange={(event) => {
                                                setCheckedSteps((current) =>
                                                    current.map((checked, stepIndex) =>
                                                        stepIndex === index ? event.target.checked : checked
                                                    )
                                                );
                                                setError("");
                                            }}
                                        />
                                        <span>{step}</span>
                                    </label>
                                ))}
                            </div>
                        </section>
                    )}

                    <div className="form-group">
                        <label>Issue Location</label>

                        <div className="location-field-grid">
                            <select name="building" value={formData.building} onChange={handleChange}>
                                <option value="">Select building (optional)</option>
                                {buildings.map((building) => <option key={building}>{building}</option>)}
                            </select>

                            <select name="floor" value={formData.floor} onChange={handleChange} disabled={!formData.building}>
                                <option value="">Select floor</option>
                                {floors.map((floor) => <option key={floor} value={floor}>Floor {floor}</option>)}
                            </select>

                            <select name="roomId" value={formData.roomId} onChange={handleChange} disabled={!formData.floor}>
                                <option value="">Select room</option>
                                {availableRooms.map((room) => <option key={room._id} value={room._id}>Room {room.roomNumber} · {room.roomType}</option>)}
                            </select>

                            <select name="assetId" value={formData.assetId} onChange={handleChange} disabled={!selectedRoom}>
                                <option value="">Whole room / no asset</option>
                                {selectedRoom?.assets.map((asset) => <option key={asset._id} value={asset._id}>{asset.name} ({asset.type})</option>)}
                            </select>

                            {selectedAsset && (
                                <label className="affected-quantity-field">
                                    How many are affected?
                                    <input
                                        type="number"
                                        name="affectedQuantity"
                                        min="1"
                                        max={selectedAsset.quantity}
                                        value={formData.affectedQuantity}
                                        onChange={handleChange}
                                        required
                                    />
                                    <small>Available in room: {selectedAsset.quantity}</small>
                                </label>
                            )}
                        </div>

                        <small className="form-help">
                            Linking a room or asset helps the correct admin see every problem in that location.
                        </small>
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
                        disabled={
                            loading ||
                            (analysisPreview && !checkedSteps.every(Boolean))
                        }
                    >
                        {loading
                            ? analysisPreview
                                ? "Submitting Complaint..."
                                : "AI is analyzing..."
                            : analysisPreview
                              ? "Submit Complaint"
                              : "Continue to Troubleshooting"}
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
