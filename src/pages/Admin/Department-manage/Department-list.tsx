// ફાઈલ એક્સ્ટેન્શન (.tsx) કાઢી નાખ્યું અને સાચું સ્પેલિંગ common કર્યું
import DataExplorer from "../../../Components/commen/DataExplorer.tsx";

export default function DepartmentList() {
  // ૧. ટેબલ માટેના હેડર્સ
  const departmentHeaders = [
    "Department Name",
    "HOD / Head",
    "Total Sevaks",
    "Floor / Location",
    "Status"
  ];

  // ૨. સ્ટેટિક ડેટા
  const departmentData = [
    { name: "Kitchen & Rasoi (रसोई)", head: "Swami Bhaktipriya Das", sevaks: "24 Active", location: "Ground Floor - Block A", status: "Active" },
    { name: "Gau Shala Management", head: "Shastri Hariswarup Das", sevaks: "12 Active", location: "Backyard Campus", status: "Active" },
    { name: "IT & Media Cell", head: "Nirmal Bhai Patel", sevaks: "06 Active", location: "2nd Floor - Admin Wing", status: "Active" },
    { name: "Sanskrit Pathshala", head: "Acharya Ramkrishna Jha", sevaks: "15 Active", location: "1st Floor - Temple Block", status: "Active" },
    { name: "Accounts & Puja Vidhi", head: "Swami Kirtanpriya Das", sevaks: "04 Active", location: "Ground Floor - Office", status: "Active" },
    { name: "Security & Transport", head: "Baldevsinh Jadeja", sevaks: "18 Active", location: "Main Gate Complex", status: "Active" },
    { name: "Hostel Administration", head: "Swami Vishwaprakas Das", sevaks: "20 Active", location: "Student Residential Wing", status: "Active" },
    { name: "Medical & First Aid", head: "Dr. Arvind Bhai Shah", sevaks: "05 Active", location: "Ground Floor - Clinic", status: "Active" },
    { name: "Library & Publication", head: "Shastri Mukundcharan Das", sevaks: "08 Active", location: "3rd Floor - Library Hall", status: "Active" },
    { name: "Store & Inventory", head: "Ghanshyam Bhai Bhagat", sevaks: "07 Active", location: "Basement - Warehouse", status: "Active" }
  ];

  return (
    // બેકગ્રાઉન્ડ કલર અને મિનિમમ હાઇટ સેટ કરી જેથી પેજ અધૂરું ન લાગે
    <div className="w-full min-h-screen bg-gray-50/50 flex flex-col items-center p-6 sm:p-10">
      
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-red-950 uppercase tracking-tight">
          Your All Departments
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage Gurukul departments with custom access roles and responsibilities
        </p>
        <div className="h-1.5 w-16 bg-red-800 mx-auto mt-3 rounded-full" />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-6xl bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <DataExplorer headers={departmentHeaders} data={departmentData} />
      </div>

    </div>
  );
}