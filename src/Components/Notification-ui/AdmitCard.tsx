import { FaTimes, FaClock } from "react-icons/fa";

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
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex flex-col gap-3 relative">
      <button onClick={() => handleManualDelete(item.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors cursor-pointer">
        <FaTimes size={14} />
      </button>
      <div className="flex justify-between items-center pr-6">
        <span className="bg-red-50 text-red-800 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-red-100">
          {item.deptName || item.department_name || item.title || "GURUKUL LOG"}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
          <FaClock size={9} /> Live
        </span>
      </div>
      <div className="text-left">
        <h4 className="text-sm font-black text-gray-800 uppercase">{item.name || item.title}</h4>
        {(item.suid || item.user_id) && (
          <p className="text-[10px] text-gray-400 font-bold mt-0.5">
            SUID: {item.suid || item.user_id} {item.performance && `| ${item.performance?.toUpperCase()} Perf.`}
          </p>
        )}
        {(item.description || item.message) && (
          <p className="text-[11px] text-gray-500 bg-gray-50 p-2.5 rounded-xl mt-2">
            "{item.description || item.message}"
          </p>
        )}
      </div>
      {hasControlAccess && item.status?.toLowerCase() === "pending" && !item.notification_type && (
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-50">
          <button disabled={processingId === item.id} onClick={() => handleApproveAdmit(item.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black py-2 rounded-xl transition-all">
            APPROVE USER
          </button>
          <button disabled={processingId === item.id} onClick={() => handleDeclineAdmit(item.id)} className="bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-black py-2 rounded-xl transition-all">
            DECLINE
          </button>
        </div>
      )}
    </div>
  );
}