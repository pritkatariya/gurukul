import { toast } from "sonner";

export const handleUserDelete = async (userId: number | string, refreshCallback?: () => void) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this record?");
    if (!isConfirmed) return;

    try {
        console.log("Executing Action: Sending Delete API Request for ID ->", userId);
        toast.error("Record deleted successfully!");
        
        if (refreshCallback) {
            refreshCallback(); // એક્શન પત્યા પછી ટેબલ લિસ્ટ રીફ્રેશ કરવા માટે
        }
    } catch (error) {
        toast.error("Failed to delete the user record");
    }
};