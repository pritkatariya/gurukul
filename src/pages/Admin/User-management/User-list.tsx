import { useState, useEffect, type SetStateAction } from "react";
import { toast } from "sonner";
import {
    FaUsers,
    FaUserShield,
    FaUserTie,
    FaUserGraduate,
    FaTimes,
    FaTrash,
    FaSave,
    FaEye
} from "react-icons/fa";
import DataExplorer from "../../../Components/commen/DataExplorer.tsx";

interface UserType {
    id: string | number;
    img: string | null;
    name: string;
    role: string;
    dept: string;
    date: string;
    status: string;
}

type CategoryType = "admin" | "head" | "user";

export default function UserList() {
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<UserType[]>([]);
    const [activeTab, setActiveTab] = useState<CategoryType>("user");
    const [loading, setLoading] = useState<boolean>(true);
    const [deptMap, setDeptMap] = useState<{ [key: number]: string }>({});

    const [viewUser, setViewUser] = useState<UserType | null>(null);
    const [editUser, setEditUser] = useState<UserType | null>(null);
    const [deleteUser, setDeleteUser] = useState<UserType | null>(null);

    const [editName, setEditName] = useState("");
    const [editUsername, setEditUsername] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const userHeaders = [
        "Profile",
        "Full Name",
        "Role / Position",
        "Username",
        "Joined Date",
        "Status"
    ];

    const getApiUrl = () => {
        let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
        if (API_URL.endsWith("/")) API_URL = API_URL.slice(0, -1);
        return API_URL;
    };

    const getRoleCode = (role: any) => String(role || "").trim().toLowerCase();

    const isAdminRole = (role: any) => {
        const roleCode = getRoleCode(role);
        return roleCode === "admin" || roleCode === "super_admin" || roleCode === "super-admin";
    };

    const isHeadRole = (role: any) => {
        const roleCode = getRoleCode(role);
        return roleCode === "head1029" || roleCode === "department main";
    };

    const fetchLiveDepartments = async () => {
        try {
            const API_URL = getApiUrl();
            const response = await fetch(`${API_URL}/auth/departments`);
            const data = await response.json();

            if (data.success && data.departments) {
                const mapping: { [key: number]: string } = {};
                data.departments.forEach((department: any) => {
                    mapping[department.id] = department.name;
                });
                setDeptMap(mapping);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchAllUsers = async () => {
        try {
            setLoading(true);
            const API_URL = getApiUrl();

            const response = await fetch(`${API_URL}/user/alldata`);
            if (!response.ok) throw new Error("Failed to fetch users");

            const data = await response.json();

            if (data.success && data.users) {
                setAllUsers(data.users);
            } else {
                toast.error("Failed to load users from database");
            }
        } catch (error) {
            console.error(error);
            toast.error("Database Server is offline or unreachable");
        } finally {
            setLoading(false);
        }
    };

    const openEditPopup = (user: UserType) => {
        setEditUser(user);
        setEditName(user.name || "");
        setEditUsername(user.dept || "");
    };

    const closeEditPopup = () => {
        setEditUser(null);
        setEditName("");
        setEditUsername("");
    };

    const handleUpdateUser = async () => {
        if (!editUser) return;

        if (!editName.trim()) {
            toast.error("Full name is required");
            return;
        }

        if (!editUsername.trim()) {
            toast.error("Username is required");
            return;
        }

        try {
            setSaving(true);
            const API_URL = getApiUrl();

            const response = await fetch(`${API_URL}/user/update/${editUser.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fullName: editName.trim(),
                    username: editUsername.trim()
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                toast.error(data.message || "Failed to update user");
                return;
            }

            toast.success(data.message || "User updated successfully");
            closeEditPopup();
            await fetchAllUsers();
        } catch (error) {
            console.error(error);
            toast.error("Server error while updating user");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!deleteUser) return;

        try {
            setDeleting(true);
            const API_URL = getApiUrl();

            const response = await fetch(`${API_URL}/user/delete/${deleteUser.id}`, {
                method: "DELETE"
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                toast.error(data.message || "Failed to delete user");
                return;
            }

            toast.success(data.message || "User deleted successfully");
            setDeleteUser(null);
            await fetchAllUsers();
        } catch (error) {
            console.error(error);
            toast.error("Server error while deleting user");
        } finally {
            setDeleting(false);
        }
    };

    useEffect(() => {
        const initLoad = async () => {
            await fetchLiveDepartments();
            await fetchAllUsers();
        };

        initLoad();
    }, []);

    useEffect(() => {
        if (allUsers.length === 0) {
            setFilteredData([]);
            return;
        }

        const filtered = allUsers.filter((user: any) => {
            if (activeTab === "admin") return isAdminRole(user.role);
            if (activeTab === "head") return isHeadRole(user.role);
            return !isAdminRole(user.role) && !isHeadRole(user.role);
        });

        const formatted = filtered.map((user: any) => {
            let displayDate = "18/05/2026";

            if (user.joined_date) {
                const parsedDate = new Date(user.joined_date);
                if (!isNaN(parsedDate.getTime())) {
                    displayDate = parsedDate.toLocaleDateString("en-GB");
                }
            }

            let roleDisplay = String(user.role || "user").toUpperCase();

            if (roleDisplay === "HEAD1029" || roleDisplay === "DEPARTMENT MAIN") {
                const deptName = deptMap[user.department_id] || "General";
                roleDisplay = `${deptName} Head`;
            }

            return {
                id: user.id,
                img: user.profile_image_url || null,
                name: user.full_name || "-",
                role: roleDisplay,
                dept: user.username || "-",
                date: displayDate,
                status: "Active"
            };
        });

        setFilteredData(formatted);
    }, [allUsers, activeTab, deptMap]);

    return (
        <div className="w-full min-h-screen bg-gray-50/30 p-4 sm:p-6 lg:p-10 select-none flex flex-col gap-6">
            <div className="w-full bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-left">
                    <h1 className="text-2xl sm:text-3xl font-black text-red-950 uppercase tracking-tight flex items-center gap-3">
                        <span className="p-2.5 bg-red-50 text-red-800 rounded-2xl shadow-inner">
                            <FaUsers size={24} />
                        </span>
                        Gurukul Sevak Matrix
                    </h1>
                    <p className="text-gray-400 text-xs sm:text-sm font-semibold mt-1">
                        View and manage categorized lists of Administration, Department Heads, and Users.
                    </p>
                </div>
                <div className="h-1.5 w-12 bg-red-800 rounded-full hidden sm:block" />
            </div>

            <div className="w-full flex bg-white p-1.5 border border-gray-100 shadow-sm rounded-2xl gap-2 self-center sm:self-start max-w-lg">
                <button
                    onClick={() => setActiveTab("admin")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${activeTab === "admin"
                            ? "bg-red-800 text-white shadow-md shadow-red-800/10"
                            : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                >
                    <FaUserShield size={14} /> Admin ({allUsers.filter((user) => isAdminRole(user.role)).length})
                </button>

                <button
                    onClick={() => setActiveTab("head")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${activeTab === "head"
                            ? "bg-red-800 text-white shadow-md shadow-red-800/10"
                            : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                >
                    <FaUserTie size={14} /> Heads ({allUsers.filter((user) => isHeadRole(user.role)).length})
                </button>

                <button
                    onClick={() => setActiveTab("user")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${activeTab === "user"
                            ? "bg-red-800 text-white shadow-md shadow-red-800/10"
                            : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                >
                    <FaUserGraduate size={14} /> Users (
                    {allUsers.filter((user) => !isAdminRole(user.role) && !isHeadRole(user.role)).length})
                </button>
            </div>

            <div className="w-full bg-white rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.025)] border border-gray-100 min-h-87.5 flex flex-col justify-center overflow-visible p-2">
                {loading ? (
                    <div className="flex flex-col items-center gap-3 text-gray-400 font-bold animate-pulse py-20">
                        <div className="w-9 h-9 border-4 border-red-800 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs uppercase tracking-wider text-red-900/60">Loading Matrix...</span>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="text-gray-400 font-bold py-20 text-center uppercase text-xs tracking-wider">
                        No active profiles registered under this category.
                    </div>
                ) : (
                    <div className="w-full overflow-visible pb-24">
                        <DataExplorer
                            headers={userHeaders}
                            data={filteredData}
                            onView={(_, item) => setViewUser(item)}
                            onEdit={(_, item) => openEditPopup(item)}
                            onDelete={(id) => {
                                const selectedUser = filteredData.find((user) => String(user.id) === String(id));

                                if (selectedUser) {
                                    setDeleteUser(selectedUser);
                                } else {
                                    toast.error("User not found");
                                }
                            }}
                        />
                    </div>
                )}
            </div>

            {viewUser && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="w-10 h-10 rounded-2xl bg-red-50 text-red-800 flex items-center justify-center">
                                    <FaEye size={16} />
                                </span>
                                <div>
                                    <h2 className="text-lg font-black text-red-950 uppercase">User Details</h2>
                                    <p className="text-xs text-gray-400 font-semibold">Profile information</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setViewUser(null)}
                                className="w-9 h-9 rounded-xl bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-800 flex items-center justify-center cursor-pointer"
                            >
                                <FaTimes size={14} />
                            </button>
                        </div>

                        <div className="p-6 flex flex-col items-center text-center">
                            {viewUser.img ? (
                                <img
                                    src={viewUser.img}
                                    alt={viewUser.name}
                                    className="w-24 h-24 rounded-3xl object-cover border border-gray-100 shadow-sm"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-3xl bg-red-50 text-red-800 flex items-center justify-center font-black text-3xl">
                                    {viewUser.name.charAt(0).toUpperCase()}
                                </div>
                            )}

                            <h3 className="mt-4 text-xl font-black text-gray-900">{viewUser.name}</h3>
                            <p className="text-sm font-bold text-red-800 mt-1">{viewUser.role}</p>

                            <div className="w-full mt-6 grid grid-cols-1 gap-3 text-left">
                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <p className="text-xs font-black text-gray-400 uppercase">Username</p>
                                    <p className="text-sm font-bold text-gray-800 mt-1">{viewUser.dept}</p>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <p className="text-xs font-black text-gray-400 uppercase">Joined Date</p>
                                    <p className="text-sm font-bold text-gray-800 mt-1">{viewUser.date}</p>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <p className="text-xs font-black text-gray-400 uppercase">Status</p>
                                    <p className="text-sm font-bold text-green-700 mt-1">{viewUser.status}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {editUser && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-black text-red-950 uppercase">Edit User</h2>
                                <p className="text-xs text-gray-400 font-semibold">Only name and username can be changed</p>
                            </div>

                            <button
                                onClick={closeEditPopup}
                                className="w-9 h-9 rounded-xl bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-800 flex items-center justify-center cursor-pointer"
                            >
                                <FaTimes size={14} />
                            </button>
                        </div>

                        <div className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase mb-2">
                                    Full Name
                                </label>
                                <input
                                    value={editName}
                                    onChange={(event) => setEditName(event.target.value)}
                                    className="w-full h-12 rounded-2xl border border-gray-200 px-4 text-sm font-bold text-gray-800 outline-none focus:border-red-800 focus:ring-4 focus:ring-red-50"
                                    placeholder="Enter full name"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase mb-2">
                                    Username
                                </label>
                                <input
                                    value={editUsername}
                                    onChange={(event) => setEditUsername(event.target.value)}
                                    className="w-full h-12 rounded-2xl border border-gray-200 px-4 text-sm font-bold text-gray-800 outline-none focus:border-red-800 focus:ring-4 focus:ring-red-50"
                                    placeholder="Enter username"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={closeEditPopup}
                                    disabled={saving}
                                    className="flex-1 h-12 rounded-2xl bg-gray-100 text-gray-600 font-black text-xs uppercase cursor-pointer disabled:opacity-60"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleUpdateUser}
                                    disabled={saving}
                                    className="flex-1 h-12 rounded-2xl bg-red-800 text-white font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                                >
                                    <FaSave size={13} />
                                    {saving ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {deleteUser && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                        <div className="p-6 text-center">
                            <div className="mx-auto w-16 h-16 rounded-3xl bg-red-50 text-red-800 flex items-center justify-center">
                                <FaTrash size={22} />
                            </div>

                            <h2 className="mt-5 text-xl font-black text-red-950 uppercase">Delete User?</h2>
                            <p className="mt-2 text-sm text-gray-500 font-semibold">
                                Are you sure you want to delete <span className="text-gray-900 font-black">{deleteUser.name}</span>?
                            </p>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => setDeleteUser(null)}
                                    disabled={deleting}
                                    className="flex-1 h-12 rounded-2xl bg-gray-100 text-gray-600 font-black text-xs uppercase cursor-pointer disabled:opacity-60"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleDeleteUser}
                                    disabled={deleting}
                                    className="flex-1 h-12 rounded-2xl bg-red-800 text-white font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                                >
                                    <FaTrash size={13} />
                                    {deleting ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}