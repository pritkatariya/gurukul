import { useState, useEffect } from "react";
import { IoIosCloseCircle } from "react-icons/io";
import { FaUserPlus } from "react-icons/fa";
import SGDropdown from "./SGDropdown";
import Button from "./Button";

interface User {
    id: number | string;
    full_name: string;
    department_id: number | string;
}

interface AddMemberModalProps {
    sectionId: number;
    departmentId: number | string;
    currentUsers: number[]; // પેરેન્ટમાંથી લાઈવ આવતા યુઝર્સના ID નો એરે
    onClose: () => void;
    onUpdate: () => void;
}

let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';


export default function AddMemberModal({ sectionId, departmentId, currentUsers, onClose, onUpdate }: AddMemberModalProps) {
    const [allDeptUsers, setAllDeptUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // ૧. ડેટાબેઝમાંથી તે જ ડિપાર્ટમેન્ટના બધા લાઈવ યુઝર્સ લોડ કરો
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`${API_URL}/user/alldata`);
                const data = await response.json();
                
                // ડેટાબેઝમાંથી આવતા ડેટાનું સેફ હેન્ડલિંગ
                if (data && (data.success || data.data || data.users)) {
                    const allUsers: User[] = data.users || data.data || (Array.isArray(data) ? data : []);
                    
                    // માત્ર એ જ યુઝર્સ ફિલ્ટર કરો જે કરંટ ડિપાર્ટમેન્ટના હોય
                    const filtered = allUsers.filter(
                        (u) => String(u.department_id) === String(departmentId)
                    );
                    setAllDeptUsers(filtered);
                }
            } catch (err) {
                console.error("Error fetching users for modal:", err);
            }
        };
        fetchUsers();
    }, [departmentId]);
    const availableOptions = allDeptUsers
        .filter((u) => {
            const userIdNum = Number(u.id);
            const currentUsersNums = currentUsers.map((id) => Number(id));
            return !currentUsersNums.includes(userIdNum);
        })
        .map((u) => ({
            value: String(u.id),
            label: u.full_name,
        }));

    const handleAddMember = async () => {
        if (!selectedUserId) {
            alert("Please select a member first!");
            return;
        }
        
        setIsLoading(true);
        try {
            // જૂના એરેમાં નવો સિલેક્ટેડ યુઝર આઈડી નંબર ફોર્મેટમાં ઉમેરો
            const updatedUsers = [...currentUsers.map((id) => Number(id)), Number(selectedUserId)];
            
            // બેકએન્ડ API કોલ (PUT /sections/:id) જે ડેટાબેઝમાં એરે અપડેટ કરશે
            const response = await fetch(`${API_URL}/sections/${sectionId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ users_id: updatedUsers }),
            });
            
            const resData = await response.json();
            if (resData.success) {
                alert("Member added successfully to Database!");
                setSelectedUserId("");
                onUpdate();
                onClose();
            } else {
                alert(resData.message || "Failed to update section members in database.");
            }
        } catch (error) {
            console.error("Error adding member:", error);
            alert("Server error while updating member array.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed top-0 left-0 w-full h-screen bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="w-full max-w-md bg-white p-6 shadow-2xl rounded-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
                
                <div className="flex justify-between items-center border-b pb-3 border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800">Add Section Member</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer">
                        <IoIosCloseCircle size={28} />
                    </button>
                </div>

                <div className="flex flex-col gap-4 py-2">
                    {availableOptions.length === 0 ? (
                        <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100 font-medium text-center">
                            All available department users are already added to this section.
                        </p>
                    ) : (
                        <SGDropdown
                            label="Select New Member"
                            name="new_member"
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            options={availableOptions}
                            placeholder="-- Choose Member --"
                        />
                    )}
                    
                    {availableOptions.length > 0 && (
                        <Button
                            text={isLoading ? "Adding Member..." : "Add to Section"}
                            icon={<FaUserPlus />}
                            onClick={handleAddMember}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl mt-2 flex justify-center items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                            disabled={isLoading}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}