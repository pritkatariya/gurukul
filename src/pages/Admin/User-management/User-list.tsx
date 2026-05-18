import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FaUsers, FaUserShield, FaUserTie, FaUserGraduate } from "react-icons/fa";
import DataExplorer from "../../../Components/commen/DataExplorer.tsx";
import { handleUserView } from "../../../Action/Users/view";
import { handleUserEdit } from "../../../Action/Users/edit";
import { handleUserDelete } from "../../../Action/Users/delete";

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

  const userHeaders = [
    "Profile",
    "Full Name",
    "Role / Position",
    "Username",
    "Joined Date",
    "Status"
  ];

  const fetchLiveDepartments = async () => {
    try {
      let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      if (API_URL.endsWith('/')) API_URL = API_URL.slice(0, -1);

      const response = await fetch(`${API_URL}/auth/departments`);
      const data = await response.json();
      if (data.success && data.departments) {
        const mapping: { [key: number]: string } = {};
        data.departments.forEach((d: any) => {
          mapping[d.id] = d.name;
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
      let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      if (API_URL.endsWith('/')) API_URL = API_URL.slice(0, -1);

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
      const roleCode = String(user.role).trim().toLowerCase();
      if (activeTab === "admin") {
        return roleCode === "admin" || roleCode === "super_admin" || roleCode === "super-admin";
      } else if (activeTab === "head") {
        return roleCode === "head1029" || roleCode === "department main";
      } else {
        return roleCode === "user" || (roleCode !== "admin" && roleCode !== "super_admin" && roleCode !== "super-admin" && roleCode !== "head1029" && roleCode !== "department main");
      }
    });

    const formatted = filtered.map((user: any) => {
      let displayDate = "18/05/2026";
      if (user.joined_date) {
        const parsedDate = new Date(user.joined_date);
        if (!isNaN(parsedDate.getTime())) {
          displayDate = parsedDate.toLocaleDateString('en-GB');
        }
      }

      let roleDisplay = String(user.role).toUpperCase();
      if (roleDisplay === "HEAD1029" || roleDisplay === "DEPARTMENT MAIN") {
        const deptName = deptMap[user.department_id] || "General";
        roleDisplay = `${deptName} Head`;
      }

      return {
        id: user.id,
        img: user.profile_image_url || null,
        name: user.full_name,
        role: roleDisplay,
        dept: user.username,
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
            <span className="p-2.5 bg-red-50 text-red-800 rounded-2xl shadow-inner"><FaUsers size={24} /></span>
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
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            activeTab === "admin"
              ? "bg-red-800 text-white shadow-md shadow-red-800/10"
              : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <FaUserShield size={14} /> Admin ({allUsers.filter(u => ["admin", "super_admin", "super-admin"].includes(String(u.role).trim().toLowerCase())).length})
        </button>

        <button
          onClick={() => setActiveTab("head")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            activeTab === "head"
              ? "bg-red-800 text-white shadow-md shadow-red-800/10"
              : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <FaUserTie size={14} /> Heads ({allUsers.filter(u => ["head1029", "department main"].includes(String(u.role).trim().toLowerCase())).length})
        </button>

        <button
          onClick={() => setActiveTab("user")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
            activeTab === "user"
              ? "bg-red-800 text-white shadow-md shadow-red-800/10"
              : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          <FaUserGraduate size={14} /> Users ({allUsers.filter(u => !["admin", "super_admin", "super-admin", "head1029", "department main"].includes(String(u.role).trim().toLowerCase())).length})
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
              onView={(id, item) => handleUserView(id, item)}
              onEdit={(id, item) => handleUserEdit(id, item)}
              onDelete={(id) => handleUserDelete(id, fetchAllUsers)}
            />
          </div>
        )}
      </div>

    </div>
  );
}