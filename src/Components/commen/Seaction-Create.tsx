import { IoIosCloseCircle } from "react-icons/io";
import Button from "./Button";
import Input from "./Input";
import { AiOutlinePartition } from "react-icons/ai";
import SGTextarea from "./SGTextarea";
import { FaPen } from "react-icons/fa";
import SGDropdown from "./SGDropdown";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface User {
    id: number | string;
    full_name: string;
    username: string;
    department_id: number | string;
    role: string;
}

interface SectionCreateProps {
    onClick?: () => void;
    departmentId: string | number;
}

let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';


export default function SectionCreate({ onClick, departmentId }: SectionCreateProps) {
    // Form States
    const [sectionName, setSectionName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedHead, setSelectedHead] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Data States
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // ૧. યુઝર્સ લોડ કરવાનું લોજિક (ડિપાર્ટમેન્ટ ફિલ્ટર સાથે)
    useEffect(() => {
        const fetchAllUsers = async () => {
            setIsLoading(true);
            setErrorMsg("");
            try {
                const response = await fetch(`${API_URL}/user/alldata`);
                const data = await response.json();

                if (data.success) {
                    const allUsers: User[] = data.users || data.data || [];
                    const filteredUsers = allUsers.filter(
                        (user: User) => String(user.department_id).trim() === String(departmentId).trim()
                    );
                    
                    setUsers(filteredUsers);
                } else {
                    setErrorMsg("Failed to fetch users.");
                }
            } catch (error) {
                console.error("Error fetching users:", error);
                setErrorMsg("Network error occurred while fetching users.");
            } finally {
                setIsLoading(false);
            }
        };

        if (departmentId) {
            fetchAllUsers();
        }
    }, [departmentId]);

    // ડ્રોપડાઉન ઓપ્શન્સ
    const headOptions = users.map((user) => ({
        value: String(user.id),
        label: `${user.full_name} (${user.role ? user.role.replace(/_/g, " ") : "Member"})`,
    }));

    // ૨. ડેટાબેઝમાં સેક્શન સેવ (CREATE) કરવા માટેનું ફંક્શન
    const handleCreate = async () => {
        if (!sectionName.trim()) {
            toast.error("Please enter a section name."); // 👈 Alert ની જગ્યાએ Error Toast
            return;
        }

        // ડેટાબેઝ કોલ શરૂ થાય ત્યારે લોડિંગ ટોસ્ટ
        const loadingToast = toast.loading("Creating section...");

        try {
            setIsSubmitting(true);

            const payload = {
                department_id: Number(departmentId),
                title: sectionName,
                description: description,
                section_head_id: selectedHead ? Number(selectedHead) : null,
                users_id: [] 
            };

            const response = await fetch(`${API_URL}/sections`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (result.success) {
                toast.success("Section created successfully!", { id: loadingToast }); // 👈 Alert ની જગ્યાએ Success Toast
                if (onClick) onClick(); 
            } else {
                toast.error(result.message || "Failed to create section.", { id: loadingToast }); // 👈 Alert ની જગ્યાએ Error Toast
            }
        } catch (error) {
            console.error("Error creating section:", error);
            toast.error("Something went wrong while creating the section.", { id: loadingToast }); // 👈 Alert ની જગ્યાએ Error Toast
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reset Form
    const handleReset = () => {
        setSectionName("");
        setDescription("");
        setSelectedHead("");
    };

    return (
        <div className="fixed top-0 left-0 w-full h-screen bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="w-full max-w-2xl bg-white p-8 shadow-2xl rounded-3xl flex flex-col gap-6 relative">
                
                {/* Header */}
                <div className="w-full flex justify-between items-center border-b border-gray-100 pb-4">
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Create Section</h1>
                    <button onClick={onClick} className="text-gray-400 hover:text-red-800 transition-colors">
                        <IoIosCloseCircle size={36} />
                    </button>
                </div>

                {/* Form Fields */}
                <div className="w-full flex flex-col gap-5 py-2">
                    <Input
                        label="Section Name"
                        placeholder="Enter Section Name"
                        icon={<AiOutlinePartition size={20} />}
                        value={sectionName}
                        onChange={(e) => setSectionName(e.target.value)}
                    />
                    
                    <SGTextarea
                        label="Description"
                        icon={<FaPen />}
                        placeholder="Enter Description..."
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    
                    {errorMsg ? (
                        <p className="text-red-500 text-sm font-bold pl-2">{errorMsg}</p>
                    ) : (
                        <SGDropdown
                            label={isLoading ? "Loading Heads..." : "Select Head"}
                            name="head"
                            value={selectedHead}
                            onChange={(e) => setSelectedHead(e.target.value)}
                            options={headOptions}
                            placeholder={
                                isLoading 
                                ? "Fetching users..." 
                                : headOptions.length === 0 
                                    ? "No users found for this department" 
                                    : "-- Choose Option --"
                            }
                        />
                    )}
                </div>

                {/* Actions */}
                <div className="w-full pt-4 flex justify-between items-center">
                    <button 
                        onClick={handleReset}
                        className="px-6 py-2.5 font-bold text-gray-600 cursor-pointer hover:bg-gray-100 duration-300 border-2 border-gray-200 rounded-xl"
                    >
                        RESET
                    </button>
                    <Button
                        text={isSubmitting ? "CREATING..." : "CREATE"}
                        className="px-8 py-3 rounded-xl font-bold bg-[#800000] text-white hover:bg-[#600000] shadow-md transition-colors"
                        onClick={handleCreate} 
                        disabled={isSubmitting} // 👈 સેવ થતું હોય ત્યારે બટન ડિસેબલ કરી દીધું છે 
                    />
                </div>
            </div>
        </div>
    );
}