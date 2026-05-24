import { useState, useRef, useEffect } from "react";
import { MdCircleNotifications } from "react-icons/md";
import {
    FaGlobe,
    FaChevronDown,
    FaUserCircle,
    FaBars,
    FaTimes,
    FaFileSignature,
} from "react-icons/fa";
import Logo from "../assets/gurukul logo.png";
import { toast } from "sonner";
import Notification from "../Components/commen/Notification";
import Application from "./Application";

interface HeaderProps {
    onMenuClick?: () => void;
}

interface UserSession {
    id?: number;
    username?: string;
    full_name: string;
    department_id: number;
    profile_image_url: string | null;
}

const getApiUrl = () => {
    let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    if (API_URL.endsWith("/")) API_URL = API_URL.slice(0, -1);
    return API_URL;
};

export default function Header({ onMenuClick }: HeaderProps) {
    const [openNotification, setOpenNotification] = useState(false);
    const [openFullPopup, setOpenFullPopup] = useState(false);
    const [openApplicationForm, setOpenApplicationForm] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLang, setSelectedLang] = useState("English");
    const [pendingRequests, setRequests] = useState<any[]>([]);
    const [shouldBlink, setShouldBlink] = useState(true);
    const [hasViewedNotification, setHasViewedNotification] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    const userRole = localStorage.getItem("user_role") || "USER";
    const userRaw = localStorage.getItem("user");

    let userData: UserSession = {
        full_name: "Admin User",
        department_id: 0,
        profile_image_url: null,
    };

    if (userRaw) {
        try {
            userData = JSON.parse(userRaw);
        } catch (error) {
            console.error(error);
        }
    }

    const roleCode = String(userRole).trim().toLowerCase();

    const isSuperAdmin =
        userData?.id === 123098 ||
        roleCode === "super_admin" ||
        roleCode === "super-admin" ||
        roleCode === "superadmin";

    const isDepartmentHead =
        roleCode === "department main" ||
        roleCode === "department_main" ||
        roleCode === "head1029";

    const userDepartmentId = Number(userData?.department_id) || 0;

    const fetchAllAlertSystemData = async () => {
        try {
            const API_URL = getApiUrl();
            let combinedPending: any[] = [];

            if (isSuperAdmin || userDepartmentId === 1) {
                const resG = await fetch(`${API_URL}/g-music/admit-list`);
                const dataG = await resG.json();

                if (dataG.success && dataG.requests) {
                    const pendingG = dataG.requests
                        .filter((request: any) => String(request.status).toLowerCase() === "pending")
                        .map((request: any) => ({
                            ...request,
                            originDept: "g-music",
                            deptName: "G-Music",
                        }));

                    combinedPending = [...combinedPending, ...pendingG];
                }
            }

            if (isSuperAdmin || userDepartmentId === 2) {
                const resArt = await fetch(`${API_URL}/gurukul-art/admit-list`);
                const dataArt = await resArt.json();

                if (dataArt.success && dataArt.requests) {
                    const pendingArt = dataArt.requests
                        .filter((request: any) => String(request.status).toLowerCase() === "pending")
                        .map((request: any) => ({
                            ...request,
                            originDept: "gurukul-art",
                            deptName: "Gurukul Art",
                        }));

                    combinedPending = [...combinedPending, ...pendingArt];
                }
            }

            if (isSuperAdmin || userDepartmentId === 3) {
                const resCulture = await fetch(`${API_URL}/g-culture/admit-list`);
                const dataCulture = await resCulture.json();

                if (dataCulture.success && dataCulture.requests) {
                    const pendingCulture = dataCulture.requests
                        .filter((request: any) => String(request.status).toLowerCase() === "pending")
                        .map((request: any) => ({
                            ...request,
                            originDept: "g-culture",
                            deptName: "G-Culture",
                        }));

                    combinedPending = [...combinedPending, ...pendingCulture];
                }
            }

            const params = new URLSearchParams({
                filterType: "week",
                userId: String(userData?.id || 0),
                departmentId: String(userDepartmentId || 0),
                role: userRole,
            });

            const resPassword = await fetch(
                `${API_URL}/student/get-filtered-notifications?${params.toString()}`
            );
            const dataPassword = await resPassword.json();

            if (dataPassword.success && Array.isArray(dataPassword.notifications)) {
                const passwordRequests = dataPassword.notifications.map((item: any) => ({
                    ...item,
                    id: item.id,
                    name: item.name || item.username || item.title || item.subject,
                    suid: item.suid || item.user_id,
                    deptName: item.department_name || "Password Security",
                    originDept: "student/notification",
                    status: item.status || "Pending",
                }));

                combinedPending = [...combinedPending, ...passwordRequests];
            }

            setRequests(combinedPending);
            setShouldBlink(combinedPending.length > 0);
        } catch (error) {
            console.error("Error fetching header system logs:", error);
        }
    };

    useEffect(() => {
        fetchAllAlertSystemData();

        const interval = window.setInterval(fetchAllAlertSystemData, 15000);
        return () => window.clearInterval(interval);
    }, [userDepartmentId, userRole, userData?.id]);

    const handleApprove = async (id: number) => {
        const targetReq = pendingRequests.find((request) => request.id === id);
        if (!targetReq) return;

        try {
            const API_URL = getApiUrl();

            if (targetReq.originDept === "student/notification") {
                const actionType = isSuperAdmin ? "admin" : "head";

                const res = await fetch(`${API_URL}/student/notification/status-update/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: actionType,
                        action: "approve",
                    }),
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    toast.success(data.message || "Request approved");
                    await fetchAllAlertSystemData();
                } else {
                    toast.error(data.message || "Approval failed");
                }

                return;
            }

            const res = await fetch(`${API_URL}/${targetReq.originDept}/admit-request/approve/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    adminId: String(userData?.id),
                    userRole,
                    departmentId: userDepartmentId,
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                toast.success(`${targetReq.deptName} Request approved successfully!`);
                await fetchAllAlertSystemData();
            } else {
                toast.error(data.message || "Authorization restriction!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Process failed");
        }
    };

    const handleDecline = async (id: number) => {
        const targetReq = pendingRequests.find((request) => request.id === id);
        if (!targetReq) return;

        try {
            const API_URL = getApiUrl();

            if (targetReq.originDept === "student/notification") {
                const actionType = isSuperAdmin ? "admin" : "head";

                const res = await fetch(`${API_URL}/student/notification/status-update/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: actionType,
                        action: "decline",
                    }),
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    toast.error(data.message || "Request declined");
                    await fetchAllAlertSystemData();
                } else {
                    toast.error(data.message || "Decline failed");
                }

                return;
            }

            const res = await fetch(`${API_URL}/${targetReq.originDept}/admit-request/decline/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    adminId: String(userData?.id),
                    userRole,
                    departmentId: userDepartmentId,
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                toast.error(`${targetReq.deptName} Request successfully declined!`);
                await fetchAllAlertSystemData();
            } else {
                toast.error(data.message || "Authorization restriction!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Process failed");
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }

            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setOpenNotification(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const languages = ["ગુજરાતી", "English", "हिन्दी"];
    const showLiveBadge =
        pendingRequests.length > 0 && (isSuperAdmin || isDepartmentHead || !hasViewedNotification);

    return (
        <div className="relative flex h-full w-full items-center justify-between gap-2 rounded-2xl bg-red-800 px-2 py-2 shadow-md select-none sm:px-3">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-800 md:hidden"
                >
                    <FaBars size={16} />
                </button>

                <img
                    src={Logo}
                    className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10"
                    alt="Gurukul Logo"
                />

                <div className="hidden min-w-0 flex-col sm:flex">
                    <span className="truncate text-xs font-black uppercase tracking-wider text-amber-100">
                        Gurukul System
                    </span>
                    <span className="hidden truncate text-[10px] font-bold uppercase tracking-wider text-amber-100/60 lg:block">
                        Management Dashboard
                    </span>
                </div>
            </div>

            <div className="flex min-w-0 items-center justify-end gap-1.5 sm:gap-2 lg:gap-3">
                <button
                    type="button"
                    onClick={() => setOpenApplicationForm(true)}
                    title="Apply for Password Reset"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 shadow-sm transition-all hover:bg-amber-100 active:scale-95 sm:h-11 sm:w-11"
                >
                    <FaFileSignature size={14} />
                </button>

                <div className="relative shrink-0" ref={notificationRef}>
                    <button
                        type="button"
                        onClick={() => {
                            if (isSuperAdmin || isDepartmentHead) {
                                setOpenNotification((prev) => !prev);
                                setShouldBlink(false);
                            } else {
                                setOpenFullPopup(true);
                                setHasViewedNotification(true);
                            }
                        }}
                        className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50 text-red-800 transition-all active:scale-95 sm:h-11 sm:w-11"
                    >
                        <MdCircleNotifications size={25} />
                        {showLiveBadge && shouldBlink && (
                            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border border-white bg-red-600 animate-pulse" />
                        )}
                    </button>

                    {openNotification && (isSuperAdmin || isDepartmentHead) && (
                        <div className="absolute right-0 z-50 mt-3 flex max-h-[70vh] w-[calc(100vw-1rem)] max-w-96 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl sm:w-96">
                            <div className="flex items-center justify-between bg-red-800 p-4 text-amber-100">
                                <span className="truncate text-xs font-black uppercase tracking-wider">
                                    Applications Menu ({pendingRequests.length})
                                </span>

                                <button
                                    type="button"
                                    onClick={() => setOpenNotification(false)}
                                    className="ml-3 shrink-0 text-amber-100/70 hover:text-white"
                                >
                                    <FaTimes size={14} />
                                </button>
                            </div>

                            <div className="flex max-h-56 flex-col gap-2 overflow-y-auto bg-gray-50/60 p-3">
                                {pendingRequests.slice(0, 4).map((item) => (
                                    <div
                                        key={`${item.originDept}-${item.id}`}
                                        className="rounded-2xl border border-gray-100 bg-white p-3 text-left shadow-sm"
                                    >
                                        <span className="block truncate text-xs font-black uppercase text-gray-800">
                                            {item.name}
                                        </span>
                                        <span className="mt-1 block truncate text-[10px] font-bold text-gray-400">
                                            SUID: {item.suid} | Dept: {item.deptName || "System Sync"}
                                        </span>
                                    </div>
                                ))}

                                {pendingRequests.length === 0 && (
                                    <div className="py-6 text-center text-xs font-bold uppercase text-gray-400">
                                        No active items
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setOpenNotification(false);
                                    setOpenFullPopup(true);
                                }}
                                className="w-full border-t border-gray-200 bg-gray-100 py-3 text-center text-[10px] font-black uppercase tracking-widest text-red-950 transition-colors hover:bg-gray-200"
                            >
                                View Detailed Panel
                            </button>
                        </div>
                    )}
                </div>

                <div className="relative hidden sm:block" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setIsOpen((prev) => !prev)}
                        className="flex h-10 items-center gap-1.5 rounded-2xl bg-gray-50 px-2.5 text-sm font-semibold text-red-800 sm:h-11"
                    >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100">
                            <FaGlobe size={12} />
                        </span>
                        <span className="max-w-16 truncate text-xs font-bold lg:max-w-20">
                            {selectedLang}
                        </span>
                        <FaChevronDown className="text-[9px]" />
                    </button>

                    {isOpen && (
                        <div className="absolute right-0 z-50 mt-2 flex w-32 flex-col gap-0.5 rounded-2xl border border-red-900 bg-red-800 p-1 shadow-xl">
                            {languages.map((lang) => (
                                <button
                                    key={lang}
                                    type="button"
                                    onClick={() => {
                                        setSelectedLang(lang);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full rounded-xl px-3 py-2 text-left text-xs font-black uppercase tracking-wider ${
                                        selectedLang === lang
                                            ? "bg-red-100 text-red-800"
                                            : "text-amber-100 hover:bg-red-900"
                                    }`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex min-w-0 items-center gap-1.5 rounded-2xl bg-gray-50 px-2 py-1.5 text-red-800 sm:px-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-red-200 bg-red-100 sm:h-8 sm:w-8">
                        {userData?.profile_image_url ? (
                            <img
                                src={userData.profile_image_url}
                                alt="profile"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <FaUserCircle size={15} />
                        )}
                    </div>

                    <div className="hidden min-w-0 flex-col text-left sm:flex">
                        <span className="max-w-24 truncate text-[11px] font-black uppercase tracking-tight text-red-800 lg:max-w-36">
                            {userData?.full_name}
                        </span>
                        <span className="truncate text-[9px] font-black uppercase tracking-wider text-red-800/60">
                            {userRole}
                        </span>
                    </div>
                </div>
            </div>

            <Application
                isOpen={openApplicationForm}
                onClose={() => setOpenApplicationForm(false)}
                sidebarRef={undefined}
                defaultSubject="Request for password reset"
            />

            <Notification
                isOpen={openFullPopup}
                onClose={() => {
                    setOpenFullPopup(false);
                    fetchAllAlertSystemData();
                }}
                notifications={pendingRequests}
                deptNotifications={[]}
                setNotifications={setRequests}
                setDeptNotifications={() => {}}
                onApprove={handleApprove}
                onDecline={handleDecline}
                onApproveDept={async () => {}}
                onDeclineDept={async () => {}}
            />
        </div>
    );
}