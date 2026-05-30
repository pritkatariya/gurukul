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

  // const setDesboard = (role: string) => {
  //   if (role === "super_admin") {

  //   }
  //   if (role === "DEPARTMENT_HEAD") {

  //   }
  //   return navigate("/");
  // }

  // setDesboard(userRole);

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
      stroke: { curve: "smooth", width: 3, colors: ["#2563eb"] },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "vertical",
          shadeIntensity: 0.3,
          opacityFrom: 0.35,
          opacityTo: 0.05,
          stops: [0, 80, 100]
        }
      },
      markers: { size: 4, colors: ["#fff"], strokeColors: "#2563eb", strokeWidth: 2 },
      grid: {
        borderColor: "#e2e8f0",
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } }
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: zeroWeeklyData.map((data) => data.day),
        labels: { style: { colors: "#64748b", fontSize: "12px" } },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        min: 0,
        max: 100,
        labels: { style: { colors: "#64748b", fontSize: "12px" } }
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
      stroke: { curve: "smooth", width: 3, colors: ["#4338ca"] },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "vertical",
          shadeIntensity: 0.35,
          opacityFrom: 0.32,
          opacityTo: 0.06,
          stops: [0, 80, 100]
        }
      },
      markers: { size: 4, colors: ["#fff"], strokeColors: "#4338ca", strokeWidth: 2 },
      grid: {
        borderColor: "#e2e8f0",
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } }
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: zeroMonthlyData.map((data) => data.month),
        labels: { style: { colors: "#64748b", fontSize: "12px" } },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        min: 0,
        max: 100,
        labels: { style: { colors: "#64748b", fontSize: "12px" } }
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
    <div className="min-h-screen w-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Sevak Portal</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Jai Swaminarayan, {userData.full_name}. Your dashboard is prepared with quick insights and latest activity.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm">
            <FaCalendarCheck className="text-slate-500" />
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
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="rounded-3xl bg-slate-100 p-6 text-center">
            <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm">
              {userData.profile_image_url ? (
                <img
                  src={userData.profile_image_url}
                  alt={userData.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <FaUserAlt className="text-3xl text-slate-500" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-950">{userData.full_name}</h2>
              <p className="mt-2 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {userRole}
              </p>
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-200 pt-5">
            <InfoItem icon={<FaUserShield />} label="Username" value={userData.username || "-"} />
            <InfoItem icon={<FaBuilding />} label="Department" value={deptName} />
            <InfoItem icon={<FaGraduationCap />} label="Standard" value={userData.std || "Main"} />
            <InfoItem icon={<FaHashtag />} label="SUID" value={userData.suid || "-"} />
            <InfoItem icon={<FaHashtag />} label="Roll number" value={String(userData.roll_number || "-")} />
            <InfoItem
              icon={<FaClock />}
              label="Joined date"
              value={
                userData.joined_date
                  ? new Date(userData.joined_date).toLocaleDateString("en-GB")
                  : "-"
              }
            />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <FaAward className="text-indigo-600" />
                  Seva score
                </p>
                <p className="mt-1 text-xs text-slate-500">New account baseline</p>
              </div>
              <div className="relative flex h-12 w-12 items-center justify-center">
                <svg className="absolute h-full w-full -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="#cbd5e1" strokeWidth="4" fill="transparent" />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#2563eb"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={125}
                    strokeDashoffset={125 - (125 * sevaScore) / 100}
                  />
                </svg>
                <span className="relative text-sm font-semibold text-slate-900">{sevaScore}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <ChartCard
              title="Weekly growth"
              subtitle="Daily activity from Monday to Sunday"
              badge="0%"
              icon={<FaChartBar className="text-indigo-600" />}
              options={weeklyOptions}
              series={weeklySeries}
            />
            <ChartCard
              title="Monthly growth"
              subtitle="Contribution trend over 5 months"
              badge="+0%"
              icon={<FaChartLine className="text-indigo-600" />}
              badgeIcon={<FaArrowUp />}
              options={monthlyOptions}
              series={monthlySeries}
            />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-950">Recent system logs</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Latest notifications and activity for your account.
            </p>

            {notifications.length === 0 ? (
              <div className="mt-6 space-y-4">
                <LogItem title="Account created on Gurukul system" subtitle="New account baseline created." />
                <LogItem title={`Department assigned to ${deptName}`} subtitle="Synced from database profile." />
              </div>
            ) : (
              <div className="mt-6 space-y-4 max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start gap-4">
                      <FaClock className="mt-1 text-slate-500" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                        <p className="mt-2 text-xs text-slate-400">
                          {notification.created_at
                            ? new Date(notification.created_at).toLocaleString("en-GB")
                            : ""}
                        </p>
                      </div>
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
    <div className="flex items-center gap-3 text-slate-700">
      <span className="shrink-0 text-lg text-slate-500">{icon}</span>
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function LogItem({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <FaClock className="text-slate-500" />
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

export function ChartCard({
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
    <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950">
            {icon}
            {title}
          </h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {badgeIcon}
          {badge}
        </span>
      </div>

      <div className="h-48 w-full overflow-hidden">
        <ReactApexChart options={options} series={series} type="line" height={190} />
      </div>
    </div>
  );
}