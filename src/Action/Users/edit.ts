import { toast } from "sonner";

export const handleUserEdit = (userId: number | string, data?: any) => {
    console.log("Executing Action: Open Edit Form for ID ->", userId);
    toast.success(`Opening Form to Edit: ${data?.name || 'User'}`);
    
    // અહીં તમારી એડિટ મોડલ વાળી સ્ટેટ ઓપન કરવાનું લોજિક આવશે
};