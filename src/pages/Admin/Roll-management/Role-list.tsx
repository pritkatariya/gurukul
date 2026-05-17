import { useState, useEffect } from "react";
import DataExplorer from "../../../Components/commen/DataExplorer.tsx";
import { toast } from "sonner";

interface RoleType {
  name: string;
  level: string;
  users: string;
  date: string;
  status: string;
}

export default function RoleList() {
  const [roleData, setRoleData] = useState<RoleType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ૧. રોલ પેજ માટેના હેડર્સ
  const roleHeaders = [
    "Role Name",
    "Access Level",
    "Assigned Users",
    "Created Date",
    "Status"
  ];

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        if (API_URL.endsWith('/')) {
          API_URL = API_URL.slice(0, -1);
        }

        const response = await fetch(`${API_URL}/roll/alldata`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch roles: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.roles) {
          // ડેટાબેઝના ડેટાને ટેબલ ફોર્મેટ પ્રમાણે ગોઠવ્યો
          const formattedRoles = data.roles.map((role: any) => {
            // પર્મિશન ઓબ્જેક્ટના આધારે એક્સેસ લેવલ ડિસ્પ્લે કરાવીશું
            const perms = typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions;
            let accessLevel = "Custom Access Configured";
            
            if (perms?.department?.create && perms?.role?.create && perms?.user?.create) {
              accessLevel = "Full System Access (All Modules)";
            } else if (!perms?.department?.create && !perms?.role?.create && !perms?.user?.create) {
              accessLevel = "View Only Access";
            }

            return {
              name: role.role_name,
              level: `${accessLevel} (${role.role_code})`,
              users: "00 Users",
              date: role.created_date || "N/A",
              status: "Active"
            };
          });

          setRoleData(formattedRoles);
        } else {
          toast.error("Failed to load roles from database");
        }
      } catch (error) {
        console.error("Fetch Roles Error:", error);
        toast.error("Database Server is offline or unreachable");
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-50/50 flex flex-col items-center p-6 sm:p-10">
      
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-red-950 uppercase tracking-tight">
          System Roles & Permissions
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {loading 
            ? "Loading configured system roles..." 
            : `Configure access levels and view assigned users for the ${roleData.length} core roles`
          }
        </p>
        <div className="h-1.5 w-16 bg-red-800 mx-auto mt-3 rounded-full" />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-6xl bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex justify-center items-center min-h-50">
        {loading ? (
          <div className="flex flex-col items-center gap-2 text-gray-500 font-semibold animate-pulse py-10">
            <div className="w-8 h-8 border-4 border-red-800 border-t-transparent rounded-full animate-spin"></div>
            Loading Roles from Cloud...
          </div>
        ) : roleData.length === 0 ? (
          <div className="text-gray-400 font-semibold py-10">No roles found in the database.</div>
        ) : (
          <DataExplorer headers={roleHeaders} data={roleData} />
        )}
      </div>

    </div>
  );
}