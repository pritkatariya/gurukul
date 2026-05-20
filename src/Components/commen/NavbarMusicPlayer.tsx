import { useState, useEffect } from "react";
import { useMusic } from "../MusicProvider";
import { FaPlay, FaPause, FaForward, FaBackward, FaSearch, FaMusic, FaChevronDown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion"; // 🎯 જેસ્ચર્સ અને સ્વાઇપ માટે

type Track = {
    id: number;
    title: string;
    artist: string;
    audio_url: string;
};

export default function NavbarMusicPlayer() {
    const { isMusicPlaying, toggleMusic, playMusic } = useMusic();
    const [trackList, setTrackList] = useState<Track[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    
    // 🎯 મોબાઈલ બોટમ શીટ ઓપન/ક્લોઝ સ્ટેટ
    const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

    let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    if (API_URL.endsWith("/")) API_URL = API_URL.slice(0, -1);

    useEffect(() => {
        fetch(`${API_URL}/music/songs`)
            .then((res) => {
                const contentType = res.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("Server sent HTML instead of JSON.");
                }
                return res.json();
            })
            .then((data) => {
                if (data.success && data.songs && data.songs.length > 0) {
                    setTrackList(data.songs);
                }
            })
            .catch((err) => console.error("Error loading tracks:", err));
    }, [API_URL]);

    const handleTrackSelect = (index: number) => {
        if (index < 0 || index >= trackList.length) return;
        setCurrentIndex(index);
        setShowDropdown(false);

        const selectedTrack = trackList[index];
        if (selectedTrack) {
            window.dispatchEvent(
                new CustomEvent("change-gurukul-track", { detail: selectedTrack.audio_url })
            );
            playMusic();
        }
    };

    const handleNext = () => {
        if (trackList.length === 0) return;
        const current = currentIndex ?? 0;
        const nextIdx = (current + 1) % trackList.length;
        handleTrackSelect(nextIdx);
    };

    const handlePrev = () => {
        if (trackList.length === 0) return;
        const current = currentIndex ?? 0;
        const prevIdx = current === 0 ? trackList.length - 1 : current - 1;
        handleTrackSelect(prevIdx);
    };

    const filteredTracks = trackList.filter((track) =>
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const currentTrack = currentIndex !== null ? trackList[currentIndex] : null;

    // 🎯 મુખ્ય કંટ્રોલ કમ્પોનન્ટ (જે ડેસ્કટોપ અને મોબાઈલ શીટ બંનેમાં રીયુઝ થશે)
    const PlayerControls = () => (
        <>
            {/* 🔍 સર્ચ ઇનપુટ */}
            <div className="relative w-full">
                <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5">
                    <FaSearch className="mr-2 text-xs text-gray-400" />
                    <input
                        type="text"
                        placeholder="શોધો કીર્તન / ધૂન..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        className="w-full bg-transparent text-xs font-bold text-gray-800 outline-none placeholder-gray-400"
                    />
                    <FaChevronDown 
                        className="text-[10px] text-gray-400 cursor-pointer" 
                        onClick={() => setShowDropdown(!showDropdown)} 
                    />
                </div>

                {showDropdown && filteredTracks.length > 0 && (
                    <div className="absolute left-0 right-0 top-9 z-9999 max-h-40 overflow-y-auto rounded-xl border border-gray-100 bg-white p-1 shadow-xl">
                        {filteredTracks.map((track) => (
                            <button
                                key={track.id}
                                type="button"
                                onClick={() => handleTrackSelect(trackList.indexOf(track))}
                                className="flex w-full flex-col rounded-lg px-3 py-1.5 text-left hover:bg-red-50 text-gray-700 transition-colors"
                            >
                                <span className="text-xs font-black text-red-950">{track.title}</span>
                                <span className="text-[10px] text-gray-400">{track.artist}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* 🎵 કરન્ટલી પ્લેઇંગ સોંગ */}
            <div className="w-full text-center py-1 border-b border-gray-100">
                <p className="text-xs font-black text-red-900 truncate flex items-center justify-center gap-1">
                    <FaMusic className={`text-[10px] ${isMusicPlaying ? "animate-bounce" : ""}`} />
                    {currentTrack ? currentTrack.title : "Default Bhajan"}
                </p>
                <p className="text-[10px] text-gray-400 truncate">
                    {currentTrack ? currentTrack.artist : "Shree Swaminarayan Gurukul"}
                </p>
            </div>

            {/* 🎮 પ્લેયર્સ કંટ્રોલ બટન */}
            <div className="flex items-center justify-center gap-4 mt-0.5">
                <button 
                    type="button" 
                    onClick={handlePrev} 
                    className="text-gray-500 hover:text-red-800 hover:scale-110 active:scale-95 transition-all"
                >
                    <FaBackward className="text-xs" />
                </button>

                <button
                    type="button"
                    onClick={toggleMusic}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-red-800 text-white shadow-md hover:bg-red-700 active:scale-95 transition-all"
                >
                    {isMusicPlaying ? <FaPause className="text-[10px]" /> : <FaPlay className="text-[10px] pl-0.5" />}
                </button>

                <button 
                    type="button" 
                    onClick={handleNext} 
                    className="text-gray-500 hover:text-red-800 hover:scale-110 active:scale-95 transition-all"
                >
                    <FaForward className="text-xs" />
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* 💻 ૧. ડેસ્કટોપ વ્યૂ (મોટા ડિવાઇસ પર જ દેખાશે) */}
            <div className="hidden md:flex flex-col items-center gap-2 w-full bg-white p-1 rounded-xl">
                <PlayerControls />
            </div>

            {/* 📱 ૨. મોબાઈલ વ્યુ (નાની સ્ક્રીન પર બોટમ મિની પ્લેયર તરીકે દેખાશે) */}
            <div className="block md:hidden fixed bottom-0 left-0 right-0 z-[999] bg-white border-t border-slate-100 px-4 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-2xl cursor-pointer"
                 onClick={() => setIsMobileSheetOpen(true)}>
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 overflow-hidden w-[65%]">
                        <FaMusic className={`text-red-800 text-xs shrink-0 ${isMusicPlaying ? "animate-spin" : ""}`} style={{ animationDuration: '4s' }} />
                        <div className="overflow-hidden">
                            <p className="text-xs font-black text-slate-800 truncate">{currentTrack ? currentTrack.title : "Default Bhajan"}</p>
                            <p className="text-[10px] text-slate-400 truncate">{currentTrack ? currentTrack.artist : "Shree Swaminarayan Gurukul"}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button type="button" onClick={toggleMusic} className="w-7 h-7 rounded-full bg-red-800 text-white flex items-center justify-center text-[10px] shadow-sm">
                            {isMusicPlaying ? <FaPause /> : <FaPlay className="pl-0.5" />}
                        </button>
                        <button type="button" onClick={handleNext} className="text-slate-500 active:scale-90">
                            <FaForward className="text-xs" />
                        </button>
                    </div>
                </div>
                {/* મિની નોચ લાઇન જે બતાવે છે કે આને ઉપર ખેંચી શકાય છે */}
                <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-2" />
            </div>

            {/* 🎯 ૩. મોબાઈલ સ્વાઈપેબલ ફૂલ બોટમ શીટ (Drag & Swipe logic) */}
            <AnimatePresence>
                {isMobileSheetOpen && (
                    <>
                        {/* બેકગ્રાઉન્ડ ડાર્ક બ્લર પડદો */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.4 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileSheetOpen(false)}
                            className="fixed inset-0 bg-black z-[1000] md:hidden"
                        />

                        {/* અસલી ખેંચી શકાય તેવું કાર્ડ શીટ */}
                        <motion.div
                            drag="y" // 🎯 માત્ર ઉભી દિશામાં જ ડ્રેગ થશે
                            dragConstraints={{ top: 0, bottom: 0 }}
                            dragElastic={{ top: 0.1, bottom: 0.75 }} // નીચે ખેંચો તો મસ્ત સ્પ્રિંગ ઇફેક્ટ આવશે
                            onDragEnd={(_e, info) => {
                                // જો યુજરે ૧20px થી વધારે નીચે ખેંચ્યું હોય તો આખું પ્લેયર બંધ થઈ જશે
                                if (info.offset.y > 120) {
                                    setIsMobileSheetOpen(false);
                                }
                            }}
                            initial={{ y: "100%" }} // નીચેથી ઉપર આવશે
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 220 }}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] p-6 shadow-2xl z-[1001] flex flex-col gap-5 pb-10 md:hidden border-t border-slate-100"
                        >
                            {/* 🎯 ડ્રેગ હેન્ડલ બાર (યુઝર આ લાઈનને પકડીને નીચે સ્લાઇડ કરી શકે) */}
                            <div className="w-12 h-1.5 bg-slate-300/80 rounded-full mx-auto mb-1 cursor-grab active:cursor-grabbing" />
                            
                            <div className="flex justify-between items-center px-1">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                    <FaMusic className="text-red-800" /> Now Playing
                                </h3>
                                <button 
                                    onClick={() => setIsMobileSheetOpen(false)}
                                    className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full active:scale-95"
                                >
                                    Close
                                </button>
                            </div>

                            {/* પ્લેયર અને સર્ચ બાર કંટ્રોલ્સ */}
                            <div className="flex flex-col gap-4">
                                <PlayerControls />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}