import { useState, useEffect } from "react";
import DataExplorer from "../../../Components/commen/DataExplorer.tsx";
import { toast } from "sonner";

// ૧. ટાઈપસ્ક્રીપ્ટ માટે યુઝર ડેટાનું સ્ટ્રક્ચર સેટ કર્યું (img ઉમેર્યું)
interface UserType {
    img: string | null;
    name: string;
    role: string;
    dept: string;
    date: string;
    status: string;
}

export default function UserList() {
    const [userData, setUserData] = useState<UserType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [totalCount, setTotalCount] = useState<number>(0);

    // ૨. યુઝર પેજ માટેના પ્રીમિયમ હેડર્સ (Profile સૌથી પહેલા રાખ્યું)
    const userHeaders = [
        "Profile",
        "Full Name",
        "Assigned Role",
        "Department",
        "Joined Date",
        "Status"
    ];

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                if (API_URL.endsWith('/')) {
                    API_URL = API_URL.slice(0, -1);
                }

                const response = await fetch(`${API_URL}/user/alldata`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch data: ${response.status}`);
                }

                const data = await response.json();

                if (data.success && data.users) {
                    // ડેટાબેઝના ઓબ્જેક્ટને ફ્રન્ટએન્ડના ફોર્મેટ સાથે લિંક કર્યું
                    const formattedUsers = data.users.map((user: any) => ({
                        img: user.profile_image_url || null, // 💡 ડેટાબેઝમાંથી આવતી HTTPS URL
                        name: user.full_name,
                        role: user.role,
                        dept: user.department,
                        date: user.joined_date || "N/A",
                        status: "Active"
                    }));

                    setUserData(formattedUsers);
                    setTotalCount(data.count || formattedUsers.length);
                } else {
                    toast.error("Failed to load users from database");
                }
            } catch (error) {
                console.error("Fetch Users Error:", error);
                toast.error("Database Server is offline or unreachable");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div className="w-full min-h-screen bg-gray-50/50 flex flex-col items-center p-6 sm:p-10">

            {/* Header Section */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-red-950 uppercase tracking-tight">
                    Gurukul Sevak / User Directory
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    {loading
                        ? "Loading profiles from Gurukul database..."
                        : `Showing active system users out of ${totalCount} registered Gurukul profiles`
                    }
                </p>
                <div className="h-1.5 w-16 bg-red-800 mx-auto mt-3 rounded-full" />
            </div>

            {/* Main Container */}
            <div className="w-full max-w-6xl bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex justify-center items-center min-h-50">
                {loading ? (
                    <div className="flex flex-col items-center gap-2 text-gray-500 font-semibold animate-pulse">
                        <div className="w-8 h-8 border-4 border-red-800 border-t-transparent rounded-full animate-spin"></div>
                        Loading Users...
                    </div>
                ) : userData.length === 0 ? (
                    <div className="text-gray-400 font-semibold py-10">No users found in the database.</div>
                ) : (
                    <DataExplorer headers={userHeaders} data={userData} />
                )}
            </div>

        </div>
    );
}