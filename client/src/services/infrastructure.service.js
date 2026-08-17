import api from "./api";

export const getInfrastructureOptions = async () => {
    const response = await api.get("/infrastructure/options");
    return response.data;
};

export const getInfrastructureRooms = async (params = {}) => {
    const response = await api.get("/infrastructure/rooms", { params });
    return response.data;
};

export const getInfrastructureRoom = async (roomId, params = {}) => {
    const response = await api.get(`/infrastructure/rooms/${roomId}`, { params });
    return response.data;
};

export const initializeInfrastructure = async () => {
    const response = await api.post("/infrastructure/seed");
    return response.data;
};

export const createInfrastructureRoom = async (data) => {
    const response = await api.post("/infrastructure/rooms", data);
    return response.data;
};

export const updateInfrastructureAsset = async (roomId, assetId, data) => {
    const response = await api.patch(
        `/infrastructure/rooms/${roomId}/assets/${assetId}`,
        data
    );
    return response.data;
};

export const downloadInfrastructureTemplate = async () => {
    const response = await api.get("/infrastructure/imports/template", { responseType: "blob" });
    return response.data;
};

const uploadImportFile = async (url, file, fields = {}) => {
    const formData = new FormData();
    formData.append("file", file);
    Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
    const response = await api.post(url, formData);
    return response.data;
};

export const previewInfrastructureSpreadsheet = (file) =>
    uploadImportFile("/infrastructure/imports/spreadsheet/preview", file);

export const previewInfrastructureBlueprint = (file, fields = {}) =>
    uploadImportFile("/infrastructure/imports/blueprint/preview", file, fields);

export const publishInfrastructureImport = async (importId, data) => {
    const response = await api.post(`/infrastructure/imports/${importId}/publish`, data);
    return response.data;
};
