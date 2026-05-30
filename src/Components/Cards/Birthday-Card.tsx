import React, { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export interface BirthdayStudent {
    name: string;
    className: string;
    department: string;
    dob: string;
    image: string;
}

interface BirthdayCardProps {
    isOpen: boolean;
    onClose: () => void;
    student: BirthdayStudent;
}

const BirthdayCard: React.FC<BirthdayCardProps> = ({ isOpen, onClose, student }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    const dateDetails = useMemo(() => {
        const [day, month, year] = student.dob.split("/");
        const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
        return {
            dayStr: dateObj.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase(),
            monthStr: dateObj.toLocaleDateString("en-US", { month: "long" }).toUpperCase(),
            yearStr: year,
            dateNum: day,
        };
    }, [student.dob]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Dark Blurred Background */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
                    />

                    {/* Main Premium Card */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 30 }}
                        transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-[420px] bg-[#FAFAFA] rounded-3xl shadow-[0_30px_60px_-15px_rgba(153,27,27,0.4)] overflow-hidden z-10 border border-white/50"
                    >
                        {/* Top Deep Red Section (The Premium Banner) */}
                        <div className="relative h-[220px] bg-gradient-to-br from-[#590000] via-[#800000] to-[#4a0000] rounded-b-[40px] flex flex-col items-center pt-8 overflow-hidden shadow-inner">
                            {/* Subtle Background Glow/Texture */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.1),_transparent_50%)]"></div>
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-5 right-5 text-white/60 hover:text-white bg-white/5 hover:bg-white/20 backdrop-blur-sm rounded-full p-2 transition-all duration-300 z-20"
                            >
                                <X size={18} />
                            </button>

                            {/* Happy Birthday Text (Spaced elegantly like the reference image) */}
                            <div className="flex items-center justify-center gap-4 text-[#E6C69A] font-serif tracking-[0.3em] uppercase text-xs z-10">
                                <span className="w-8 h-[1px] bg-[#E6C69A]/50"></span>
                                <span>Happy Birthday</span>
                                <span className="w-8 h-[1px] bg-[#E6C69A]/50"></span>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="px-8 pb-10 flex flex-col items-center relative z-10 -mt-24">
                            
                            {/* Premium Avatar Frame */}
                            <div className="relative mb-6 group">
                                {/* Golden/Warm Glow behind the image */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-[#800000] to-[#E6C69A] rounded-full blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                                
                                <div className="relative w-36 h-36 rounded-full border-[4px] border-white shadow-xl bg-white overflow-hidden ring-4 ring-[#800000]/10">
                                    <img
                                        src={student.image}
                                        alt={student.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                            </div>

                            {/* Student Name */}
                            <h2 className="text-3xl font-serif font-bold text-[#4a0000] text-center uppercase tracking-widest mb-3">
                                {student.name}
                            </h2>

                            {/* Subtitle / Department */}
                            <div className="flex items-center justify-center gap-3 text-gray-500 text-[10px] font-medium tracking-[0.2em] uppercase mb-6 w-full">
                                <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-gray-300"></span>
                                <span className="px-2">{student.department} • {student.className}</span>
                                <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-gray-300"></span>
                            </div>

                            {/* Elegant Quote */}
                            <p className="text-center text-gray-600/90 text-[15px] italic font-serif leading-relaxed mb-8 px-2">
                                "Wishing you a day filled with happiness and a year filled with joy! Heartiest wishes from the Gurukul Family."
                            </p>

                            {/* Premium Date Box (Inspired by your Black & Gold reference) */}
                            <div className="relative bg-gradient-to-b from-[#800000] to-[#590000] rounded-2xl w-full max-w-[280px] p-[2px] shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <div className="bg-[#FAFAFA] rounded-2xl px-6 py-4 flex flex-col items-center justify-center h-full w-full">
                                    <span className="text-[#800000] text-[10px] font-bold tracking-[0.25em] uppercase mb-2">
                                        {dateDetails.monthStr} {dateDetails.yearStr}
                                    </span>
                                    
                                    <div className="flex items-center justify-center w-full gap-5">
                                        <span className="text-gray-500 text-xs font-semibold tracking-widest uppercase text-right w-1/3">
                                            {dateDetails.dayStr}
                                        </span>
                                        <span className="w-[2px] h-8 bg-[#800000]/20 rounded-full"></span>
                                        <span className="text-[#4a0000] text-4xl font-serif font-bold leading-none w-1/3 text-left">
                                            {dateDetails.dateNum}
                                        </span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default BirthdayCard;