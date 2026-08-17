import api from "./api";

export const getAdminDashboardStats = async () => {
    const response = await api.get("/admin/dashboard");
    return response.data;
};

export const getAdminComplaints = async (params = {}) => {
    const response = await api.get("/admin/complaints", {
        params
    });

    return response.data;
};

export const updateComplaintStatus = async (
    complaintId,
    statusData
) => {
    const response = await api.patch(
        `/admin/status/${complaintId}`,
        statusData
    );

    return response.data;
};
export const getAdminComplaintById = async (complaintId) => {
    const response = await api.get(
        `/admin/complaints/${complaintId}`
    );

    return response.data;
};

export const getAdminComplaintSuggestions = async (complaintId) => {
    const response = await api.post(
        `/admin/complaints/${complaintId}/suggestions`
    );
    return response.data;
};

export const getAdminAnalytics = async (params = {}) => {
    const response = await api.get("/admin/analytics", { params });
    return response.data;
};
