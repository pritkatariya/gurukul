import { toast } from "sonner";

export const handleUserEdit = async (id: string | number, item: any, fetchAllUsers: () => Promise<void>) => {
  try {
    let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    if (API_URL.endsWith("/")) API_URL = API_URL.slice(0, -1);

    const fullName = window.prompt("Enter full name", item?.name || "");
    if (!fullName) return;

    const username = window.prompt("Enter username", item?.dept || "");
    if (!username) return;

    const role = window.prompt("Enter role", item?.role || "user");
    if (!role) return;

    const response = await fetch(`${API_URL}/user/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fullName,
        username,
        userRole: role
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      toast.error(data.message || "Failed to update user");
      return;
    }

    toast.success(data.message || "User updated successfully");
    window.location.reload();
  } catch (error) {
    console.error(error);
    toast.error("Server error while updating user");
  }
};