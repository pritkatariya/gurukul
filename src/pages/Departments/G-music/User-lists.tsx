import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FaUsers, FaUserPlus, FaCheckCircle, FaClock, FaUserCheck } from "react-icons/fa";
import DataExplorer from "../../../Components/commen/DataExplorer.tsx";

interface SeekerRequestType {
  id: string | number;
  img: string | null;
  name: string;
  role: string;      
  dept: string | number;      
  date: string;      
  status: string;    
  suid: string;      
  performance: string; 
  isCreated: boolean;
}

interface OnboardedUserType {
  id: string | number;
  name: string;
  username: string;
  image_url: string | null;
  department_id: string | number;
  joined_date: string;
}

export default function StudentListGMusic() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const currentDeptId = Number(searchParams.get("dept_id")) || 1;

  const [requests, setRequests] = useState<SeekerRequestType[]>([]);
  const [onboardedStudents, setOnboardedStudents] = useState<OnboardedUserType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"Approved" | "Pending">("Approved");

  const headers = ["Profile", "Sevak Name", "Performance", "SUID / Code", "Request Date", "Status"];

  const isGMusic = currentDeptId === 1;
  const departmentName = isGMusic ? "G-Music" : "Gurukul Art";
  const apiRoutePrefix = isGMusic ? "g-music" : "gurukul-art";

  const fetchDepartmentData = async () => {
    try {
      setLoading(true);
      let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      if (API_URL.endsWith('/')) API_URL = API_URL.slice(0, -1);

      const resReq = await fetch(`${API_URL}/${apiRoutePrefix}/admit-list`);
      let formattedRequests: SeekerRequestType[] = [];

      if (resReq.ok) {
        const data = await resReq.json();
        if (data.success && data.requests) {
          formattedRequests = data.requests.map((req: any) => ({
            id: req.id,
            img: req.image_url || null,
            name: req.name,
            role: `${req.performance.toUpperCase()} Perf.`,
            dept: req.department_id,
            date: req.created_at ? new Date(req.created_at).toLocaleDateString('en-GB') : "18/05/2026",
            status: req.status, 
            suid: req.suid,
            performance: req.performance,
            isCreated: req.is_user_created || false
          }));
        }
      }

      const resUsers = await fetch(`${API_URL}/${apiRoutePrefix}/onboarded-users`);
      let liveUsers: OnboardedUserType[] = [];

      if (resUsers.ok) {
        const dataUsers = await resUsers.json();
        if (dataUsers.success && dataUsers.users) {
          liveUsers = dataUsers.users;
          setOnboardedStudents(dataUsers.users);
        }
      }

      const cleanRequests = formattedRequests.filter((req) => {
        const alreadyOnboarded = liveUsers.some(
          (user) => String(user.username).trim() === String(req.suid).trim()
        );
        return !alreadyOnboarded;
      });

      setRequests(cleanRequests);

    } catch (error) {
      console.error(error);
      toast.error(`${departmentName} નો ડેટા લોડ કરવામાં કોઈ સમસ્યા આવી.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentData();
  }, [currentDeptId]);

  const filteredRequests = requests.filter(
    (req) => req.status.toLowerCase() === activeTab.toLowerCase()
  );

  return (
    <div className="w-full min-h-screen bg-gray-50/30 p-2 sm:p-6 lg:p-10 select-none flex flex-col gap-6">

      <div className="w-full bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-red-950 uppercase tracking-tight flex items-center gap-2 sm:gap-3">
            <span className="p-2 bg-red-50 text-red-800 rounded-xl sm:rounded-2xl shadow-inner"><FaUsers size={20} /></span>
            {departmentName} Admission Control Panel
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm font-semibold mt-1">
            Realtime database request configurations and onboarding dashboard for {departmentName}.
          </p>
        </div>
      </div>

      <div className="flex flex-row items-center gap-2 bg-gray-100/80 p-1.5 rounded-2xl w-full sm:w-fit border border-gray-200/50 overflow-x-auto">
        <button
          onClick={() => setActiveTab("Approved")}
          className={`flex-1 sm:flex-none text-center justify-center px-4 sm:px-6 py-2.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "Approved" ? "bg-white text-emerald-800 shadow-sm border border-emerald-100" : "text-gray-500"
          }`}
        >
          <FaCheckCircle size={12} /> Approved ({requests.filter(r => r.status.toLowerCase() === "approved").length})
        </button>
        <button
          onClick={() => setActiveTab("Pending")}
          className={`flex-1 sm:flex-none text-center justify-center px-4 sm:px-6 py-2.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "Pending" ? "bg-white text-amber-800 shadow-sm border border-amber-100" : "text-gray-500"
          }`}
        >
          <FaClock size={12} /> Pending ({requests.filter(r => r.status.toLowerCase() === "pending").length})
        </button>
      </div>

      <div className="w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-3 sm:p-5 flex flex-col">
        {loading ? (
          <div className="flex flex-col items-center gap-3 text-gray-400 font-bold py-24 justify-center">
            <div className="w-8 h-8 border-4 border-red-800 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[11px] uppercase tracking-wider text-red-950/50">Fetching {departmentName} Records...</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-gray-400 font-bold py-24 text-center uppercase text-xs tracking-wider">
            No dynamic {activeTab.toLowerCase()} entries found for {departmentName}.
          </div>
        ) : (
          <div className="w-full">
            
            <div className="hidden lg:block overflow-visible rounded-2xl border border-gray-100 bg-white mb-6">
              <DataExplorer
                headers={headers}
                data={filteredRequests}
                onView={() => {}}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </div>

            <div className="p-2 sm:p-4 bg-red-50/10 border border-red-100/50 rounded-2xl mb-6">
              <h3 className="text-xs font-black text-red-950 uppercase tracking-wider mb-4 pl-1">
                Live Onboarding Logs Panel ({activeTab})
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRequests.map((req) => (
                  <div key={req.id} className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    
                    <div className="flex items-center gap-3">
                      {req.img ? (
                        <img src={req.img} alt="profile" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-red-800 text-white flex items-center justify-center font-black text-xs">
                          {req.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-black text-gray-800 uppercase">{req.name}</h4>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">SUID: {req.suid} | {req.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                      {req.status.toLowerCase() === "approved" ? (
                        <>
                          <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border border-emerald-100">
                            Approved
                          </span>
                          <button
                            onClick={() => navigate(`/deshbord/new-user-create?dept_id=${currentDeptId}&name=${encodeURIComponent(req.name)}&suid=${encodeURIComponent(req.suid)}`)}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1 bg-red-800 hover:bg-red-900 text-white text-[10px] font-black px-3 py-2 rounded-lg transition-all shadow-sm cursor-pointer"
                          >
                            <FaUserPlus size={11} /> CREATE STUDENT
                          </button>
                        </>
                      ) : (
                        <span className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black px-4 py-2 rounded-lg">
                          ⏳ PENDING REVIEW
                        </span>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      <div className="w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-xl"><FaUserCheck size={16} /></span>
          <h2 className="text-sm sm:text-base font-black text-gray-800 uppercase tracking-wider">
            {departmentName} Created Students List ({onboardedStudents.length})
          </h2>
        </div>
        
        {onboardedStudents.length === 0 ? (
          <div className="text-center text-gray-400 font-bold py-8 text-xs uppercase tracking-wider border border-dashed border-gray-200 rounded-2xl">
            No active onboarding users registered yet in {departmentName}.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {onboardedStudents.map((student) => (
              <div key={student.id} className="flex items-center gap-3 p-3 bg-emerald-50/20 border border-emerald-100/50 rounded-2xl">
                {student.image_url ? (
                  <img src={student.image_url} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-emerald-200" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-black text-xs">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-black text-gray-800 uppercase tracking-tight">{student.name}</h4>
                  <p className="text-[10px] text-gray-400 font-bold">User: {student.username} | Joined: {student.joined_date ? new Date(student.joined_date).toLocaleDateString('en-GB') : ""}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}