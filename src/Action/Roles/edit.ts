import { toast } from "sonner";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

export type RoleEditPayload = {
    roleName: string;
    roleCode: string;
    permissions: Record<string, any>;
};

export const fetchRoleForEdit = async (roleId: number | string) => {
    try {
        const response = await fetch(`${API_URL}/auth/role/update/${roleId}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Failed to fetch role details");
        }

        return data.role;
    } catch (error) {
        console.error("fetchRoleForEdit error:", error);
        toast.error(error instanceof Error ? error.message : "Failed to open edit form");
        return null;
    }
};

export const updateRoleById = async (
    roleId: number | string,
    payload: RoleEditPayload
) => {
    try {
        const response = await fetch(`${API_URL}/auth/role/update/${roleId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Role update failed");
        }

        toast.success(data.message || "Role updated successfully!");
        return data.role;
    } catch (error) {
        console.error("updateRoleById error:", error);
        toast.error(error instanceof Error ? error.message : "Role update failed");
        return null;
    }
};

export const handleRoleEdit = async (
    roleId: number | string,
    payload?: RoleEditPayload
) => {
    if (!payload) {
        return fetchRoleForEdit(roleId);
    }

    return updateRoleById(roleId, payload);
};