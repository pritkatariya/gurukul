import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaClock, FaBell, FaBuilding, FaCalendarAlt, FaFileSignature } from "react-icons/fa";
import { MdNotificationsNone } from "react-icons/md";
import Application from "../../pages/Application";
import WelcomeCard from "../Notification-ui/WelcomeCard";
import AdmitCard from "../Notification-ui/AdmitCard";
import PasswordResetCard from "../Notification-ui/PasswordResetCard";
import { toast } from "sonner";

interface NotificationItem {
  id: number;
  user_id?: number;
  department_id?: number;
  title: string;
  message: string;
  is_read: boolean;
  head_approved: boolean | null;
  admin_approved: boolean | null;
  notification_type: string;
  created_at?: string;
  name?: string;
  suid?: string;
  performance?: string;
  description?: string;
  department_name?: string;
  deptName?: string;
  status?: string; 
  username?: string;
  subject?: string;
}

interface NotificationProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  deptNotifications: NotificationItem[];
  setNotifications?: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  setDeptNotifications?: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  onApprove: (id: number) => Promise<void>;
  onDecline: (id: number) => Promise<void>;
  onApproveDept: (id: number) => Promise<void>;
  onDeclineDept: (id: number) => Promise<void>;
}

export default function Notification({
  isOpen,
  onClose,
  notifications,
  deptNotifications,
  setNotifications,
  onApprove,
  onDecline,
  onApproveDept,
  onDeclineDept
}: NotificationProps) {
  const [activeSubTab, setActiveSubTab] = useState<"admit" | "dept">("admit");
  const [timeFilter, setTimeFilter] = useState<"hour" | "week">("week");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [liveDbNotifications, setLiveDbNotifications] = useState<NotificationItem[]>([]);

  const [openApplicationForm, setOpenApplicationForm] = useState(false);
  const [passwordInputId, setPasswordInputId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState<string>("");

  const userRole = localStorage.getItem("user_role") || "USER";
  const userRaw = localStorage.getItem("user");
  let userId: number | null = null;
  let userName: string = ""; 
  let userDeptId: number = 0;
  
  if (userRaw) {
    try { 
      const parsed = JSON.parse(userRaw);
      userId = parsed.id ? Number(parsed.id) : null; 
      userName = parsed.username || parsed.full_name || "";
      if (parsed.department_id) userDeptId = Number(parsed.department_id);
    } catch (e) {}
  }

  const hasControlAccess = userId === 123098 || String(userRole).trim().toUpperCase() === "SUPER_ADMIN";
  const isDeptHead = String(userRole).trim().toLowerCase() === "department main" || String(userRole).trim().toLowerCase() === "head1029";

  const handleManualDelete = async (id: number) => {
    try {
      let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      if (API_URL.endsWith('/')) API_URL = API_URL.slice(0, -1);
      
      const response = await fetch(`${API_URL}/student/notification/delete/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      if (data.success) {
        setLiveDbNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadLiveNotifications = async () => {
    try {
      let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      if (API_URL.endsWith('/')) API_URL = API_URL.slice(0, -1);
      
      const res = await fetch(`${API_URL}/student/get-filtered-notifications?filterType=${timeFilter}`);
      const data = await res.json();
      
      if (data.success && Array.isArray(data.notifications)) {
        setLiveDbNotifications(data.notifications);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLiveNotifications();
    }
  }, [isOpen, userId, userName, hasControlAccess, timeFilter]);

  const handleStatusUpdate = async (id: number, type: 'head' | 'admin', action: 'approve' | 'decline') => {
    try {
      setProcessingId(id);
      let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      if (API_URL.endsWith('/')) API_URL = API_URL.slice(0, -1);
      
      const response = await fetch(`${API_URL}/student/notification/status-update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, action })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        if (action === 'decline') {
          setLiveDbNotifications(prev => prev.filter(n => n.id !== id));
        } else {
          setLiveDbNotifications(prev => prev.map(n => 
            n.id === id ? { ...n, [type === 'head' ? 'head_approved' : 'admin_approved']: true } : n
          ));
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
    } {
      setProcessingId(null);
    }
  };

  const handleFinalPasswordReset = async (id: number) => {
    if (!newPassword.trim()) {
      toast.error("કૃપા કરીને નવો પાસવર્ડ એન્ટર કરો!");
      return;
    }

    try {
      setProcessingId(id);
      let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      if (API_URL.endsWith('/')) API_URL = API_URL.slice(0, -1);
      
      const response = await fetch(`${API_URL}/student/notification/status-update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: 'password_reset', newPassword })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setPasswordInputId(null);
        setNewPassword("");
        setLiveDbNotifications(prev => prev.filter(n => n.id !== id));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const getFilteredNotifications = (items: NotificationItem[]) => {
    const now = new Date().getTime();
    const oneHour = 60 * 60 * 1000;
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    return items.filter((item) => {
      const itemTime = item.created_at ? new Date(item.created_at).getTime() : now;
      const timeDiff = now - itemTime;
      if (timeDiff > oneWeek) {
        handleManualDelete(item.id);
        return false;
      }
      if (timeFilter === "hour") return timeDiff <= oneHour;
      return timeDiff <= oneWeek;
    });
  };

  const handleApproveAdmit = async (targetId: number) => {
    if (processingId !== null) return;
    try {
      setProcessingId(targetId);
      await onApprove(targetId);
      if (setNotifications) setNotifications(prev => prev.filter(item => item.id !== targetId));
    } catch (error) {
      toast.error("Operation error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeclineAdmit = async (targetId: number) => {
    if (processingId !== null) return;
    try {
      setProcessingId(targetId);
      await onDecline(targetId);
      if (setNotifications) setNotifications(prev => prev.filter(item => item.id !== targetId));
    } catch (error) {
      toast.error("Operation error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveDeptRequest = async (targetId: number) => {
    if (processingId !== null) return;
    try { setProcessingId(targetId); await onApproveDept(targetId); } catch (error) { } finally { setProcessingId(null); }
  };

  const handleDeclineDeptRequest = async (targetId: number) => {
    if (processingId !== null) return;
    try { setProcessingId(targetId); await onDeclineDept(targetId); } catch (error) { } finally { setProcessingId(null); }
  };

  const displayNotifications = liveDbNotifications.filter(item => {
    if (hasControlAccess) return item.head_approved === true || item.notification_type === "Welcome" || item.title?.toLowerCase().includes("welcome");
    if (isDeptHead) return Number(item.department_id) === Number(userDeptId) || item.department_id === 1 || item.department_id === 2;
    
    const lowerMessage = (item.message || "").toLowerCase();
    const lowerTitle = (item.title || "").toLowerCase();
    const lowerUserName = (userName || "").toLowerCase();

    return Number(item.user_id) === Number(userId) || 
           lowerMessage.includes(lowerUserName) || 
           lowerTitle.includes("welcome") || 
           item.notification_type === "Welcome";
  });

  const activeAdmitRequests = hasControlAccess 
    ? getFilteredNotifications(notifications).filter(item => item.status?.toLowerCase() === "pending")
    : getFilteredNotifications(displayNotifications);

  const activeDeptRequests = deptNotifications.filter(
    (item) => item.status && item.status.toLowerCase() === "pending"
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />

          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-full sm:w-112.5 bg-gray-50 z-50 shadow-2xl flex flex-col border-l border-gray-100"
          >
            <div className="bg-red-800 text-amber-100 p-5 flex justify-between items-center shadow-md">
              <div className="flex items-center gap-2">
                <MdNotificationsNone size={24} className="text-amber-300" />
                <h2 className="font-black text-base uppercase tracking-wider">
                  {hasControlAccess ? "Super Admin Console" : isDeptHead ? "Head Verification Hub" : "Notification Board"}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                {hasControlAccess && (
                  <div className="flex bg-red-900/50 p-1 rounded-xl border border-red-700/30">
                    <button onClick={() => setActiveSubTab("admit")} className={`p-2 rounded-lg transition-all cursor-pointer ${activeSubTab === "admit" ? "bg-white text-red-800 shadow-sm" : "text-amber-100/60"}`}><FaBell size={14} /></button>
                    <button onClick={() => setActiveSubTab("dept")} className={`p-2 rounded-lg transition-all cursor-pointer ${activeSubTab === "dept" ? "bg-white text-red-800 shadow-sm" : "text-amber-100/60"}`}><FaBuilding size={14} /></button>
                  </div>
                )}
                <button onClick={onClose} className="p-2 hover:bg-red-900 rounded-xl transition-colors cursor-pointer"><FaTimes size={18} /></button>
              </div>
            </div>

            <div className="w-full bg-white border-b border-gray-100 p-3 flex items-center justify-between gap-2 shadow-xs px-4">
              <div className="flex gap-2">
                <button onClick={() => setTimeFilter("hour")} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${timeFilter === "hour" ? "bg-red-50 border-red-800 text-red-800 shadow-xs" : "bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100"}`}><FaClock size={11} /> Hourly</button>
                <button onClick={() => setTimeFilter("week")} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border ${timeFilter === "week" ? "bg-red-50 border-red-800 text-red-800 shadow-xs" : "bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100"}`}><FaCalendarAlt size={11} /> Weekly</button>
              </div>

              {!hasControlAccess && !isDeptHead && (
                <button onClick={() => setOpenApplicationForm(true)} className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95">
                  <FaFileSignature size={12} /> APPLY REQUEST
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {activeSubTab === "admit" ? (
                activeAdmitRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center my-auto text-gray-400"><span className="text-xs font-black uppercase tracking-widest">No Active Requests</span></div>
                ) : (
                  activeAdmitRequests.map((item) => (
                    item.notification_type === "Welcome" || item.title?.toLowerCase().includes("welcome") ? (
                      <WelcomeCard key={item.id} item={item} userName={userName} handleManualDelete={handleManualDelete} />
                    ) : item.subject || item.message?.toLowerCase().includes("password") || item.notification_type === "password_reset" ? (
                      <PasswordResetCard
                        key={item.id}
                        item={item}
                        isDeptHead={isDeptHead}
                        hasControlAccess={hasControlAccess}
                        processingId={processingId}
                        passwordInputId={passwordInputId}
                        newPassword={newPassword}
                        setNewPassword={setNewPassword}
                        setPasswordInputId={setPasswordInputId}
                        handleManualDelete={handleManualDelete}
                        handleStatusUpdate={handleStatusUpdate}
                        handleFinalPasswordReset={handleFinalPasswordReset}
                      />
                    ) : (
                      <AdmitCard
                        key={item.id}
                        item={item}
                        hasControlAccess={hasControlAccess}
                        processingId={processingId}
                        handleManualDelete={handleManualDelete}
                        handleApproveAdmit={handleApproveAdmit}
                        handleDeclineAdmit={handleDeclineAdmit}
                      />
                    )
                  ))
                )
              ) : (
                hasControlAccess && (
                  activeDeptRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center my-auto text-gray-400"><span className="text-xs font-black uppercase tracking-widest">No Department Requests</span></div>
                  ) : (
                    activeDeptRequests.map((item) => (
                      <div key={item.id} className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <span className="bg-amber-50 text-amber-800 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-100">Structure Request</span>
                          <span className="text-[10px] font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">PENDING</span>
                        </div>
                        <div className="text-left">
                          <h4 className="text-sm font-black text-gray-800 uppercase">Create {item.department_name}</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-50">
                          <button type="button" disabled={processingId !== null} onClick={() => handleApproveDeptRequest(item.id)} className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[10px] font-black py-2.5 rounded-xl transition-all">ADD MODULE</button>
                          <button type="button" disabled={processingId !== null} onClick={() => handleDeclineDeptRequest(item.id)} className="bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-700 text-[10px] font-black py-2.5 rounded-xl transition-all">REMOVE</button>
                        </div>
                      </div>
                    ))
                  )
                )
              )}
            </div>
          </motion.div>
        </>
      )}

      <Application isOpen={openApplicationForm} onClose={() => setOpenApplicationForm(false)} defaultSubject="🔐 Request for password reset" />
    </AnimatePresence>
  );
}