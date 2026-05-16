import DataExplorer from "../../../Components/commen/DataExplorer.tsx";

export default function RoleList() {
  // ૧. રોલ પેજ માટેના હેડર્સ
  const roleHeaders = [
    "Role Name",
    "Access Level",
    "Assigned Users",
    "Created Date",
    "Status"
  ];

  // ૨. માત્ર ૪ મુખ્ય રોલ્સનો પરફેક્ટ ડેટા
  const roleData = [
    { 
      name: "Super Admin", 
      level: "Full System Access (All Modules)", 
      users: "02 Users", 
      date: "12/04/2024", 
      status: "Active" 
    },
    { 
      name: "Admin", 
      level: "Manage Users & View Reports", 
      users: "05 Users", 
      date: "15/04/2024", 
      status: "Active" 
    },
    { 
      name: "Department Head", 
      level: "Department Wise Read/Write Access", 
      users: "12 Users", 
      date: "18/04/2024", 
      status: "Active" 
    },
    { 
      name: "User / Sevak", 
      level: "View Only / Personal Profile Access", 
      users: "150+ Users", 
      date: "20/04/2024", 
      status: "Active" 
    }
  ];

  return (
    <div className="w-full min-h-screen bg-gray-50/50 flex flex-col items-center p-6 sm:p-10">
      
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-red-950 uppercase tracking-tight">
          System Roles & Permissions
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Configure access levels and view assigned users for the 4 core roles
        </p>
        <div className="h-1.5 w-16 bg-red-800 mx-auto mt-3 rounded-full" />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-6xl bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <DataExplorer headers={roleHeaders} data={roleData} />
      </div>

    </div>
  );
}