import { FaTimes, FaClock, FaHeart } from "react-icons/fa";

interface WelcomeCardProps {
  item: any;
  userName: string;
  handleManualDelete: (id: number) => Promise<void>;
}

export default function WelcomeCard({
  item,
  userName,
  handleManualDelete
}: WelcomeCardProps) {
  const displayName = userName || item.name || item.username || "Sevak";
  const message =
    item.message ||
    "Gurukul digital system ma tamaru account successfully create thai gayu chhe.";

  return (
    <div className="relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-red-900 bg-linear-to-br from-red-900 via-red-950 to-stone-950 p-5 text-white shadow-lg">
      <button
        type="button"
        onClick={() => handleManualDelete(item.id)}
        className="absolute right-4 top-4 z-20 text-white/60 transition-colors hover:text-white"
      >
        <FaTimes size={16} />
      </button>

      <div className="pointer-events-none absolute -bottom-6 -right-6 rotate-12 text-white/5">
        <FaHeart size={140} />
      </div>

      <div className="flex items-start justify-between gap-3 pr-8">
        <span className="rounded-full border border-amber-500/30 bg-amber-500/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-amber-300">
          Welcome Message
        </span>

        <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-black text-amber-400">
          <FaClock size={9} /> Live
        </span>
      </div>

      <div className="z-10 text-left">
        <h4 className="text-base font-black uppercase tracking-tight text-amber-100">
          Jai Swaminarayan, {displayName}!
        </h4>

        <p className="mt-2 text-xs font-medium leading-relaxed text-gray-300">
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={() => handleManualDelete(item.id)}
        className="z-10 mt-1 w-full rounded-xl bg-amber-500 py-3 text-xs font-black uppercase tracking-widest text-stone-950 shadow-md transition-all duration-200 hover:bg-amber-600 active:scale-95"
      >
        Thank You
      </button>
    </div>
  );
}