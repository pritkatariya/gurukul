import { useState } from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  FaBuilding, 
  FaChartLine, 
  FaArrowUp, 
  FaCalendarCheck,
  FaUserAlt,
  FaGraduationCap,
  FaHashtag,
  FaClock,
  FaAward,
  FaChartBar,
  FaSignOutAlt
} from "react-icons/fa";

const userWeeklyData = [
  { day: "Mon", Seva: 20 },
  { day: "Tue", Seva: 40 },
  { day: "Wed", Seva: 35 },
  { day: "Thu", Seva: 65 },
  { day: "Fri", Seva: 50 },
  { day: "Sat", Seva: 85 },
  { day: "Sun", Seva: 90 },
];

const userMonthlyData = [
  { month: "Jan", SevaProgress: 30 },
  { month: "Feb", SevaProgress: 45 },
  { month: "Mar", SevaProgress: 60 },
  { month: "Apr", SevaProgress: 55 },
  { month: "May", SevaProgress: 78 },
];

export default function Deshbord() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("user_role") || "USER1029";
  const userRaw = localStorage.getItem("user");
  
  // 💡 લોકલ સ્ટોરેજમાંથી બધો જ ડેટા લોડ થશે (profile_image_url સાથે)
  const userData = userRaw ? JSON.parse(userRaw) : { 
    full_name: "Gurukul Sevak", 
    std: "12th", 
    roll_number: "00", 
    department: "General",
    profile_image_url: null 
  };

  const handleLogout = () => {
    localStorage.clear(); // લોગઆઉટ વખતે આખો લોકલ સ્ટોરેજ ડેટા ડીલીટ થશે
    toast.success("Logged out successfully! 👋");
    navigate("/");
  };

  const weeklyOptions: ApexOptions = {
    chart: { type: 'line', height: 200, toolbar: { show: false }, animations: { enabled: false } },
    stroke: { curve: 'smooth', width: 3, colors: ['#b91c1c'] },
    markers: { size: 4, colors: ['#fff'], strokeColors: '#b91c1c', strokeWidth: 2 },
    grid: { borderColor: '#f1f5f9', xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: userWeeklyData.map(d => d.day),
      labels: { style: { colors: '#94a3b8', fontSize: '11px', fontWeight: 600 } },
      axisBorder: { show: false }, axisTicks: { show: false }
    },
    yaxis: { labels: { style: { colors: '#94a3b8', fontSize: '11px' } } },
    tooltip: { theme: 'light' }
  };

  const monthlyOptions: ApexOptions = {
    chart: { type: 'line', height: 200, toolbar: { show: false }, animations: { enabled: false } },
    stroke: { curve: 'smooth', width: 3, colors: ['#991b1b'] },
    markers: { size: 4, colors: ['#fff'], strokeColors: '#991b1b', strokeWidth: 2 },
    grid: { borderColor: '#f1f5f9', xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: userMonthlyData.map(d => d.month),
      labels: { style: { colors: '#94a3b8', fontSize: '11px', fontWeight: 600 } },
      axisBorder: { show: false }, axisTicks: { show: false }
    },
    yaxis: { labels: { style: { colors: '#94a3b8', fontSize: '11px' } } },
    tooltip: { theme: 'light' }
  };

  const [weeklySeries] = useState([{ name: "Seva Progress", data: userWeeklyData.map(d => d.Seva) }]);
  const [monthlySeries] = useState([{ name: "Monthly Growth", data: userMonthlyData.map(d => d.SevaProgress) }]);

  return (
    <div className="w-full min-h-screen bg-gray-50/50 p-4 md:p-8 select-none">
      
      {/* હેડર સેક્શન */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-red-950 uppercase tracking-tight">Sevak Portal</h1>
          <p className="text-gray-500 text-sm mt-1">જય સ્વામિનારાયણ, જય ગુરુકુળ! અહીં તમારી સેવાઓનો સાપ્તાહિક અને માસિક ગ્રોથ ટ્રેક થઈ રહ્યો છે.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white border border-red-100 shadow-sm px-4 py-2 rounded-2xl text-sm font-bold text-gray-700">
            <FaCalendarCheck className="text-red-800" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-800 border border-red-100 px-4 py-2 rounded-2xl text-sm font-black uppercase tracking-wider transition-all duration-200 active:scale-95"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </div>

      <div className="w-full flex flex-col lg:flex-row gap-8 items-start">
        
        {/* 👤 સેવક પ્રોફાઇલ કાર્ડ */}
        <div className="w-full lg:w-[320px] bg-white border border-red-100 rounded-[2.5rem] p-6 shadow-md shadow-red-950/5 flex flex-col items-center text-center relative overflow-hidden shrink-0">
          
          <div className="w-full h-44 relative mb-4 flex justify-center items-center rounded-3xl bg-linear-to-br from-red-900 via-red-950 to-stone-950 shadow-inner border border-red-900/50">
            
            {/* ગ્લાસી પ્રોફાઇલ પિક્ચર કન્ટેનર */}
            <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md flex justify-center items-center text-3xl text-white z-10 relative select-none shrink-0 grow-0 border-b border-r border-black/30 border-t-2 border-l-2 shadow-[12px_12px_24px_rgba(0,0,0,0.5)] overflow-hidden">
              {userData.profile_image_url ? (
                <img 
                  src={userData.profile_image_url} 
                  alt={userData.full_name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]">
                  <FaUserAlt />
                </div>
              )}
              
              <div className="absolute top-1 left-3 w-1/2 h-2.5 bg-white/20 rounded-full blur-[0.5px]" />
            </div>
          </div>
          
          <h2 className="text-xl font-black text-red-950 uppercase tracking-tight">{userData.full_name}</h2>
          <p className="bg-red-800 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full mt-1.5 tracking-widest">{userRole}</p>

          {/* ડાયનેમિક ડેટા ડિસ્પ્લે */}
          <div className="w-full border-t border-gray-100 my-5 pt-4 space-y-3 text-left">
            <div className="flex items-center gap-4 text-slate-700">
              <FaBuilding className="text-red-800 text-lg shrink-0" />
              <div><p className="text-[10px] font-bold text-gray-400 uppercase">Department</p><p className="text-sm font-black">{userData.department}</p></div>
            </div>
            <div className="flex items-center gap-4 text-slate-700">
              <FaGraduationCap className="text-red-800 text-lg shrink-0" />
              <div><p className="text-[10px] font-bold text-gray-400 uppercase">Standard (STD)</p><p className="text-sm font-black">{userData.std || "Main"}</p></div>
            </div>
            <div className="flex items-center gap-4 text-slate-700">
              <FaHashtag className="text-red-800 text-lg shrink-0" />
              <div><p className="text-[10px] font-bold text-gray-400 uppercase">SUID / Roll No</p><p className="text-sm font-black">{userData.roll_number || "00"}</p></div>
            </div>
          </div>

          <div className="w-full bg-red-50/40 border border-red-100/50 rounded-2xl p-4 flex items-center justify-between">
            <div className="text-left">
              <p className="text-xs font-black text-red-950 flex items-center gap-1.5"><FaAward className="text-amber-500" /> Seva Score</p>
              <p className="text-[10px] font-bold text-gray-400 mt-0.5">Top Performer of the week</p>
            </div>
            <div className="relative w-12 h-12 flex justify-center items-center font-black text-xs text-red-950">
              <svg className="absolute w-full h-full -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="#fecdd3" strokeWidth="4" fill="transparent" />
                <circle cx="24" cy="24" r="20" stroke="#991b1b" strokeWidth="4" fill="transparent" strokeDasharray={125} strokeDashoffset={125 - (125 * 78) / 100} />
              </svg>
              <span>78%</span>
            </div>
          </div>
        </div>

        {/* 📈 આલેખ સેક્શન */}
        <div className="flex-1 w-full flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-white border border-red-100 rounded-4xl p-5 shadow-sm flex flex-col">
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-black text-red-950 uppercase tracking-tight flex items-center gap-2"><FaChartBar className="text-red-800" /> My Weekly Growth</h2>
                  <p className="text-gray-400 text-[11px] font-medium">Daily analysis from Monday to Sunday</p>
                </div>
                <span className="bg-amber-50 text-amber-700 font-bold text-[10px] px-2 py-0.5 rounded-full">Weekend Peak</span>
              </div>
              <div className="w-full h-48 mt-2 overflow-hidden">
                <ReactApexChart options={weeklyOptions} series={weeklySeries} type="line" height={190} />
              </div>
            </div>

            <div className="bg-white border border-red-100 rounded-4xl p-5 shadow-sm flex flex-col">
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-black text-red-950 uppercase tracking-tight flex items-center gap-2"><FaChartLine className="text-red-800" /> My Monthly Growth</h2>
                  <p className="text-gray-400 text-[11px] font-medium">Tracking contribution graph over 5 months</p>
                </div>
                <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-0.5"><FaArrowUp /> +23%</span>
              </div>
              <div className="w-full h-48 mt-2 overflow-hidden">
                <ReactApexChart options={monthlyOptions} series={monthlySeries} type="line" height={190} />
              </div>
            </div>

          </div>

          {/* સિસ્ટમ લોગ્સ */}
          <div className="bg-white border border-gray-100 rounded-4xl p-6 shadow-sm">
            <h3 className="text-lg font-black text-red-950 uppercase tracking-tight mb-4">Your Recent System Logs</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                <FaClock className="text-red-800 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Account Verified on Gurukul System</p>
                  <p className="text-[10px] text-gray-400">Synced via Database Security Protocol</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                <FaClock className="text-red-800 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Department assigned to {userData.department}</p>
                  <p className="text-[10px] text-gray-400">Authorized by Admin Head</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}