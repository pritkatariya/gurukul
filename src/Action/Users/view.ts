import { toast } from "sonner";

export const handleUserView = (userId: number | string, data?: any) => {
    console.log("Executing Action: View User details for ID ->", userId);
    toast.info(`Viewing details of: ${data?.name || 'User'}`);
    
    // અહીં તમે વ્યુ મોડલ ખોલવાનું સ્ટેટ ફંક્શન પાસ કરીને ટ્રીગર કરાવી શકો છો
};