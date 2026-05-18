import { FaTimes, FaClock, FaHeart } from "react-icons/fa";

interface WelcomeCardProps {
  item: any;
  userName: string;
  handleManualDelete: (id: number) => Promise<void>;
}

export default function WelcomeCard({ item, userName, handleManualDelete }: WelcomeCardProps) {
  return (
    <div className="bg-linear-to-br from-red-900 via-red-950 to-stone-950 border border-red-900 text-white rounded-3xl p-5 shadow-lg flex flex-col gap-4 relative overflow-hidden">
      <button onClick={() => handleManualDelete(item.id)} className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors cursor-pointer z-20">
        <FaTimes size={16} />
      </button>
      <div className="absolute -right-6 -bottom-6 text-white/5 pointer-events-none rotate-12">
        <FaHeart size={140} />
      </div>
      <div className="flex justify-between items-start">
        <span className="bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-amber-500/30">
          Welcome Message
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-400 mr-6">
          <FaClock size={9} /> Just Now
        </span>
      </div>
      <div className="text-left z-10">
        <h4 className="text-base font-black text-amber-100 uppercase tracking-tight">જય સ્વામિનારાયણ, {userName}!</h4>
        <p className="text-xs text-gray-300 font-medium leading-relaxed mt-2">
          {item.message || "ગુરુકુળ ડિજિટલ સિસ્ટમમાં તમારું હાર્દિક સ્વાગત છે. તમારું એકાઉન્ટ સફળતાપૂર્વક ક્રિએટ થઈ ગયું છે."}
        </p>
      </div>
      <button onClick={() => handleManualDelete(item.id)} className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black py-3 rounded-xl tracking-widest uppercase transition-all duration-200 active:scale-95 shadow-md cursor-pointer mt-1">
        Thank You 🙏
      </button>
    </div>
  );
}