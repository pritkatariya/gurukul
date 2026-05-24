import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FaUsers, FaUserPlus, FaCheckCircle, FaClock, FaUserCheck, FaCrown } from "react-icons/fa";
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
  suid: string;
  profileImage: string | null;
  role?: string | null;
  department_id: string | number;
  joined_date: string;
}

const getImageUrl = (item: any) =>
  item?.profile_image_url || item?.image_url || item?.img || null;

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

      let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      if (API_URL.endsWith("/")) API_URL = API_URL.slice(0, -1);

      const resReq = await fetch(`${API_URL}/${apiRoutePrefix}/admit-list`);
      let formattedRequests: SeekerRequestType[] = [];

      if (resReq.ok) {
        const data = await resReq.json();

        if (data.success && data.requests) {
          formattedRequests = data.requests.map((req: any) => ({
            id: req.id,
            img: getImageUrl(req),
            name: req.name,
            role: `${String(req.performance || "").toUpperCase()} Perf.`,
            dept: req.department_id,
            date: req.created_at
              ? new Date(req.created_at).toLocaleDateString("en-GB")
              : "18/05/2026",
            status: req.status,
            suid: req.suid,
            performance: req.performance,
            isCreated: req.is_user_created || false,
          }));
        }
      }

      const resUsers = await fetch(`${API_URL}/${apiRoutePrefix}/onboarded-users`);
      let liveUsers: OnboardedUserType[] = [];

      if (resUsers.ok) {
        const dataUsers = await resUsers.json();

        if (dataUsers.success && dataUsers.users) {
          liveUsers = dataUsers.users.map((user: any) => ({
            id: user.id,
            name: user.name || user.full_name,
            username: user.username,
            suid: user.suid || "",
            profileImage: getImageUrl(user),
            role: user.role || user.role_code || user.role_name || null,
            department_id: user.department_id,
            joined_date: user.joined_date,
          }));

          setOnboardedStudents(liveUsers);
        }
      }

      const cleanRequests = formattedRequests.filter((req) => {
        if (req.isCreated) return false;

        const alreadyOnboarded = liveUsers.some(
          (user) => String(user.suid || "").trim() === String(req.suid).trim()
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
    <div className="flex min-h-screen w-full select-none flex-col gap-6 bg-gray-50/30 p-2 sm:p-6 lg:p-10">
      <div className="flex w-full flex-col items-start justify-between gap-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-6">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-black uppercase tracking-tight text-red-950 sm:gap-3 sm:text-3xl">
            <span className="rounded-xl bg-red-50 p-2 text-red-800 shadow-inner sm:rounded-2xl">
              <FaUsers size={20} />
            </span>
            {departmentName} Admission Control Panel
          </h1>
          <p className="mt-1 text-xs font-semibold text-gray-400 sm:text-sm">
            Realtime database request configurations and onboarding dashboard for {departmentName}.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-row items-center gap-2 overflow-x-auto rounded-2xl border border-gray-200/50 bg-gray-100/80 p-1.5 sm:w-fit">
        <TabButton
          active={activeTab === "Approved"}
          onClick={() => setActiveTab("Approved")}
          color="emerald"
          icon={<FaCheckCircle size={12} />}
          label={`Approved (${requests.filter((r) => r.status.toLowerCase() === "approved").length})`}
        />

        <TabButton
          active={activeTab === "Pending"}
          onClick={() => setActiveTab("Pending")}
          color="amber"
          icon={<FaClock size={12} />}
          label={`Pending (${requests.filter((r) => r.status.toLowerCase() === "pending").length})`}
        />
      </div>

      <div className="flex w-full flex-col rounded-3xl border border-gray-100 bg-white p-3 shadow-sm sm:p-5">
        {loading ? (
          <LoadingState label={`Fetching ${departmentName} Records...`} />
        ) : filteredRequests.length === 0 ? (
          <EmptyState label={`No dynamic ${activeTab.toLowerCase()} entries found for ${departmentName}.`} />
        ) : (
          <div className="w-full">
            <div className="mb-6 hidden overflow-visible rounded-2xl border border-gray-100 bg-white lg:block">
              <DataExplorer
                headers={headers}
                data={filteredRequests}
                onView={() => {}}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </div>

            <RequestsPanel
              activeTab={activeTab}
              requests={filteredRequests}
              currentDeptId={currentDeptId}
              navigate={navigate}
            />
          </div>
        )}
      </div>

      <CreatedStudentsPanel
        departmentName={departmentName}
        students={onboardedStudents}
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color: "emerald" | "amber";
}) {
  const activeClass =
    color === "emerald"
      ? "bg-white text-emerald-800 shadow-sm border border-emerald-100"
      : "bg-white text-amber-800 shadow-sm border border-amber-100";

  return (
    <button
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-center text-[11px] font-black uppercase tracking-wider transition-all sm:flex-none sm:px-6 sm:text-xs ${
        active ? activeClass : "text-gray-500"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 font-bold text-gray-400">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-800 border-t-transparent" />
      <span className="text-[11px] uppercase tracking-wider text-red-950/50">{label}</span>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="py-24 text-center text-xs font-bold uppercase tracking-wider text-gray-400">
      {label}
    </div>
  );
}

function RequestsPanel({
  activeTab,
  requests,
  currentDeptId,
  navigate,
}: {
  activeTab: string;
  requests: SeekerRequestType[];
  currentDeptId: number;
  navigate: ReturnType<typeof useNavigate>;
}) {
  return (
    <div className="mb-6 rounded-2xl border border-red-100/50 bg-red-50/10 p-2 sm:p-4">
      <h3 className="mb-4 pl-1 text-xs font-black uppercase tracking-wider text-red-950">
        Live Onboarding Logs Panel ({activeTab})
      </h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {requests.map((req) => (
          <div
            key={req.id}
            className="flex flex-col items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
          >
            <div className="flex items-center gap-3">
              {req.img ? (
                <img
                  src={req.img}
                  alt={req.name}
                  className="h-10 w-10 rounded-full border border-gray-200 object-cover"
                />
              ) : (
                <AvatarFallback name={req.name} color="red" />
              )}

              <div>
                <h4 className="text-xs font-black uppercase text-gray-800">{req.name}</h4>
                <p className="mt-0.5 text-[10px] font-bold text-gray-400">
                  SUID: {req.suid} | {req.role}
                </p>
              </div>
            </div>

            <div className="flex w-full items-center justify-end gap-2 border-t pt-2 sm:w-auto sm:border-t-0 sm:pt-0">
              {req.status.toLowerCase() === "approved" ? (
                <>
                  <span className="hidden items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-700 sm:inline-flex">
                    Approved
                  </span>

                  <button
                    onClick={() =>
                      navigate(
                        `/deshbord/new-user-create?dept_id=${currentDeptId}&name=${encodeURIComponent(
                          req.name
                        )}&suid=${encodeURIComponent(req.suid)}`
                      )
                    }
                    className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-red-800 px-3 py-2 text-[10px] font-black text-white shadow-sm transition-all hover:bg-red-900 sm:w-auto"
                  >
                    <FaUserPlus size={11} /> CREATE STUDENT
                  </button>
                </>
              ) : (
                <span className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-center text-[10px] font-black text-amber-800 sm:w-auto">
                  PENDING REVIEW
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CreatedStudentsPanel({
  departmentName,
  students,
}: {
  departmentName: string;
  students: OnboardedUserType[];
}) {
  const isHead = (s: OnboardedUserType) => {
    const role = String(s.role || "").trim().toLowerCase();
    if (!role) return false;

    return (
      role === "head1029" ||
      role === "department main" ||
      role === "department_main" ||
      role === "department-head"
    );
  };

  const head = students.find(isHead);
  const others = students.filter((s) => s !== head);

  return (
    <div className="flex w-full flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center gap-2">
        <span className="rounded-xl bg-emerald-50 p-1.5 text-emerald-700">
          <FaUserCheck size={16} />
        </span>
        <h2 className="text-sm font-black uppercase tracking-wider text-gray-800 sm:text-base">
          {departmentName} Created Students List ({students.length})
        </h2>
      </div>

      {students.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-8 text-center text-xs font-bold uppercase tracking-wider text-gray-400">
          No active onboarding users registered yet in {departmentName}.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {head && (
            <div className="col-span-full rounded-4xl border-2 border-red-200 bg-gradient-to-r from-red-50 via-white to-red-50 p-6 shadow-[0_24px_60px_rgba(220,38,38,0.08)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {head.profileImage ? (
                      <img
                        src={head.profileImage}
                        alt={head.name}
                        className="h-16 w-16 rounded-full object-cover border-2 border-red-200 shadow-xl"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-red-800 text-white flex items-center justify-center font-black text-2xl shadow-xl">
                        {head.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 rounded-full bg-red-800 p-2 text-white shadow-lg">
                      <FaCrown size={12} />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-lg font-black text-red-950 tracking-tight truncate">{head.name}</h4>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-red-800 border border-red-200">
                        <FaCrown size={12} /> Department Head
                      </span>
                      <span className="text-[11px] text-gray-500">User: {head.username}</span>
                      <span className="text-[11px] text-gray-400">| SUID: {head.suid}</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-3xl bg-white border border-red-100 p-3 shadow-sm">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">Role</p>
                    <p className="mt-2 text-sm font-black text-red-900">{head.role || "Department Head"}</p>
                  </div>
                  <div className="rounded-3xl bg-white border border-red-100 p-3 shadow-sm">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">Joined</p>
                    <p className="mt-2 text-sm font-black text-gray-800">{head.joined_date ? new Date(head.joined_date).toLocaleDateString("en-GB") : "—"}</p>
                  </div>
                  <div className="rounded-3xl bg-white border border-red-100 p-3 shadow-sm">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400">Department</p>
                    <p className="mt-2 text-sm font-black text-gray-800">{departmentName}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {others.map((student) => (
            <div
              key={student.id}
              className="flex items-center gap-3 rounded-2xl border border-emerald-100/50 bg-emerald-50/20 p-3"
            >
              {student.profileImage ? (
                <img
                  src={student.profileImage}
                  alt={student.name}
                  className="h-10 w-10 rounded-full border border-emerald-200 object-cover"
                />
              ) : (
                <AvatarFallback name={student.name} color="emerald" />
              )}

              <div>
                <h4 className="text-xs font-black uppercase tracking-tight text-gray-800">
                  {student.name}
                </h4>
                <p className="text-[10px] font-bold text-gray-400">
                  User: {student.username} | SUID: {student.suid} | Joined: {" "}
                  {student.joined_date
                    ? new Date(student.joined_date).toLocaleDateString("en-GB")
                    : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AvatarFallback({ name, color }: { name: string; color: "red" | "emerald" }) {
  const bg = color === "emerald" ? "bg-emerald-700" : "bg-red-800";

  return (
    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-black text-white ${bg}`}>
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
}