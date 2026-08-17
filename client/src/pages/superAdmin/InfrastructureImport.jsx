import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    CheckCircle2,
    Download,
    FileScan,
    FileSpreadsheet,
    Sparkles,
    Trash2,
    UploadCloud
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import {
    downloadInfrastructureTemplate,
    previewInfrastructureBlueprint,
    previewInfrastructureSpreadsheet,
    publishInfrastructureImport
} from "../../services/infrastructure.service";

const InfrastructureImport = () => {
    const [spreadsheet, setSpreadsheet] = useState(null);
    const [blueprint, setBlueprint] = useState(null);
    const [blueprintDefaults, setBlueprintDefaults] = useState({ building: "", floor: "" });
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [updateExisting, setUpdateExisting] = useState(true);
    const [published, setPublished] = useState(null);

    const summary = useMemo(() => {
        const rooms = preview?.rooms || [];
        return {
            totalValid: rooms.length,
            creates: rooms.filter((room) => room.action === "create").length,
            updates: rooms.filter((room) => room.action === "update").length,
            invalid: preview?.errors?.length || 0,
            assets: rooms.reduce(
                (total, room) => total + (room.assets || []).reduce((sum, asset) => sum + Number(asset.quantity || 0), 0),
                0
            )
        };
    }, [preview]);

    const resetMessages = () => {
        setError("");
        setMessage("");
        setPublished(null);
    };

    const handleDownloadTemplate = async () => {
        try {
            resetMessages();
            setLoading("template");
            const blob = await downloadInfrastructureTemplate();
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = "campuscare-infrastructure-template.xlsx";
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(url);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to download the template.");
        } finally {
            setLoading("");
        }
    };

    const analyzeSpreadsheet = async () => {
        if (!spreadsheet) return setError("Choose an Excel or CSV file first.");
        try {
            resetMessages();
            setLoading("spreadsheet");
            const response = await previewInfrastructureSpreadsheet(spreadsheet);
            setPreview(response.data);
            setMessage(response.message);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to analyze the spreadsheet.");
        } finally {
            setLoading("");
        }
    };

    const analyzeBlueprint = async () => {
        if (!blueprint) return setError("Choose a PDF, PNG or JPG blueprint first.");
        try {
            resetMessages();
            setLoading("blueprint");
            const response = await previewInfrastructureBlueprint(blueprint, {
                defaultBuilding: blueprintDefaults.building,
                defaultFloor: blueprintDefaults.floor
            });
            setPreview(response.data);
            setMessage(response.message);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to analyze the blueprint.");
        } finally {
            setLoading("");
        }
    };

    const selectBlueprint = (event) => {
        const file = event.target.files?.[0] || null;
        if (!file) {
            setBlueprint(null);
            return;
        }

        const extension = file.name.split(".").pop()?.toLowerCase();
        if (!["pdf", "png", "jpg", "jpeg"].includes(extension)) {
            event.target.value = "";
            setBlueprint(null);
            setError("Choose a PDF, PNG or JPG blueprint file.");
            return;
        }

        setError("");
        setBlueprint(file);
    };

    const updateRoom = (index, field, value) => {
        setPreview((current) => ({
            ...current,
            rooms: current.rooms.map((room, roomIndex) =>
                roomIndex === index ? { ...room, [field]: value } : room
            )
        }));
    };

    const removeRoom = (index) => {
        setPreview((current) => ({
            ...current,
            rooms: current.rooms.filter((_, roomIndex) => roomIndex !== index)
        }));
    };

    const publish = async () => {
        try {
            resetMessages();
            setLoading("publish");
            const response = await publishInfrastructureImport(preview.importId, {
                rooms: preview.rooms.map((room) => ({
                    ...room,
                    floor: Number(room.floor),
                    capacity: Number(room.capacity) || 0
                })),
                updateExisting
            });
            setPublished(response.data);
            setMessage(response.message);
            setPreview(null);
        } catch (requestError) {
            const details = requestError.response?.data?.errors;
            setError(
                details?.length
                    ? `${requestError.response.data.message}: ${details.slice(0, 3).join(" | ")}`
                    : requestError.response?.data?.message || "Unable to publish this import."
            );
        } finally {
            setLoading("");
        }
    };

    return (
        <DashboardLayout>
            <section className="page-header page-header-row">
                <div>
                    <h1>Infrastructure Import</h1>
                    <p>Build the college blueprint from Excel or let AI prepare a draft from a floor plan.</p>
                </div>
                <Link to="/admin/infrastructure" className="header-action-button">Open Infrastructure</Link>
            </section>

            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}

            {published && (
                <section className="import-published-card">
                    <CheckCircle2 size={34} />
                    <div>
                        <h2>College blueprint updated</h2>
                        <p>{published.created} rooms created, {published.updated} rooms updated and {published.skippedExisting} existing rooms skipped.</p>
                    </div>
                    <Link to="/admin/infrastructure" className="primary-button">View Rooms</Link>
                </section>
            )}

            <section className="import-method-grid">
                <article className="infrastructure-panel import-method-card">
                    <div className="import-card-icon spreadsheet"><FileSpreadsheet size={25} /></div>
                    <div>
                        <h2>Infrastructure Excel</h2>
                        <p>The reliable method for importing buildings, floors, rooms, departments and asset quantities.</p>
                    </div>
                    <button type="button" className="reset-filter-button" onClick={handleDownloadTemplate} disabled={loading === "template"}>
                        <Download size={17} /> {loading === "template" ? "Preparing..." : "Download Template"}
                    </button>
                    <label className="import-file-field">
                        <span>Excel or CSV file</span>
                        <input type="file" accept=".xlsx,.csv" onChange={(event) => setSpreadsheet(event.target.files?.[0] || null)} />
                    </label>
                    {spreadsheet && <p className="selected-file"><UploadCloud size={16} /> {spreadsheet.name}</p>}
                    <button type="button" className="primary-button" onClick={analyzeSpreadsheet} disabled={loading === "spreadsheet"}>
                        {loading === "spreadsheet" ? "Analyzing..." : "Analyze Spreadsheet"}
                    </button>
                </article>

                <article className="infrastructure-panel import-method-card">
                    <div className="import-card-icon blueprint"><FileScan size={25} /></div>
                    <div>
                        <h2>AI Blueprint Reader</h2>
                        <p>Upload a floor-plan image or text-based PDF. AI creates a reviewable room draft and never publishes automatically.</p>
                    </div>
                    <div className="blueprint-default-grid">
                        <label>Building fallback<input value={blueprintDefaults.building} onChange={(event) => setBlueprintDefaults((current) => ({ ...current, building: event.target.value }))} placeholder="Example: PG Block" /></label>
                        <label>Floor fallback<input type="number" min="0" value={blueprintDefaults.floor} onChange={(event) => setBlueprintDefaults((current) => ({ ...current, floor: event.target.value }))} placeholder="Example: 3" /></label>
                    </div>
                    <label className="import-file-field">
                        <span>PDF, PNG or JPG blueprint</span>
                        <input type="file" accept=".pdf,.png,.jpg,.jpeg,image/png,image/jpeg,application/pdf" onChange={selectBlueprint} />
                    </label>
                    {blueprint && <p className="selected-file"><Sparkles size={16} /> {blueprint.name}</p>}
                    <button type="button" className="primary-button" onClick={analyzeBlueprint} disabled={loading === "blueprint"}>
                        {loading === "blueprint" ? "AI is reading..." : "Create AI Draft"}
                    </button>
                </article>
            </section>

            {preview && (
                <section className="infrastructure-panel import-preview-panel">
                    <div className="section-heading-row">
                        <div>
                            <h2>Review before publishing</h2>
                            <p>Edit detected room information or remove an incorrect row. Asset quantities come from the uploaded file.</p>
                        </div>
                    </div>

                    <div className="import-summary-grid">
                        <article><span>Valid rooms</span><strong>{summary.totalValid}</strong></article>
                        <article><span>New rooms</span><strong>{summary.creates}</strong></article>
                        <article><span>Existing updates</span><strong>{summary.updates}</strong></article>
                        <article><span>Total assets</span><strong>{summary.assets}</strong></article>
                        <article className={summary.invalid ? "has-errors" : ""}><span>Invalid rows skipped</span><strong>{summary.invalid}</strong></article>
                    </div>

                    {preview.notes?.length > 0 && (
                        <div className="import-note-list">
                            {preview.notes.map((note, index) => <p key={index}><Sparkles size={15} /> {note}</p>)}
                        </div>
                    )}
                    {preview.errors?.length > 0 && (
                        <details className="import-errors">
                            <summary>{preview.errors.length} rows need correction in the source file</summary>
                            {preview.errors.map((item, index) => <p key={index}>{item}</p>)}
                        </details>
                    )}

                    <div className="infrastructure-table-wrap">
                        <table className="infrastructure-table import-review-table">
                            <thead><tr><th>Action</th><th>Building</th><th>Floor</th><th>Room</th><th>Type</th><th>Department</th><th>Capacity</th><th>Assets</th><th></th></tr></thead>
                            <tbody>
                                {preview.rooms.map((room, index) => (
                                    <tr key={`${room.building}-${room.floor}-${room.roomNumber}-${index}`}>
                                        <td><span className={`import-action ${room.action}`}>{room.action}</span></td>
                                        <td><input value={room.building} onChange={(event) => updateRoom(index, "building", event.target.value)} /></td>
                                        <td><input type="number" min="0" value={room.floor} onChange={(event) => updateRoom(index, "floor", event.target.value)} /></td>
                                        <td><input value={room.roomNumber} onChange={(event) => updateRoom(index, "roomNumber", event.target.value)} /></td>
                                        <td><input value={room.roomType} onChange={(event) => updateRoom(index, "roomType", event.target.value)} /></td>
                                        <td><input value={room.department} onChange={(event) => updateRoom(index, "department", event.target.value)} /></td>
                                        <td><input type="number" min="0" value={room.capacity} onChange={(event) => updateRoom(index, "capacity", event.target.value)} /></td>
                                        <td className="import-assets-cell">{room.assets?.length ? room.assets.map((asset) => `${asset.type} ${asset.quantity}`).join(", ") : "None listed"}</td>
                                        <td><button type="button" className="icon-danger-button" onClick={() => removeRoom(index)} aria-label="Remove room"><Trash2 size={17} /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="import-publish-row">
                        <label className="import-update-check">
                            <input type="checkbox" checked={updateExisting} onChange={(event) => setUpdateExisting(event.target.checked)} />
                            Update existing rooms and replace their asset inventory
                        </label>
                        <button type="button" className="primary-button" onClick={publish} disabled={!preview.rooms.length || loading === "publish"}>
                            {loading === "publish" ? "Publishing..." : `Publish ${preview.rooms.length} Rooms`}
                        </button>
                    </div>
                </section>
            )}
        </DashboardLayout>
    );
};

export default InfrastructureImport;
