import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaClock,
  FaBell,
  FaBuilding,
  FaCalendarAlt,
  FaFileSignature
} from "react-icons/fa";
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
  title?: string;
  subject?: string;
  message: string;
  is_read?: boolean;
  head_approved?: boolean | null;
  admin_approved?: boolean | null;
  notification_type?: string;
  created_at?: string;
  name?: string;
  suid?: string;
  performance?: string;
  description?: string;
  department_name?: string;
  deptName?: string;
  status?: string;
  username?: string;
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

const getApiUrl = () => {
  let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  if (API_URL.endsWith("/")) API_URL = API_URL.slice(0, -1);
  return API_URL;
};

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
  const [newPassword, setNewPassword] = useState("");

  const userRole = localStorage.getItem("user_role") || "USER";
  const userRaw = localStorage.getItem("user");

  let userId: number | null = null;
  let userName = "";
  let userDeptId = 0;

  if (userRaw) {
    try {
      const parsed = JSON.parse(userRaw);
      userId = parsed.id ? Number(parsed.id) : null;
      userName = parsed.username || parsed.full_name || "";
      userDeptId = parsed.department_id ? Number(parsed.department_id) : 0;
    } catch (error) {
      console.error(error);
    }
  }

  const roleCode = String(userRole).trim().toLowerCase();
  const hasControlAccess =
    userId === 123098 ||
    roleCode === "super_admin" ||
    roleCode === "super-admin" ||
    roleCode === "superadmin";

  const isDeptHead =
    roleCode === "department main" ||
    roleCode === "department_main" ||
    roleCode === "head1029";

  const handleManualDelete = async (id: number) => {
    try {
      const API_URL = getApiUrl();

      const response = await fetch(`${API_URL}/student/notification/delete/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      const data = await response.json();

      if (data.success) {
        setLiveDbNotifications((prev) => prev.filter((item) => item.id !== id));
        if (setNotifications) {
          setNotifications((prev) => prev.filter((item) => item.id !== id));
        }
      } else {
        toast.error(data.message || "Notification delete failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Notification delete failed");
    }
  };

  const loadLiveNotifications = async () => {
    try {
      const API_URL = getApiUrl();

      const params = new URLSearchParams({
        filterType: timeFilter,
        userId: String(userId || 0),
        departmentId: String(userDeptId || 0),
        role: userRole
      });

      const response = await fetch(`${API_URL}/student/get-filtered-notifications?${params.toString()}`);
      const data = await response.json();

      if (data.success && Array.isArray(data.notifications)) {
        setLiveDbNotifications(data.notifications);
      } else {
        setLiveDbNotifications([]);
      }
    } catch (error) {
      console.error(error);
      setLiveDbNotifications([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLiveNotifications();
    }
  }, [isOpen, userId, userDeptId, userRole, timeFilter]);

  const handleStatusUpdate = async (
    id: number,
    type: "head" | "admin",
    action: "approve" | "decline"
  ) => {
    try {
      setProcessingId(id);
      const API_URL = getApiUrl();

      const response = await fetch(`${API_URL}/student/notification/status-update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, action })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);

        if (action === "decline") {
          setLiveDbNotifications((prev) => prev.filter((item) => item.id !== id));
        } else {
          setLiveDbNotifications((prev) =>
            prev.map((item) =>
              item.id === id
                ? {
                    ...item,
                    [type === "head" ? "head_approved" : "admin_approved"]: true
                  }
                : item
            )
          );
        }

        await loadLiveNotifications();
      } else {
        toast.error(data.message || "Status update failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Status update failed");
    } finally {
      setProcessingId(null);
    }
  };

  const handleFinalPasswordReset = async (id: number) => {
    if (!newPassword.trim()) {
      toast.error("Please enter new password");
      return;
    }

    try {
      setProcessingId(id);
      const API_URL = getApiUrl();

      const response = await fetch(`${API_URL}/student/notification/status-update/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "password_reset",
          newPassword: newPassword.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setPasswordInputId(null);
        setNewPassword("");
        setLiveDbNotifications((prev) => prev.filter((item) => item.id !== id));
      } else {
        toast.error(data.message || "Password reset failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Password reset failed");
    } finally {
      setProcessingId(null);
    }
  };

  const getFilteredNotifications = (items: NotificationItem[]) => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    return items.filter((item) => {
      const itemTime = item.created_at ? new Date(item.created_at).getTime() : now;
      const timeDiff = now - itemTime;

      if (timeDiff > oneWeek) return false;
      if (timeFilter === "hour") return timeDiff <= oneHour;
      return timeDiff <= oneWeek;
    });
  };

  const handleApproveAdmit = async (targetId: number) => {
    if (processingId !== null) return;

    try {
      setProcessingId(targetId);
      await onApprove(targetId);

      if (setNotifications) {
        setNotifications((prev) => prev.filter((item) => item.id !== targetId));
      }
    } catch (error) {
      console.error(error);
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

      if (setNotifications) {
        setNotifications((prev) => prev.filter((item) => item.id !== targetId));
      }
    } catch (error) {
      console.error(error);
      toast.error("Operation error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveDeptRequest = async (targetId: number) => {
    if (processingId !== null) return;

    try {
      setProcessingId(targetId);
      await onApproveDept(targetId);
    } catch (error) {
      console.error(error);
      toast.error("Operation error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeclineDeptRequest = async (targetId: number) => {
    if (processingId !== null) return;

    try {
      setProcessingId(targetId);
      await onDeclineDept(targetId);
    } catch (error) {
      console.error(error);
      toast.error("Operation error");
    } finally {
      setProcessingId(null);
    }
  };

  const visibleLiveNotifications = liveDbNotifications.filter((item) => {
    const itemTitle = String(item.title || item.subject || "").toLowerCase();
    const itemType = String(item.notification_type || "").toLowerCase();

    if (hasControlAccess) {
      return item.head_approved === true || itemType === "welcome" || itemTitle.includes("welcome");
    }

    if (isDeptHead) {
      return (
        Number(item.department_id) === Number(userDeptId) ||
        Number(item.user_id) === Number(userId) ||
        itemType === "welcome" ||
        itemTitle.includes("welcome")
      );
    }

    return (
      Number(item.user_id) === Number(userId) ||
      itemType === "welcome" ||
      itemTitle.includes("welcome")
    );
  });

  const activeAdmitRequests = hasControlAccess
    ? getFilteredNotifications(notifications).filter(
        (item) => String(item.status || "").toLowerCase() === "pending"
      )
    : getFilteredNotifications(visibleLiveNotifications);

  const activeDeptRequests = deptNotifications.filter(
    (item) => item.status && item.status.toLowerCase() === "pending"
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 flex h-screen w-full flex-col border-l border-gray-100 bg-gray-50 shadow-2xl sm:w-112.5"
          >
            <div className="flex items-center justify-between bg-red-800 p-4 text-amber-100 shadow-md sm:p-5">
              <div className="flex min-w-0 items-center gap-2">
                <MdNotificationsNone size={24} className="shrink-0 text-amber-300" />
                <h2 className="truncate text-sm font-black uppercase tracking-wider sm:text-base">
                  {hasControlAccess
                    ? "Super Admin Console"
                    : isDeptHead
                    ? "Head Verification Hub"
                    : "Notification Board"}
                </h2>
              </div>

              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                {hasControlAccess && (
                  <div className="flex rounded-xl border border-red-700/30 bg-red-900/50 p-1">
                    <button
                      type="button"
                      onClick={() => setActiveSubTab("admit")}
                      className={`rounded-lg p-2 transition-all ${
                        activeSubTab === "admit"
                          ? "bg-white text-red-800 shadow-sm"
                          : "text-amber-100/60"
                      }`}
                    >
                      <FaBell size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveSubTab("dept")}
                      className={`rounded-lg p-2 transition-all ${
                        activeSubTab === "dept"
                          ? "bg-white text-red-800 shadow-sm"
                          : "text-amber-100/60"
                      }`}
                    >
                      <FaBuilding size={14} />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl p-2 transition-colors hover:bg-red-900"
                >
                  <FaTimes size={18} />
                </button>
              </div>
            </div>

            <div className="flex w-full items-center justify-between gap-2 border-b border-gray-100 bg-white px-3 py-3 shadow-xs sm:px-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTimeFilter("hour")}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-black uppercase tracking-wider transition-all sm:px-4 ${
                    timeFilter === "hour"
                      ? "border-red-800 bg-red-50 text-red-800 shadow-xs"
                      : "border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  <FaClock size={11} /> Hourly
                </button>

                <button
                  type="button"
                  onClick={() => setTimeFilter("week")}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-black uppercase tracking-wider transition-all sm:px-4 ${
                    timeFilter === "week"
                      ? "border-red-800 bg-red-50 text-red-800 shadow-xs"
                      : "border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  <FaCalendarAlt size={11} /> Weekly
                </button>
              </div>

              {!hasControlAccess && !isDeptHead && (
                <button
                  type="button"
                  onClick={() => setOpenApplicationForm(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-2 text-xs font-black uppercase tracking-wider text-stone-950 shadow-xs transition-all hover:bg-amber-600 active:scale-95"
                >
                  <FaFileSignature size={12} />
                  <span className="hidden sm:inline">Apply Request</span>
                  <span className="sm:hidden">Apply</span>
                </button>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
              {activeSubTab === "admit" ? (
                activeAdmitRequests.length === 0 ? (
                  <div className="my-auto flex flex-col items-center justify-center text-gray-400">
                    <span className="text-xs font-black uppercase tracking-widest">
                      No Active Requests
                    </span>
                  </div>
                ) : (
                  activeAdmitRequests.map((item) => {
                    const title = String(item.title || item.subject || "").toLowerCase();
                    const type = String(item.notification_type || "").toLowerCase();
                    const message = String(item.message || "").toLowerCase();

                    if (type === "welcome" || title.includes("welcome")) {
                      return (
                        <WelcomeCard
                          key={item.id}
                          item={item}
                          userName={userName}
                          handleManualDelete={handleManualDelete}
                        />
                      );
                    }

                    if (item.subject || message.includes("password") || type === "password_reset") {
                      return (
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
                      );
                    }

                    return (
                      <AdmitCard
                        key={item.id}
                        item={item}
                        hasControlAccess={hasControlAccess}
                        processingId={processingId}
                        handleManualDelete={handleManualDelete}
                        handleApproveAdmit={handleApproveAdmit}
                        handleDeclineAdmit={handleDeclineAdmit}
                      />
                    );
                  })
                )
              ) : (
                hasControlAccess &&
                (activeDeptRequests.length === 0 ? (
                  <div className="my-auto flex flex-col items-center justify-center text-gray-400">
                    <span className="text-xs font-black uppercase tracking-widest">
                      No Department Requests
                    </span>
                  </div>
                ) : (
                  activeDeptRequests.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-amber-800">
                          Structure Request
                        </span>
                        <span className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-700">
                          Pending
                        </span>
                      </div>

                      <div className="text-left">
                        <h4 className="text-sm font-black uppercase text-gray-800">
                          Create {item.department_name}
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 gap-2 border-t border-gray-50 pt-2">
                        <button
                          type="button"
                          disabled={processingId !== null}
                          onClick={() => handleApproveDeptRequest(item.id)}
                          className="rounded-xl bg-emerald-600 py-2.5 text-[10px] font-black text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
                        >
                          Add Module
                        </button>

                        <button
                          type="button"
                          disabled={processingId !== null}
                          onClick={() => handleDeclineDeptRequest(item.id)}
                          className="rounded-xl bg-red-50 py-2.5 text-[10px] font-black text-red-700 transition-all hover:bg-red-100 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                ))
              )}
            </div>
          </motion.div>
        </>
      )}

      <Application
        isOpen={openApplicationForm}
        onClose={() => setOpenApplicationForm(false)}
        defaultSubject="Request for password reset"
      />
    </AnimatePresence>
  );
}