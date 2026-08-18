import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, DoorOpen, FileUp, Lightbulb, Pencil, Wrench } from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import {
    createInfrastructureRoom,
    getInfrastructureRoom,
    getInfrastructureRooms,
    initializeInfrastructure,
    updateInfrastructureRoom
} from "../../services/infrastructure.service";

const spaceTypes = ["Classroom", "Computer Lab", "Science Lab", "Data Science Lab", "Server Room", "Network Room", "Library", "Office", "Staff Room", "Seminar Hall", "Auditorium", "Store Room", "Electrical Room", "Washroom", "Other"];
const departments = ["General", "Administration", "IT", "Library", "Hostel", "Transport", "Examination", "Maintenance", "Accounts", "Sports", "Placement", "Security"];
const assetTypes = ["Fan", "Light", "Projector", "Computer", "Server", "Router", "Switch", "AC", "Smart Board", "CCTV", "UPS", "Printer", "Plug Point", "Furniture", "Lab Equipment", "Other"];

const emptyRoomForm = {
    building: "",
    floor: "",
    roomNumber: "",
    roomType: "Classroom",
    capacity: "",
    department: "General",
    assets: []
};

const emptyAsset = {
    type: "Fan",
    quantity: 1
};

const AdminInfrastructure = () => {
    const [rooms, setRooms] = useState([]);
    const [selectedBuilding, setSelectedBuilding] = useState("");
    const [selectedFloor, setSelectedFloor] = useState("");
    const [selectedRoomId, setSelectedRoomId] = useState("");
    const [roomDetails, setRoomDetails] = useState(null);
    const [status, setStatus] = useState("");
    const [assetType, setAssetType] = useState("");
    const [showRoomForm, setShowRoomForm] = useState(false);
    const [roomForm, setRoomForm] = useState(emptyRoomForm);
    const [savingRoom, setSavingRoom] = useState(false);
    const [editRoomForm, setEditRoomForm] = useState(null);
    const [savingEdit, setSavingEdit] = useState(false);
    const [detailVersion, setDetailVersion] = useState(0);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadRooms = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const response = await getInfrastructureRooms();
            const data = response.data || [];
            setRooms(data);

            if (data.length && !selectedBuilding) {
                setSelectedBuilding(data[0].building);
                setSelectedFloor(String(data[0].floor));
                setSelectedRoomId(data[0]._id);
            }
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to load infrastructure.");
        } finally {
            setLoading(false);
        }
    }, [selectedBuilding]);

    useEffect(() => {
        loadRooms();
    }, [loadRooms]);

    useEffect(() => {
        if (!selectedRoomId) {
            setRoomDetails(null);
            return;
        }

        const loadDetails = async () => {
            try {
                setDetailLoading(true);
                const params = {};
                if (status) params.status = status;
                if (assetType) params.assetType = assetType;
                const response = await getInfrastructureRoom(selectedRoomId, params);
                setRoomDetails(response.data);
            } catch (requestError) {
                setError(requestError.response?.data?.message || "Unable to load room details.");
            } finally {
                setDetailLoading(false);
            }
        };

        loadDetails();
    }, [selectedRoomId, status, assetType, detailVersion]);

    const buildings = useMemo(
        () => [...new Set(rooms.map((room) => room.building))],
        [rooms]
    );
    const floors = useMemo(
        () => [...new Set(rooms.filter((room) => room.building === selectedBuilding).map((room) => room.floor))].sort((a, b) => a - b),
        [rooms, selectedBuilding]
    );
    const visibleRooms = rooms.filter(
        (room) => room.building === selectedBuilding && String(room.floor) === selectedFloor
    );

    const selectBuilding = (building) => {
        const firstRoom = rooms.find((room) => room.building === building);
        setSelectedBuilding(building);
        setSelectedFloor(firstRoom ? String(firstRoom.floor) : "");
        setSelectedRoomId(firstRoom?._id || "");
        setAssetType("");
    };

    const selectFloor = (floor) => {
        const firstRoom = rooms.find(
            (room) => room.building === selectedBuilding && String(room.floor) === floor
        );
        setSelectedFloor(floor);
        setSelectedRoomId(firstRoom?._id || "");
        setAssetType("");
    };

    const handleInitialize = async () => {
        try {
            setMessage("");
            setError("");
            const response = await initializeInfrastructure();
            setMessage(response.message);
            await loadRooms();
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to initialize infrastructure.");
        }
    };

    const handleRoomField = (event) => {
        const { name, value } = event.target;
        setRoomForm((current) => ({ ...current, [name]: value }));
    };

    const addAssetRow = () => {
        setRoomForm((current) => ({
            ...current,
            assets: [...current.assets, { ...emptyAsset }]
        }));
    };

    const updateAssetRow = (index, field, value) => {
        setRoomForm((current) => ({
            ...current,
            assets: current.assets.map((asset, assetIndex) =>
                assetIndex === index ? { ...asset, [field]: value } : asset
            )
        }));
    };

    const removeAssetRow = (index) => {
        setRoomForm((current) => ({
            ...current,
            assets: current.assets.filter((_, assetIndex) => assetIndex !== index)
        }));
    };

    const saveRoom = async (event) => {
        event.preventDefault();
        try {
            setSavingRoom(true);
            setError("");
            setMessage("");

            const assets = roomForm.assets.map((asset) => ({
                ...asset,
                quantity: Number(asset.quantity)
            }));

            const response = await createInfrastructureRoom({
                ...roomForm,
                floor: Number(roomForm.floor),
                capacity: Number(roomForm.capacity) || 0,
                assets
            });

            setMessage(response.message);
            setSelectedBuilding(response.data.building);
            setSelectedFloor(String(response.data.floor));
            setSelectedRoomId(response.data._id);
            setRoomForm(emptyRoomForm);
            setShowRoomForm(false);
            await loadRooms();
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to add this room.");
        } finally {
            setSavingRoom(false);
        }
    };

    const openRoomEditor = () => {
        if (!roomDetails?.room) return;
        const room = roomDetails.room;
        setEditRoomForm({
            building: room.building,
            floor: String(room.floor),
            roomNumber: room.roomNumber,
            roomType: room.roomType,
            capacity: String(room.capacity || 0),
            department: room.department || "General",
            assets: room.assets.map((asset) => ({
                _id: asset._id,
                type: asset.type,
                quantity: asset.quantity
            }))
        });
        setError("");
        setMessage("");
    };

    const updateEditField = (event) => {
        const { name, value } = event.target;
        setEditRoomForm((current) => ({ ...current, [name]: value }));
    };

    const addEditAsset = () => {
        setEditRoomForm((current) => ({
            ...current,
            assets: [...current.assets, { ...emptyAsset }]
        }));
    };

    const updateEditAsset = (index, field, value) => {
        setEditRoomForm((current) => ({
            ...current,
            assets: current.assets.map((asset, assetIndex) =>
                assetIndex === index ? { ...asset, [field]: value } : asset
            )
        }));
    };

    const removeEditAsset = (index) => {
        setEditRoomForm((current) => ({
            ...current,
            assets: current.assets.filter((_, assetIndex) => assetIndex !== index)
        }));
    };

    const saveRoomChanges = async (event) => {
        event.preventDefault();
        try {
            setSavingEdit(true);
            setError("");
            setMessage("");
            const response = await updateInfrastructureRoom(selectedRoomId, {
                ...editRoomForm,
                floor: Number(editRoomForm.floor),
                capacity: Number(editRoomForm.capacity) || 0,
                assets: editRoomForm.assets.map((asset) => ({
                    ...asset,
                    quantity: Number(asset.quantity)
                }))
            });

            setSelectedBuilding(response.data.building);
            setSelectedFloor(String(response.data.floor));
            setMessage(response.message);
            setEditRoomForm(null);
            await loadRooms();
            setDetailVersion((value) => value + 1);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to update this room.");
        } finally {
            setSavingEdit(false);
        }
    };

    const selectedRoom = roomDetails?.room;
    const complaints = roomDetails?.complaints || [];
    const assetIssues = roomDetails?.assetIssues || [];
    const affectedForAsset = (assetId) =>
        assetIssues.find((issue) => String(issue._id) === String(assetId))?.affected || 0;
    const totalAffected = assetIssues.reduce((sum, issue) => sum + issue.affected, 0);

    return (
        <DashboardLayout>
            <section className="page-header page-header-row">
                <div>
                    <h1>College Infrastructure</h1>
                    <p>Open a building, floor and room to inspect assets and department complaints.</p>
                </div>
                <div className="page-header-actions">
                    <button type="button" className="header-action-button" onClick={() => setShowRoomForm((value) => !value)}>
                        {showRoomForm ? "Close Form" : "Add Room / Lab"}
                    </button>
                    <Link to="/admin/infrastructure/import" className="header-action-button"><FileUp size={17} /> Import Blueprint / Excel</Link>
                    <Link to="/admin/analytics" className="header-action-button">View Analytics</Link>
                </div>
            </section>

            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}

            {showRoomForm && (
                <section className="infrastructure-panel room-builder">
                    <div className="section-heading-row">
                        <div>
                            <h2>Add a college space</h2>
                            <p>A classroom, laboratory, server room, office or other physical room.</p>
                        </div>
                    </div>

                    <form onSubmit={saveRoom}>
                        <div className="room-builder-grid">
                            <label>Building name<input required name="building" value={roomForm.building} onChange={handleRoomField} placeholder="Example: Science Block" /></label>
                            <label>Floor number<input required type="number" min="0" name="floor" value={roomForm.floor} onChange={handleRoomField} placeholder="0 for ground floor" /></label>
                            <label>Room number<input required name="roomNumber" value={roomForm.roomNumber} onChange={handleRoomField} placeholder="Example: 319" /></label>
                            <label>Space type<select name="roomType" value={roomForm.roomType} onChange={handleRoomField}>{spaceTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
                            <label>Capacity<input type="number" min="0" name="capacity" value={roomForm.capacity} onChange={handleRoomField} placeholder="Number of people" /></label>
                            <label>Responsible department<select name="department" value={roomForm.department} onChange={handleRoomField}>{departments.map((department) => <option key={department}>{department}</option>)}</select></label>
                        </div>

                        <div className="room-assets-heading">
                            <div><h3>Assets inside this space</h3><p>Add fans, lights, computers, projectors, servers, AC units and other equipment.</p></div>
                            <button type="button" className="reset-filter-button" onClick={addAssetRow}>Add Asset</button>
                        </div>

                        {roomForm.assets.length === 0 ? (
                            <p className="room-builder-help">You may create the room now and add its inventory later.</p>
                        ) : (
                            <div className="new-assets-list">
                                {roomForm.assets.map((asset, index) => (
                                    <div className="new-asset-row" key={index}>
                                        <label>Type<select value={asset.type} onChange={(event) => updateAssetRow(index, "type", event.target.value)}>{assetTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
                                        <label>Total<input type="number" min="1" value={asset.quantity} onChange={(event) => updateAssetRow(index, "quantity", event.target.value)} /></label>
                                        <button type="button" className="remove-asset-button" onClick={() => removeAssetRow(index)}>Remove</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button type="submit" className="primary-button room-save-button" disabled={savingRoom}>
                            {savingRoom ? "Saving..." : "Save Room to Blueprint"}
                        </button>
                    </form>
                </section>
            )}

            {!loading && rooms.length === 0 ? (
                <section className="empty-state infrastructure-empty">
                    <Building2 size={44} />
                    <h2>No college blueprint yet</h2>
                    <p>Initialize Main Block, 3rd Floor and Rooms 301–320 to start using the module.</p>
                    <button type="button" className="primary-button" onClick={handleInitialize}>
                        Initialize Sample Blueprint
                    </button>
                </section>
            ) : (
                <>
                    <section className="infrastructure-toolbar">
                        <label>
                            Building
                            <select value={selectedBuilding} onChange={(event) => selectBuilding(event.target.value)}>
                                {buildings.map((building) => <option key={building}>{building}</option>)}
                            </select>
                        </label>
                        <label>
                            Floor
                            <select value={selectedFloor} onChange={(event) => selectFloor(event.target.value)}>
                                {floors.map((floor) => <option key={floor} value={floor}>Floor {floor}</option>)}
                            </select>
                        </label>
                        <div className="infrastructure-breadcrumb">
                            {selectedBuilding} / Floor {selectedFloor} / {selectedRoom ? `Room ${selectedRoom.roomNumber}` : "Select room"}
                        </div>
                    </section>

                    <section className="infrastructure-stats stats-grid">
                        <article className="stat-card"><span>Rooms on floor</span><strong>{visibleRooms.length}</strong></article>
                        <article className="stat-card"><span>Open room issues</span><strong>{selectedRoom ? complaints.filter((item) => ["Pending", "In Progress"].includes(item.status)).length : 0}</strong></article>
                        <article className="stat-card"><span>Assets in room</span><strong>{selectedRoom?.assets.reduce((sum, asset) => sum + asset.quantity, 0) || 0}</strong></article>
                        <article className="stat-card"><span>Reported affected</span><strong>{totalAffected}</strong></article>
                    </section>

                    {editRoomForm && (
                        <section className="infrastructure-panel room-builder room-edit-panel">
                            <div className="section-heading-row">
                                <div>
                                    <h2>Edit Room {selectedRoom?.roomNumber}</h2>
                                    <p>Change its location, convert a lab to a classroom, reassign its department or update asset quantities.</p>
                                </div>
                                <button type="button" className="reset-filter-button" onClick={() => setEditRoomForm(null)}>Cancel</button>
                            </div>

                            <form onSubmit={saveRoomChanges}>
                                <div className="room-builder-grid">
                                    <label>Building<input required name="building" value={editRoomForm.building} onChange={updateEditField} /></label>
                                    <label>Floor<input required type="number" min="0" name="floor" value={editRoomForm.floor} onChange={updateEditField} /></label>
                                    <label>Room number<input required name="roomNumber" value={editRoomForm.roomNumber} onChange={updateEditField} /></label>
                                    <label>Space type<select name="roomType" value={editRoomForm.roomType} onChange={updateEditField}>{spaceTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
                                    <label>Capacity<input type="number" min="0" name="capacity" value={editRoomForm.capacity} onChange={updateEditField} /></label>
                                    <label>Responsible department<select name="department" value={editRoomForm.department} onChange={updateEditField}>{departments.map((department) => <option key={department}>{department}</option>)}</select></label>
                                </div>

                                <div className="room-assets-heading">
                                    <div><h3>Room assets</h3><p>Existing asset IDs are preserved when quantities or types change.</p></div>
                                    <button type="button" className="reset-filter-button" onClick={addEditAsset}>Add Asset</button>
                                </div>

                                {editRoomForm.assets.length === 0 ? (
                                    <p className="room-builder-help">This room currently has no listed assets.</p>
                                ) : (
                                    <div className="new-assets-list">
                                        {editRoomForm.assets.map((asset, index) => (
                                            <div className="new-asset-row" key={asset._id || `new-${index}`}>
                                                <label>Type<select value={asset.type} onChange={(event) => updateEditAsset(index, "type", event.target.value)}>{assetTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
                                                <label>Total<input type="number" min="1" value={asset.quantity} onChange={(event) => updateEditAsset(index, "quantity", event.target.value)} /></label>
                                                <button type="button" className="remove-asset-button" onClick={() => removeEditAsset(index)}>Remove</button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button type="submit" className="primary-button room-save-button" disabled={savingEdit}>
                                    {savingEdit ? "Saving Changes..." : "Save Room Changes"}
                                </button>
                            </form>
                        </section>
                    )}

                    <section className="infrastructure-panel">
                        <div className="section-heading-row">
                            <div><h2>Floor {selectedFloor} rooms</h2><p>Select a room to see its complete problem list.</p></div>
                        </div>
                        <div className="room-grid">
                            {visibleRooms.map((room) => (
                                <button
                                    type="button"
                                    key={room._id}
                                    className={`room-tile ${selectedRoomId === room._id ? "selected" : ""}`}
                                    onClick={() => { setSelectedRoomId(room._id); setAssetType(""); setEditRoomForm(null); }}
                                >
                                    <DoorOpen size={20} />
                                    <strong>{room.roomNumber}</strong>
                                    <span className={room.openComplaintCount ? "room-issue" : "room-clear"}>
                                        {room.openComplaintCount ? `${room.openComplaintCount} open` : "No open issues"}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {detailLoading ? <div className="empty-state"><p>Loading room...</p></div> : selectedRoom && (
                        <section className="room-detail-grid">
                            <div className="infrastructure-panel">
                                <div className="section-heading-row">
                                    <div><h2>Room {selectedRoom.roomNumber}</h2><p>{selectedRoom.roomType} · Capacity {selectedRoom.capacity}</p></div>
                                    <button type="button" className="reset-filter-button room-edit-button" onClick={openRoomEditor}><Pencil size={16} /> Edit Room</button>
                                </div>
                                <div className="asset-list">
                                    <button type="button" className={`asset-row ${assetType === "" ? "selected" : ""}`} onClick={() => setAssetType("")}>
                                        <span><Wrench size={18} /><strong>All assets</strong></span><em>Show every complaint</em>
                                    </button>
                                    {selectedRoom.assets.map((asset) => (
                                        <button type="button" className={`asset-row ${assetType === asset.type ? "selected" : ""}`} key={asset._id} onClick={() => setAssetType(asset.type)}>
                                            <span><Lightbulb size={18} /><strong>{asset.name}</strong></span>
                                            <em>Total {asset.quantity} · {affectedForAsset(asset._id)} reported affected</em>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="infrastructure-panel">
                                <div className="section-heading-row">
                                    <div><h2>{assetType || "All"} complaints</h2><p>Problems linked to Room {selectedRoom.roomNumber}.</p></div>
                                    <select value={status} onChange={(event) => setStatus(event.target.value)}>
                                        <option value="">All statuses</option>
                                        <option>Pending</option><option>In Progress</option><option>Resolved</option><option>Rejected</option>
                                    </select>
                                </div>
                                {complaints.length === 0 ? <div className="empty-state compact"><p>No complaints match this room and asset.</p></div> : (
                                    <div className="infrastructure-table-wrap"><table className="infrastructure-table"><thead><tr><th>Issue</th><th>Asset</th><th>Affected</th><th>Status</th><th>Reported</th><th></th></tr></thead><tbody>
                                        {complaints.map((complaint) => <tr key={complaint._id}><td>{complaint.title}</td><td>{complaint.location?.assetName || "Room"}</td><td>{complaint.location?.assetId ? complaint.location.affectedQuantity || 1 : "—"}</td><td><span className={`status-badge ${complaint.status.toLowerCase().replaceAll(" ", "-")}`}>{complaint.status}</span></td><td>{new Date(complaint.createdAt).toLocaleDateString()}</td><td><Link className="text-link" to={`/admin/complaints/${complaint._id}`}>View</Link></td></tr>)}
                                    </tbody></table></div>
                                )}
                            </div>
                        </section>
                    )}
                </>
            )}
        </DashboardLayout>
    );
};

export default AdminInfrastructure;
