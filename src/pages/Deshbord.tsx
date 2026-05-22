import { useEffect, useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexAxisChartSeries, ApexOptions } from "apexcharts";
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
  FaSignOutAlt,
  FaUserShield
} from "react-icons/fa";

interface NotificationType {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface UserSession {
  id: number;
  full_name: string;
  username: string;
  role?: string;
  std?: string;
  roll_number?: number | string | null;
  suid?: string | null;
  department_id?: number;
  profile_image_url?: string | null;
  account_status?: string;
  joined_date?: string;
}

const getApiUrl = () => {
  let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  if (API_URL.endsWith("/")) API_URL = API_URL.slice(0, -1);
  return API_URL;
};

const zeroWeeklyData = [
  { day: "Mon", Seva: 0 },
  { day: "Tue", Seva: 0 },
  { day: "Wed", Seva: 0 },
  { day: "Thu", Seva: 0 },
  { day: "Fri", Seva: 0 },
  { day: "Sat", Seva: 0 },
  { day: "Sun", Seva: 0 }
];

const zeroMonthlyData = [
  { month: "Jan", SevaProgress: 0 },
  { month: "Feb", SevaProgress: 0 },
  { month: "Mar", SevaProgress: 0 },
  { month: "Apr", SevaProgress: 0 },
  { month: "May", SevaProgress: 0 }
];

export default function Deshbord() {
  const navigate = useNavigate();

  const userRole = localStorage.getItem("user_role") || "USER";
  const userRaw = localStorage.getItem("user");

  const parsedUser: UserSession = userRaw
    ? JSON.parse(userRaw)
    : {
        id: 0,
        full_name: "Gurukul Sevak",
        username: "-",
        std: "Main",
        roll_number: null,
        suid: null,
        department_id: 0,
        profile_image_url: null,
        account_status: "Active"
      };

  const [userData, setUserData] = useState<UserSession>(parsedUser);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [deptName, setDeptName] = useState("General / Admin");

  const sevaScore = 0;

  useEffect(() => {
    const fetchDashboardMeta = async () => {
      try {
        const API_URL = getApiUrl();

        const resDept = await fetch(`${API_URL}/auth/departments`);
        const dataDept = await resDept.json();

        if (dataDept.success && dataDept.departments) {
          const match = dataDept.departments.find(
            (department: any) => Number(department.id) === Number(userData.department_id)
          );

          if (match) {
            setDeptName(match.name || match.dept_name);
          }
        }

        const resUsers = await fetch(`${API_URL}/user/alldata`);
        const dataUsers = await resUsers.json();

        if (dataUsers.success && Array.isArray(dataUsers.users)) {
          const latestUser = dataUsers.users.find(
            (user: any) => Number(user.id) === Number(userData.id)
          );

          if (latestUser) {
            const updatedUser: UserSession = {
              id: latestUser.id,
              full_name: latestUser.full_name,
              username: latestUser.username,
              role: latestUser.role,
              std: latestUser.std,
              roll_number: latestUser.roll_number,
              suid: latestUser.suid,
              department_id: latestUser.department_id,
              profile_image_url: latestUser.profile_image_url,
              account_status: latestUser.account_status || "Active",
              joined_date: latestUser.joined_date
            };

            setUserData(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
          }
        }

        if (userData.id) {
          const resNotif = await fetch(`${API_URL}/user/notifications/${userData.id}`);
          const dataNotif = await resNotif.json();

          if (dataNotif.success && dataNotif.notifications) {
            setNotifications(dataNotif.notifications);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchDashboardMeta();
  }, [userData.id, userData.department_id]);

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully!");
    navigate("/");
  };

  const weeklyOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "line",
        height: 200,
        toolbar: { show: false },
        animations: { enabled: false }
      },
      stroke: { curve: "smooth", width: 3, colors: ["#b91c1c"] },
      markers: { size: 4, colors: ["#fff"], strokeColors: "#b91c1c", strokeWidth: 2 },
      grid: {
        borderColor: "#f1f5f9",
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } }
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: zeroWeeklyData.map((data) => data.day),
        labels: { style: { colors: "#94a3b8", fontSize: "11px", fontWeight: 600 } },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        min: 0,
        max: 100,
        labels: { style: { colors: "#94a3b8", fontSize: "11px" } }
      },
      tooltip: { theme: "light" }
    }),
    []
  );

  const monthlyOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "line",
        height: 200,
        toolbar: { show: false },
        animations: { enabled: false }
      },
      stroke: { curve: "smooth", width: 3, colors: ["#991b1b"] },
      markers: { size: 4, colors: ["#fff"], strokeColors: "#991b1b", strokeWidth: 2 },
      grid: {
        borderColor: "#f1f5f9",
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } }
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: zeroMonthlyData.map((data) => data.month),
        labels: { style: { colors: "#94a3b8", fontSize: "11px", fontWeight: 600 } },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        min: 0,
        max: 100,
        labels: { style: { colors: "#94a3b8", fontSize: "11px" } }
      },
      tooltip: { theme: "light" }
    }),
    []
  );

  const weeklySeries = [{ name: "Seva Progress", data: zeroWeeklyData.map((data) => data.Seva) }];
  const monthlySeries = [
    { name: "Monthly Growth", data: zeroMonthlyData.map((data) => data.SevaProgress) }
  ];

  return (
    <div className="min-h-screen w-full select-none bg-gray-50/50 p-4 md:p-8">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-red-950">
            Sevak Portal
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Jai Swaminarayan, {userData.full_name}. Your dashboard is ready.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm">
            <FaCalendarCheck className="text-red-800" />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric"
              })}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-black uppercase tracking-wider text-red-800 transition-all duration-200 hover:bg-red-100 active:scale-95"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-8 lg:flex-row">
        <div className="relative flex w-full shrink-0 flex-col items-center overflow-hidden rounded-[2.5rem] border border-red-100 bg-white p-6 text-center shadow-md shadow-red-950/5 lg:w-[320px]">
          <div className="relative mb-4 flex h-44 w-full items-center justify-center rounded-3xl border border-red-900/50 bg-linear-to-br from-red-900 via-red-950 to-stone-950 shadow-inner">
            <div className="relative z-10 flex h-24 w-24 shrink-0 grow-0 select-none items-center justify-center overflow-hidden rounded-full border-b border-r border-black/30 border-l-2 border-t-2 bg-white/10 text-3xl text-white shadow-[12px_12px_24px_rgba(0,0,0,0.5)] backdrop-blur-md">
              {userData.profile_image_url ? (
                <img
                  src={userData.profile_image_url}
                  alt={userData.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <FaUserAlt className="drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]" />
              )}

              <div className="absolute left-3 top-1 h-2.5 w-1/2 rounded-full bg-white/20 blur-[0.5px]" />
            </div>
          </div>

          <h2 className="text-xl font-black uppercase tracking-tight text-red-950">
            {userData.full_name}
          </h2>

          <p className="mt-1.5 rounded-full bg-red-800 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
            {userRole}
          </p>

          <div className="my-5 w-full space-y-3 border-t border-gray-100 pt-4 text-left">
            <InfoItem icon={<FaUserShield />} label="Username" value={userData.username || "-"} />
            <InfoItem icon={<FaBuilding />} label="Department" value={deptName} />
            <InfoItem icon={<FaGraduationCap />} label="Standard (STD)" value={userData.std || "Main"} />
            <InfoItem
              icon={<FaHashtag />}
              label="SUID"
              value={userData.suid || "-"}
            />
            <InfoItem
              icon={<FaHashtag />}
              label="Roll Number"
              value={String(userData.roll_number || "-")}
            />
            <InfoItem
              icon={<FaClock />}
              label="Joined Date"
              value={
                userData.joined_date
                  ? new Date(userData.joined_date).toLocaleDateString("en-GB")
                  : "-"
              }
            />
          </div>

          <div className="flex w-full items-center justify-between rounded-2xl border border-red-100/50 bg-red-50/40 p-4">
            <div className="text-left">
              <p className="flex items-center gap-1.5 text-xs font-black text-red-950">
                <FaAward className="text-amber-500" /> Seva Score
              </p>
              <p className="mt-0.5 text-[10px] font-bold text-gray-400">
                New account baseline
              </p>
            </div>

            <div className="relative flex h-12 w-12 items-center justify-center text-xs font-black text-red-950">
              <svg className="absolute h-full w-full -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="#fecdd3" strokeWidth="4" fill="transparent" />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="#991b1b"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={125}
                  strokeDashoffset={125 - (125 * sevaScore) / 100}
                />
              </svg>
              <span>{sevaScore}%</span>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-1 flex-col gap-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ChartCard
              title="My Weekly Growth"
              subtitle="Daily analysis from Monday to Sunday"
              badge="0%"
              icon={<FaChartBar className="text-red-800" />}
              options={weeklyOptions}
              series={weeklySeries}
            />

            <ChartCard
              title="My Monthly Growth"
              subtitle="Tracking contribution graph over 5 months"
              badge="+0%"
              icon={<FaChartLine className="text-red-800" />}
              badgeIcon={<FaArrowUp />}
              options={monthlyOptions}
              series={monthlySeries}
            />
          </div>

          <div className="rounded-4xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-black uppercase tracking-tight text-red-950">
              Your Recent System Logs
            </h3>

            {notifications.length === 0 ? (
              <div className="space-y-4">
                <LogItem title="Account created on Gurukul System" subtitle="New account baseline created" />
                <LogItem title={`Department assigned to ${deptName}`} subtitle="Synced from database profile" />
              </div>
            ) : (
              <div className="max-h-60 space-y-4 overflow-y-auto scrollbar-hide">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-center gap-4 rounded-xl border border-gray-100/50 bg-gray-50 p-3"
                  >
                    <FaClock className="shrink-0 text-red-800" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight text-slate-800">
                        {notification.title}
                      </p>
                      <p className="mt-0.5 text-[11px] font-medium text-gray-500">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-[9px] font-bold text-gray-400">
                        {notification.created_at
                          ? new Date(notification.created_at).toLocaleString("en-GB")
                          : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 text-slate-700">
      <span className="shrink-0 text-lg text-red-800">{icon}</span>
      <div>
        <p className="text-[10px] font-bold uppercase text-gray-400">{label}</p>
        <p className="text-sm font-black">{value}</p>
      </div>
    </div>
  );
}

function LogItem({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-3">
      <FaClock className="shrink-0 text-red-800" />
      <div>
        <p className="text-xs font-bold text-slate-800">{title}</p>
        <p className="text-[10px] text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  badge,
  icon,
  badgeIcon,
  options,
  series
}: {
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ReactNode;
  badgeIcon?: React.ReactNode;
  options: ApexOptions;
  series: ApexAxisChartSeries;
}) {
  return (
    <div className="flex flex-col rounded-4xl border border-red-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-black uppercase tracking-tight text-red-950">
            {icon} {title}
          </h2>
          <p className="text-[11px] font-medium text-gray-400">{subtitle}</p>
        </div>

        <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
          {badgeIcon}
          {badge}
        </span>
      </div>

      <div className="mt-2 h-48 w-full overflow-hidden">
        <ReactApexChart options={options} series={series} type="line" height={190} />
      </div>
    </div>
  );
}