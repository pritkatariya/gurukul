export const removeMemberFromSection = async (sectionId: number, currentUsers: number[], userIdToRemove: number) => {
    try {
        // જે યુઝરને કાઢવો છે તેને ફિલ્ટર કરો
        const updatedUsers = currentUsers.filter(id => id !== userIdToRemove);

        const response = await fetch(`http://localhost:3000/sections/${sectionId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ users_id: updatedUsers }),
        });

        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error("Error in delete member action:", error);
        return false;
    }
};

export const deleteWholeSection = async (sectionId: number) => {
    try {
        const response = await fetch(`http://localhost:3000/sections/${sectionId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });
        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error("Error deleting section:", error);
        return false;
    }
};