import { toast } from "sonner";

export const handleUserDelete = async (
  id: string | number,
  refreshUsers?: () => void | Promise<void>
) => {
  try {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    if (API_URL.endsWith("/")) API_URL = API_URL.slice(0, -1);

    const response = await fetch(`${API_URL}/user/delete/${id}`, {
      method: "DELETE"
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      toast.error(data.message || "Failed to delete user");
      return;
    }

    toast.success(data.message || "User deleted successfully");

    if (refreshUsers) {
      await refreshUsers();
    }
  } catch (error) {
    console.error(error);
    toast.error("Server error while deleting user");
  }
};