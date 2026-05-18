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
  handleStatusUpdate: (id: number, type: 'head' | 'admin', action: 'approve' | 'decline') => Promise<void>;
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
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex flex-col gap-3 relative">
      <button onClick={() => handleManualDelete(item.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors cursor-pointer">
        <FaTimes size={14} />
      </button>
      <div className="flex justify-between items-center pr-6">
        <span className="bg-red-50 text-red-800 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-red-100">
          {item.subject || "🔐 REQUEST FOR PASSWORD RESET"}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
          <FaClock size={9} /> Live
        </span>
      </div>
      <div className="text-left">
        <h4 className="text-sm font-black text-gray-800 uppercase">{item.username || item.title}</h4>
        {(item.suid || item.user_id) && <p className="text-[10px] text-gray-400 font-bold mt-0.5">SUID: {item.suid || item.user_id}</p>}
        {item.message && <p className="text-[11px] text-gray-500 bg-gray-50 p-2.5 rounded-xl mt-2">"{item.message}"</p>}
      </div>

      <div className="pt-2 border-t border-gray-50 flex flex-col gap-2">
        {isDeptHead && item.head_approved === true && item.admin_approved === true ? (
          <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl flex flex-col gap-2">
            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wide block">🎉 એડમિન મંજૂરી મળી ગઈ! સેવકનો નવો પાસવર્ડ સેટ કરો:</span>
            {passwordInputId === item.id ? (
              <div className="flex flex-col gap-2">
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter Secure New Password" className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-red-800" />
                <button type="button" disabled={processingId === item.id} onClick={() => handleFinalPasswordReset(item.id)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black py-2 rounded-xl uppercase tracking-wider transition-all">
                  SAVE & UPDATE IN USERS
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setPasswordInputId(item.id)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black py-2 rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer">
                <FaKey size={10}/> CHANGE PASSWORD NOW
              </button>
            )}
          </div>
        ) : (
          <>
            {isDeptHead && item.head_approved === null && (
              <div className="grid grid-cols-2 gap-2">
                <button type="button" disabled={processingId === item.id} onClick={() => handleStatusUpdate(item.id, 'head', 'approve')} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"><FaCheck size={10}/> APPROVE HEAD</button>
                <button type="button" disabled={processingId === item.id} onClick={() => handleStatusUpdate(item.id, 'head', 'decline')} className="bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-black py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"><FaBan size={10}/> DECLINE</button>
              </div>
            )}

            {hasControlAccess && item.head_approved === true && item.admin_approved === null && (
              <div className="grid grid-cols-2 gap-2">
                <button type="button" disabled={processingId === item.id} onClick={() => handleStatusUpdate(item.id, 'admin', 'approve')} className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"><FaCheck size={10}/> GRANT ADMIN PERMISSION</button>
                <button type="button" disabled={processingId === item.id} onClick={() => handleStatusUpdate(item.id, 'admin', 'decline')} className="bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-black py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"><FaBan size={10}/> DECLINE REQUEST</button>
              </div>
            )}

            {isDeptHead && item.head_approved === true && item.admin_approved === null && (
              <div className="w-full text-center text-[10px] font-black bg-gray-50 text-gray-400 border border-gray-100 py-2.5 rounded-2xl tracking-widest uppercase">FORWARDED TO PRINCIPAL</div>
            )}

            {!hasControlAccess && !isDeptHead && (
              <div className="w-full text-center text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-100 py-2.5 rounded-2xl tracking-widest uppercase">⏳ Waiting for Verification ({item.head_approved ? "Admin Pending" : "Head Pending"})</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}