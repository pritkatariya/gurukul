import { FaTimes, FaClock, FaCheck, FaBan } from "react-icons/fa";

interface AdmitCardProps {
  item: any;
  hasControlAccess: boolean;
  processingId: number | null;
  handleManualDelete: (id: number) => Promise<void>;
  handleApproveAdmit: (id: number) => Promise<void>;
  handleDeclineAdmit: (id: number) => Promise<void>;
}

export default function AdmitCard({
  item,
  hasControlAccess,
  processingId,
  handleManualDelete,
  handleApproveAdmit,
  handleDeclineAdmit
}: AdmitCardProps) {
  const title = item.name || item.full_name || item.username || item.title || item.subject || "Gurukul Request";
  const department = item.deptName || item.department_name || item.department || "Gurukul Log";
  const message = item.description || item.message || "";
  const suid = item.suid || item.user_id || "";
  const isPending = String(item.status || "").toLowerCase() === "pending";
  const isProcessing = processingId === item.id;

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
          {department}
        </span>

        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-700">
          <FaClock size={9} /> Live
        </span>
      </div>

      <div className="text-left">
        <h4 className="pr-8 text-sm font-black uppercase text-gray-800">
          {title}
        </h4>

        {suid && (
          <p className="mt-0.5 text-[10px] font-bold text-gray-400">
            SUID: {suid}
            {item.performance ? ` | ${String(item.performance).toUpperCase()} Perf.` : ""}
          </p>
        )}

        {message && (
          <p className="mt-2 rounded-xl bg-gray-50 p-2.5 text-[11px] leading-relaxed text-gray-500">
            {message}
          </p>
        )}
      </div>

      {hasControlAccess && isPending && !item.notification_type && (
        <div className="grid grid-cols-2 gap-2 border-t border-gray-50 pt-2">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => handleApproveAdmit(item.id)}
            className="flex items-center justify-center gap-1 rounded-xl bg-emerald-600 py-2.5 text-[10px] font-black text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
          >
            <FaCheck size={10} />
            {isProcessing ? "WAIT..." : "APPROVE"}
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => handleDeclineAdmit(item.id)}
            className="flex items-center justify-center gap-1 rounded-xl bg-red-50 py-2.5 text-[10px] font-black text-red-700 transition-all hover:bg-red-100 disabled:opacity-50"
          >
            <FaBan size={10} />
            DECLINE
          </button>
        </div>
      )}
    </div>
  );
}