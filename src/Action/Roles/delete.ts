import { toast } from "sonner";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

export const handleRoleDelete = async (
    roleId: number | string,
    refreshData?: () => void
) => {
    try {
        const response = await fetch(`${API_URL}/auth/role/delete/${roleId}`, {
            method: "DELETE",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Failed to delete role");
        }

        toast.success(result.message || "Role deleted successfully");

        if (refreshData) {
            refreshData();
        }
    } catch (error) {
        console.error("Error in handleRoleDelete:", error);
        toast.error(error instanceof Error ? error.message : "Failed to delete the role.");
    }
};