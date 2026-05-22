import { FaTimes, FaClock, FaCheck, FaBan, FaKey } from "react-icons/fa";

interface PasswordResetCardProps {
  item: any;
  isDeptHead: boolean;
  hasControlAccess: boolean;
  processingId: number | null;
  passwordInputId: number | null;
  newPassword: string;
  setNewPassword: (val: string) => void;
  setPasswordInputId: (id: number | null) => void;
  handleManualDelete: (id: number) => Promise<void>;
  handleStatusUpdate: (
    id: number,
    type: "head" | "admin",
    action: "approve" | "decline"
  ) => Promise<void>;
  handleFinalPasswordReset: (id: number) => Promise<void>;
}

export default function PasswordResetCard({
  item,
  isDeptHead,
  hasControlAccess,
  processingId,
  passwordInputId,
  newPassword,
  setNewPassword,
  setPasswordInputId,
  handleManualDelete,
  handleStatusUpdate,
  handleFinalPasswordReset
}: PasswordResetCardProps) {
  const subject = item.subject || item.title || "Request For Password Reset";
  const username = item.username || item.name || "User";
  const suid = item.suid || item.user_id || "";
  const department = item.department_name || item.deptName || "Department";
  const isProcessing = processingId === item.id;

  const headApproved = item.head_approved === true;
  const adminApproved = item.admin_approved === true;

  return (
    <div className="relative flex flex-col gap-3 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
      <button
        type="button"
        onClick={() => handleManualDelete(item.id)}
        className="absolute right-4 top-4 z-10 text-gray-400 transition-colors hover:text-red-600"
      >
        <FaTimes size={14} />
      </button>

      <div className="flex items-center justify-between gap-3 pr-7">
        <span className="min-w-0 truncate rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-red-800">
          {subject}
        </span>

        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-700">
          <FaClock size={9} /> Live
        </span>
      </div>

      <div className="text-left">
        <h4 className="pr-8 text-sm font-black uppercase text-gray-800">
          {username}
        </h4>

        <p className="mt-0.5 text-[10px] font-bold text-gray-400">
          {suid ? `SUID: ${suid}` : "SUID: -"} | Dept: {department}
        </p>

        {item.message && (
          <p className="mt-2 rounded-xl bg-gray-50 p-2.5 text-[11px] leading-relaxed text-gray-500">
            {item.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-gray-50 pt-2">
        {isDeptHead && headApproved && adminApproved ? (
          <div className="flex flex-col gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
            <span className="block text-[10px] font-black uppercase tracking-wide text-emerald-800">
              Admin permission received. Set new password.
            </span>

            {passwordInputId === item.id ? (
              <div className="flex flex-col gap-2">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Enter new password"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleFinalPasswordReset(item.id)}
                  className="w-full rounded-xl bg-emerald-600 py-2 text-[10px] font-black uppercase tracking-wider text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isProcessing ? "UPDATING..." : "SAVE PASSWORD"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPasswordInputId(item.id)}
                className="flex w-full items-center justify-center gap-1 rounded-xl bg-emerald-600 py-2 text-[10px] font-black uppercase tracking-wider text-white transition-all hover:bg-emerald-700"
              >
                <FaKey size={10} /> CHANGE PASSWORD NOW
              </button>
            )}
          </div>
        ) : (
          <>
            {isDeptHead && !headApproved && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleStatusUpdate(item.id, "head", "approve")}
                  className="flex items-center justify-center gap-1 rounded-xl bg-emerald-600 py-2.5 text-[10px] font-black text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
                >
                  <FaCheck size={10} />
                  {isProcessing ? "WAIT..." : "APPROVE HEAD"}
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleStatusUpdate(item.id, "head", "decline")}
                  className="flex items-center justify-center gap-1 rounded-xl bg-red-50 py-2.5 text-[10px] font-black text-red-700 transition-all hover:bg-red-100 disabled:opacity-50"
                >
                  <FaBan size={10} /> DECLINE
                </button>
              </div>
            )}

            {hasControlAccess && headApproved && !adminApproved && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleStatusUpdate(item.id, "admin", "approve")}
                  className="flex items-center justify-center gap-1 rounded-xl bg-blue-600 py-2.5 text-[10px] font-black text-white transition-all hover:bg-blue-700 disabled:opacity-50"
                >
                  <FaCheck size={10} />
                  {isProcessing ? "WAIT..." : "GRANT ADMIN"}
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleStatusUpdate(item.id, "admin", "decline")}
                  className="flex items-center justify-center gap-1 rounded-xl bg-red-50 py-2.5 text-[10px] font-black text-red-700 transition-all hover:bg-red-100 disabled:opacity-50"
                >
                  <FaBan size={10} /> DECLINE
                </button>
              </div>
            )}

            {isDeptHead && headApproved && !adminApproved && (
              <div className="w-full rounded-2xl border border-gray-100 bg-gray-50 py-2.5 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                Forwarded to Super Admin
              </div>
            )}

            {hasControlAccess && !headApproved && (
              <div className="w-full rounded-2xl border border-amber-100 bg-amber-50 py-2.5 text-center text-[10px] font-black uppercase tracking-widest text-amber-800">
                Waiting for Head Approval
              </div>
            )}

            {!hasControlAccess && !isDeptHead && (
              <div className="w-full rounded-2xl border border-amber-100 bg-amber-50 py-2.5 text-center text-[10px] font-black uppercase tracking-widest text-amber-800">
                Waiting For Verification ({headApproved ? "Admin Pending" : "Head Pending"})
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}