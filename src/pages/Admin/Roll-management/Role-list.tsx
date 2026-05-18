import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FaUserShield } from "react-icons/fa";
import DataExplorer from "../../../Components/commen/DataExplorer.tsx";
import { handleUserView } from "../../../Action/Users/view";
import { handleUserEdit } from "../../../Action/Users/edit";
import { handleUserDelete } from "../../../Action/Users/delete";

interface RoleType {
  id: string | number;
  img: string | null;
  name: string;
  role: string;
  dept: string;
  date: string;
  status: string;
}

export default function RoleList() {
  const [roleData, setRoleData] = useState<RoleType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const roleHeaders = [
    "Profile",
    "Role Name",
    "Access Level",
    "Role Code",
    "Created Date",
    "Status"
  ];

  const fetchRoles = async () => {
    try {
      setLoading(true);
      let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      if (API_URL.endsWith('/')) {
        API_URL = API_URL.slice(0, -1);
      }

      const response = await fetch(`${API_URL}/auth/role/alldata`);
      if (!response.ok) throw new Error(`Failed to fetch roles`);
      const data = await response.json();

      if (data.success && data.roles) {
        const formattedRoles = data.roles.map((role: any) => {
          const perms = typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions;
          let accessLevel = "Custom Access Configured";
          
          if (perms?.role?.create && perms?.role?.view && perms?.user?.create && perms?.user?.view) {
            accessLevel = "Full System Access";
          } else if (!perms?.role?.create && !perms?.role?.view && !perms?.user?.create && !perms?.user?.view) {
            accessLevel = "View Only Access";
          }

          return {
            id: role.id || role.role_code,
            img: null,
            name: role.role_name,
            role: accessLevel,
            dept: role.role_code,
            date: role.created_date || "18/05/2026",
            status: "Active"
          };
        });

        setRoleData(formattedRoles);
      } else {
        toast.error("Failed to load roles from database");
      }
    } catch (error) {
      console.error(error);
      toast.error("Database Server is offline or unreachable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-50/30 p-4 sm:p-6 lg:p-10 select-none flex flex-col gap-6">
      
      <div className="w-full bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-left">
          <h1 className="text-2xl sm:text-3xl font-black text-red-950 uppercase tracking-tight flex items-center gap-3">
            <span className="p-2.5 bg-red-50 text-red-800 rounded-2xl shadow-inner"><FaUserShield size={24} /></span>
            Roles & Permissions
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm font-semibold mt-1">
            Manage access levels, configurations and view assignments for core active roles.
          </p>
        </div>
        <div className="h-1.5 w-12 bg-red-800 rounded-full hidden sm:block" />
      </div>

      <div className="w-full bg-white rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.025)] border border-gray-100 min-h-87.5 flex flex-col justify-center overflow-visible p-2">
        {loading ? (
          <div className="flex flex-col items-center gap-3 text-gray-400 font-bold animate-pulse py-20">
            <div className="w-9 h-9 border-4 border-red-800 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs uppercase tracking-wider text-red-900/60">Loading Database...</span>
          </div>
        ) : roleData.length === 0 ? (
          <div className="text-gray-400 font-bold py-20 text-center uppercase text-xs tracking-wider">
            No system roles found in the database.
          </div>
        ) : (
          <div className="w-full overflow-visible pb-24">
            <DataExplorer 
              headers={roleHeaders} 
              data={roleData} 
              onView={(id, item) => handleUserView(id, item)}
              onEdit={(id, item) => handleUserEdit(id, item)}
              onDelete={(id) => handleUserDelete(id, fetchRoles)}
            />
          </div>
        )}
      </div>

    </div>
  );
}