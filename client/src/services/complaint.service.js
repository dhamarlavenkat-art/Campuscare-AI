import api from "./api";

export const createComplaint = async (complaintData) => {
    const response = await api.post(
        "/complaints/create",
        complaintData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );

    return response.data;
};

export const supportComplaint = async (complaintId) => {
    const response = await api.post(
        `/complaints/support/${complaintId}`
    );

    return response.data;
};

export const getMyComplaints = async () => {
    const response = await api.get("/complaints/my");
    return response.data;
};

export const deleteComplaint = async (complaintId) => {
    const response = await api.delete(
        `/complaints/delete/${complaintId}`
    );

    return response.data;
};
export const getComplaintById = async (complaintId) => {
    const response = await api.get(
        `/complaints/${complaintId}`
    );

    return response.data;
};

export const getComplaintHistory = async (complaintId) => {
    const response = await api.get(
        `/complaints/history/${complaintId}`
    );

    return response.data;
};