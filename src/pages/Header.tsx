import { useState, useRef, useEffect } from "react";
import { MdCircleNotifications } from "react-icons/md";
import { FaGlobe, FaChevronDown, FaUserCircle, FaBars, FaTimes, FaFileSignature } from "react-icons/fa"; // 🎯 FaFileSignature આઇકોન ઉમેર્યું
import Logo from "../assets/gurukul logo.png";
import { toast } from "sonner";
import Notification from "../Components/commen/Notification";
import Application from "./Application"; // 🎯 નવું એપ્લિકેશન ફોર્મ ઇમ્પોર્ટ કર્યું

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

export default function Header({ onMenuClick }: HeaderProps) {
    const [openNotification, setOpenNotification] = useState(false);
    const [openFullPopup, setOpenFullPopup] = useState(false); 
    const [openApplicationForm, setOpenApplicationForm] = useState(false); // 🎯 એપ્લિકેશન ફોર્મ ઓપન કરવાનું સ્ટેટ
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLang, setSelectedLang] = useState("English");
    const [pendingRequests, setRequests] = useState<any[]>([]); 
    const [shouldBlink, setShouldBlink] = useState<boolean>(true);
    const [hasViewedNotification, setHasViewedNotification] = useState<boolean>(false);
    
    const dropdownRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    const userRole = localStorage.getItem("user_role") || "USER";
    const userRaw = localStorage.getItem("user");

    let userData: UserSession = { full_name: "Admin User", department_id: 0, profile_image_url: null };
    if (userRaw) { 
        try { 
            userData = JSON.parse(userRaw); 
        } catch (e) {
            console.error(e);
        } 
    }

    const isSuperAdmin = userData?.id === 123098 || String(userRole).toUpperCase() === "SUPER_ADMIN";
    const userDepartmentId = Number(userData?.department_id) || 0;

    // 🔄 ૧. GET METHOD: ફિલ્ટર કરેલી લાઈવ નોટિફિકેશન્સ અને એડમિટ લિસ્ટ ડેટા સિંક્રોનાઇઝેશન
    const fetchAllAlertSystemData = async () => {
        try {
            let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            if (API_URL.endsWith('/')) API_URL = API_URL.slice(0, -1);

            let combinedPending: any[] = [];

            // ઓલ્ડ એડમિટ રિક્વેસ્ટો લોડ કરવાનું લોજિક (તમારો જૂનો કોડ યથાવત)
            if (isSuperAdmin || userDepartmentId === 1) {
                const resG = await fetch(`${API_URL}/g-music/admit-list`);
                const dataG = await resG.json();
                if (dataG.success && dataG.requests) {
                    const pendingG = dataG.requests
                        .filter((r: any) => r.status.toLowerCase() === "pending")
                        .map((r: any) => ({ ...r, originDept: "g-music", deptName: "G-Music" }));
                    combinedPending = [...combinedPending, ...pendingG];
                }
            }

            if (isSuperAdmin || userDepartmentId === 2) {
                const resArt = await fetch(`${API_URL}/gurukul-art/admit-list`);
                const dataArt = await resArt.json();
                if (dataArt.success && dataArt.requests) {
                    const pendingArt = dataArt.requests
                        .filter((r: any) => r.status.toLowerCase() === "pending")
                        .map((r: any) => ({ ...r, originDept: "gurukul-art", deptName: "Gurukul Art" }));
                    combinedPending = [...combinedPending, ...pendingArt];
                }
            }

            // 🎯 ૨. GET METHOD CONNECTIVITY: તમારા નવા Notification-controller માંથી લાઈવ પાસવર્ડ રિક્વેસ્ટ મેળવવી
            const resNewNotif = await fetch(`${API_URL}/student/get-filtered-notifications?filterType=week`);
            const dataNewNotif = await resNewNotif.json();
            if (dataNewNotif.success && Array.isArray(dataNewNotif.notifications)) {
                const passwordRequests = dataNewNotif.notifications.map((n: any) => ({
                    ...n,
                    id: n.id,
                    name: n.title,
                    suid: n.user_id,
                    deptName: "Password Security",
                    originDept: "student/notification"
                }));
                combinedPending = [...combinedPending, ...passwordRequests];
            }

            setRequests(combinedPending);
            
            if (isSuperAdmin || combinedPending.length > 0) {
                setShouldBlink(combinedPending.length > 0);
            }
        } catch (error) {
            console.error("Error fetching header system logs:", error);
        }
    };

    useEffect(() => {
        fetchAllAlertSystemData();
        const interval = setInterval(fetchAllAlertSystemData, 15000);
        return () => clearInterval(interval);
    }, [userDepartmentId, isSuperAdmin]);

    // 🎯 ૩. PUT & POST METHOD: અપ્રુવલ અને કંટ્રોલર સ્ટેજ ચેઇન સેટઅપ
    const handleApprove = async (id: number) => {
        const targetReq = pendingRequests.find((r) => r.id === id);
        if (!targetReq) return;

        try {
            let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            if (API_URL.endsWith('/')) API_URL = API_URL.slice(0, -1);

            // જો તે પાસવર્ડ રીસેટની નોટિફિકેશન હોય તો PUT રિક્વેસ્ટ સ્ટેજ ચલાવો
            if (targetReq.originDept === "student/notification") {
                const actionType = isSuperAdmin ? 'admin' : 'head';
                const res = await fetch(`${API_URL}/student/notification/status-update/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: actionType, action: 'approve' })
                });
                const d = await res.json();
                if (res.ok && d.success) {
                    toast.success(d.message);
                    fetchAllAlertSystemData();
                } else {
                    toast.error(d.message);
                }
                return;
            }

            // જૂનું નોર્મલ ડિપાર્ટમેન્ટ એડમિટ અપ્રુવલ લોજિક
            const res = await fetch(`${API_URL}/${targetReq.originDept}/admit-request/approve/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    adminId: String(userData?.id),
                    userRole: userRole,
                    departmentId: userDepartmentId
                })
            });
            const d = await res.json();
            if (res.ok && d.success) { 
                toast.success(`${targetReq.deptName} Request approved successfully! ✅`); 
                fetchAllAlertSystemData(); 
            } else {
                toast.error(d.message || "Authorization restriction!");
            }
        } catch (e) {
            toast.error("Process failed");
        }
    };

    // 🗑️ ૪. PUT & DELETE METHOD: ડિક્લાઇન કરવા પર ઓટો-ડિલીશન પ્રોસેસ લોજિક કનેક્શન
    const handleDecline = async (id: number) => {
        const targetReq = pendingRequests.find((r) => r.id === id);
        if (!targetReq) return;

        try {
            let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            if (API_URL.endsWith('/')) API_URL = API_URL.slice(0, -1);

            // જો પાસવર્ડ રીસેટ વાળી નોટિફિકેશન રિજેક્ટ થાય તો PUT રિક્વેસ્ટ ડાયરેક્ટ ડિલીટ કરશે
            if (targetReq.originDept === "student/notification") {
                const actionType = isSuperAdmin ? 'admin' : 'head';
                const res = await fetch(`${API_URL}/student/notification/status-update/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: actionType, action: 'decline' })
                });
                const d = await res.json();
                if (res.ok && d.success) {
                    toast.error(d.message);
                    fetchAllAlertSystemData();
                }
                return;
            }

            // જૂનું ડિપાર્ટમેન્ટ ડિક્લાઇન લોજિક
            const res = await fetch(`${API_URL}/${targetReq.originDept}/admit-request/decline/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    adminId: String(userData?.id),
                    userRole: userRole,
                    departmentId: userDepartmentId
                })
            });
            const d = await res.json();
            if (res.ok && d.success) {
                toast.error(`${targetReq.deptName} Request successfully declined! ❌`);
                fetchAllAlertSystemData();
            } else {
                toast.error(d.message || "Authorization restriction!");
            }
        } catch (e) {
            toast.error("Process failed");
        }
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) setOpenNotification(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const languages = ["ગુજરાતી", "English", "हिन्दी"];
    const showLiveBadge = isSuperAdmin ? pendingRequests.length > 0 && shouldBlink : !hasViewedNotification;

    return (
        <div className="w-full h-full flex items-center rounded-2xl bg-red-800 justify-between select-none p-2 pl-3 pr-3 shadow-md relative">
            <div className="flex items-center gap-2 sm:gap-3">
                <button onClick={onMenuClick} className="md:hidden w-9 h-9 rounded-xl bg-red-100 text-red-800 flex justify-center items-center shrink-0 cursor-pointer"><FaBars size={16} /></button>
                <img src={Logo} className="w-10 h-10 object-contain shrink-0" alt="Gurukul Logo" />
                <span className="text-amber-100 font-black text-xs uppercase tracking-wider hidden sm:block">GURUKUL SYSTEM</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                
                {/* 🎯 એપ્લિકેશન ફોર્મ ઓપન કરવા માટેનું નવું શાનદાર ટૉપ આઇકોન ગેટવે */}
                <button
                    onClick={() => setOpenApplicationForm(true)}
                    title="Apply for Password Reset"
                    className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-2xl transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-95 shadow-sm"
                >
                    <FaFileSignature size={14} />
                </button>

                {/* નોટિફિકેશન બેલ કમ્પોનન્ટ */}
                <div className="relative" ref={notificationRef}>
                    <div 
                        onClick={() => {
                            if (isSuperAdmin) {
                                setOpenNotification(!openNotification);
                                setShouldBlink(false);
                            } else {
                                setOpenFullPopup(true);
                                setHasViewedNotification(true);
                            }
                        }} 
                        className="flex items-center gap-1.5 bg-gray-50 text-red-800 px-2.5 py-1.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer relative active:scale-[0.98]"
                    >
                        <span className="w-6 h-6 sm:w-7 sm:h-7 bg-red-100 text-red-800 rounded-full flex items-center justify-center shrink-0">
                            <MdCircleNotifications size={24} />
                        </span>
                        {showLiveBadge && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full border border-white animate-pulse" />
                        )}
                    </div>

                    {openNotification && isSuperAdmin && (
                        <div className="absolute right-0 mt-3 bg-white border border-gray-100 w-80 sm:w-96 rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col">
                            <div className="bg-red-800 text-amber-100 p-4 flex justify-between items-center">
                                <span className="font-black text-xs tracking-wider uppercase">Applications Menu ({pendingRequests.length})</span>
                                <button onClick={() => setOpenNotification(false)} className="text-amber-100/70 hover:text-white"><FaTimes size={14} /></button>
                            </div>
                            
                            <div className="overflow-y-auto p-3 flex flex-col gap-2 max-h-50 bg-gray-50/60">
                                {pendingRequests.slice(0, 3).map((item) => (
                                    <div key={item.id} className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-left">
                                        <span className="text-xs font-black text-gray-800 uppercase block truncate">{item.name}</span>
                                        <span className="text-[10px] font-bold text-gray-400">SUID: {item.suid} | Dept: {item.deptName || "System Sync"}</span>
                                    </div>
                                ))}
                                {pendingRequests.length === 0 && (
                                    <div className="text-center py-6 text-gray-400 font-bold text-xs uppercase">No active items</div>
                                )}
                            </div>

                            <button 
                                onClick={() => { setOpenNotification(false); setOpenFullPopup(true); }}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-red-950 font-black text-[10px] uppercase tracking-widest py-3 text-center transition-colors cursor-pointer border-t border-gray-200"
                            >
                                View Detailed Panel ➔
                            </button>
                        </div>
                    )}
                </div>

                {/* લેંગ્વેજ સિલેક્ટર */}
                <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-1.5 bg-gray-50 text-red-800 px-2.5 py-1.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer">
                        <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center shrink-0"><FaGlobe size={12} /></span>
                        <span className="text-xs font-bold">{selectedLang}</span>
                        <FaChevronDown className="text-[9px] transition-transform" />
                    </button>
                    {isOpen && (
                        <div className="absolute right-0 mt-2 w-32 bg-red-800 border border-red-900 rounded-2xl shadow-xl p-1 flex flex-col gap-0.5 z-50">
                            {languages.map((lang) => (
                                <button key={lang} onClick={() => { setSelectedLang(lang); setIsOpen(false); }} className={`w-full text-left px-3 py-2 text-xs font-black uppercase rounded-xl tracking-wider ${selectedLang === lang ? "bg-red-100 text-red-800" : "text-amber-100 hover:bg-red-900"}`}>{lang}</button>
                            ))}
                        </div>
                    )}
                </div>

                {/* પ્રોફાઇલ સેકન્ડરી કાર્ડ */}
                <div className="flex items-center gap-1.5 bg-gray-50 text-red-800 px-2.5 py-1.5 rounded-2xl text-xs sm:text-sm font-semibold">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-red-200">
                        {userData?.profile_image_url ? <img src={userData.profile_image_url} alt="profile" className="w-full h-full object-cover" /> : <FaUserCircle size={14} />}
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-[11px] font-black text-red-800 truncate max-w-25 uppercase tracking-tight">{userData?.full_name}</span>
                        <span className="text-[9px] font-black text-red-800/60 uppercase tracking-wider">{userRole}</span>
                    </div>
                </div>
            </div>

            {/* 🎯 પાસવર્ડ રીસેટ એપ્લિકેશન મોડલ ફોર્મ પોપઅપ */}
            <Application 
                isOpen={openApplicationForm}
                onClose={() => setOpenApplicationForm(false)} sidebarRef={undefined} defaultSubject={""}            />

            {/* ડિટેઇલ નોટિફિકેશન પેનલ */}
            <Notification
                isOpen={openFullPopup}
                onClose={() => setOpenFullPopup(false)}
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