export const getSectionMembersDetails = async (usersIdArray: number[]) => {
    if (usersIdArray.length === 0) return [];
    try {
        const response = await fetch(`http://localhost:3000/sections/members-details?users_id=${usersIdArray.join(",")}`);
        const result = await response.json();
        return result.success ? result.data : [];
    } catch (error) {
        console.error("Error in view action:", error);
        return [];
    }
};