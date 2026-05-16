import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import '../App.css';
import { GiHumanPyramid, GiPagoda } from "react-icons/gi";
import { GrCloudComputer } from "react-icons/gr";
import { BsAppleMusic } from "react-icons/bs";
import { FaArrowRight, FaPlay } from "react-icons/fa"; // 👈 FaPlay એડ કર્યો
import { Link } from "react-router-dom";

// ઈમેજ, લોગો અને ઓડિયો ફાઇલ ઇમ્પોર્ટ કરી
import LogoImg from "../assets/gurukul logo.png";
import BhayavadarImg from "../assets/Bhayavadar.png";
import SwaminarayanSound from "../assets/jay-swaminarayan.mp3";

export default function Overview() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const audio = new Audio(SwaminarayanSound);
        audio.volume = 0.7;

        audio.play().catch(() => {
            console.log("Autoplay blocked. Waiting for user interaction...");
        });

        const handleGlobalClick = () => {
            audio.play()
                .then(() => {
                    window.removeEventListener("click", handleGlobalClick);
                    window.removeEventListener("touchstart", handleGlobalClick);
                })
                .catch(err => console.log("Playback failed:", err));
        };

        window.addEventListener("click", handleGlobalClick);
        window.addEventListener("touchstart", handleGlobalClick);

        const timer = setTimeout(() => {
            setLoading(false);
        }, 2500);

        return () => {
            clearTimeout(timer);
            audio.pause();
            window.removeEventListener("click", handleGlobalClick);
            window.removeEventListener("touchstart", handleGlobalClick);
        };
    }, []);

    const handleStart = () => {
        const audio = new Audio(SwaminarayanSound);
        audio.volume = 0.7;

        audio.play()
            .then(() => {
            })
            .catch((error) => {
                console.log("Audio play failed:", error);
            });

        setLoading(false);
    };

    return (
        <>
            <AnimatePresence>
                {loading && (
                    <motion.div
                        className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-red-900 select-none"
                        exit={{
                            opacity: 0,
                            y: -50,
                            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
                        }}
                    >
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                            style={{
                                backgroundImage: `linear-gradient(to right, #ffffff 1.5px, transparent 1.5px), linear-gradient(to bottom, #ffffff 1.5px, transparent 1.5px)`,
                                backgroundSize: '45px 45px'
                            }}
                        />

                        <div className="relative flex flex-col items-center justify-center">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1.2, opacity: 0.2 }}
                                transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                                className="absolute w-64 h-64 bg-white rounded-full blur-3xl pointer-events-none"
                            />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.3, rotate: -10, filter: "blur(10px)" }}
                                animate={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
                                transition={{
                                    duration: 1.2,
                                    ease: [0.34, 1.56, 0.64, 1]
                                }}
                                className="w-32 h-32 md:w-40 md:h-40 bg-white/10 backdrop-blur-md rounded-[40px] border border-white/20 shadow-2xl flex items-center justify-center p-5 z-10"
                            >
                                <img src={LogoImg} className="w-full h-full object-contain" alt="Gurukul Main Logo" />
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                                className="text-white font-black text-3xl md:text-4xl mt-6 tracking-widest text-center"
                            >
                                GURUKUL
                            </motion.h2>
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                onClick={handleStart}
                                className="mt-6 px-6 py-3 bg-white text-red-900 font-bold rounded-full flex items-center gap-2 shadow-lg hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all cursor-pointer z-50 text-sm md:text-base"
                            >
                                <FaPlay className="text-xs" />
                                પ્રવેશ કરો (જય સ્વામિનારાયણ)
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="w-screen min-h-screen scrolls flex flex-col items-center overflow-x-hidden scrollbar-hide bg-gray-50">
                <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-20 -left-20 w-72 h-72 md:w-125 md:h-125 bg-[#ffa0a0] rounded-full blur-[80px] md:blur-[100px] opacity-40"
                    />
                    <motion.div
                        animate={{ x: [0, -40, 0], y: [0, 60, 0] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/2 -right-10 w-80 h-80 md:w-150 md:h-150 bg-[#a3c0ff] rounded-full blur-[100px] md:blur-[120px] opacity-30"
                    />
                </div>

                <div
                    className="fixed inset-0 -z-20 opacity-[0.04] pointer-events-none"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, #991b1b 1.5px, transparent 1.5px),
                            linear-gradient(to bottom, #991b1b 1.5px, transparent 1.5px)
                        `,
                        backgroundSize: '45px 45px',
                        animation: 'grid-move 15s linear infinite'
                    }}
                >
                    <style>{`
                        @keyframes grid-move {
                            0% { background-position: 0 0; }
                            100% { background-position: 45px 45px; }
                        }
                    `}</style>
                </div>

                {/* ટોપ હેડર બાર */}
                <div className="fixed top-0 left-0 w-full z-50 p-2 md:p-4">
                    <header className="w-full mx-auto rounded-2xl shadow-xl md:rounded-3xl h-16 md:h-20 bg-red-800 flex justify-between items-center px-4 md:px-8 border border-white/10 backdrop-blur-sm">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="flex items-center justify-center bg-linear-to-tl from-red-700/70 to-gray-200/70 border border-white/20 rounded-xl w-10 h-10 md:w-12 md:h-12 shadow-inner">
                                <GiPagoda className="text-xl md:text-2xl text-gray-50" />
                            </div>
                            <h1 className="text-lg md:text-2xl text-white font-bold tracking-tight">
                                <span className="block sm:hidden">GURUKUL</span>
                                <span className="hidden sm:block">GURUKUL-PLATFORM</span>
                            </h1>
                        </div>

                        <Link to={`/login`} className="group relative px-4 md:px-6 h-10 md:h-12 rounded-xl md:rounded-2xl bg-gray-50 cursor-pointer shadow-md hover:bg-white hover:scale-105 active:scale-95 transition-all duration-200 flex justify-center items-center gap-2">
                            <span className="text-sm md:text-base font-bold text-red-800">Login</span>
                            <FaArrowRight className="text-xs md:text-sm text-red-800 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </header>
                </div>

                <div className="h-20 md:h-28 w-full"></div>

                {/* સેન્ટ્રલ હીરો સેક્શન */}
                <div className="relative w-full flex flex-col justify-center items-center px-6 py-10 md:py-16">
                    <div className="flex flex-col gap-6 md:gap-8 justify-center items-center mb-16 md:mb-24">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="w-40 h-40 md:w-48 md:h-48 flex flex-col gap-1 justify-center items-center rounded-[40px] md:rounded-[50px] border-3 border-red-300 bg-linear-to-tl from-red-800 to-red-600 shadow-2xl"
                        >
                            <GiPagoda className="text-5xl md:text-6xl text-gray-50" />
                            <p className="text-base md:text-xl font-bold text-gray-50 uppercase tracking-widest">Gurukul</p>
                        </motion.div>

                        <div className="select-none text-center">
                            <h1 className="text-5xl md:text-7xl font-black text-red-800 tracking-tighter">
                                GURUKUL
                            </h1>
                        </div>
                    </div>

                    {/* ગ્રીડ કેટેગરીઝ કાર્ડ્સ */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14 w-full max-w-5xl pb-16">
                        <div className="group flex flex-col items-center gap-4">
                            <div className="w-40 h-40 md:w-44 md:h-44 flex flex-col gap-1 justify-center items-center rounded-[40px] md:rounded-[50px] border-3 border-green-300 bg-linear-to-tl from-green-600 to-green-400 shadow-xl group-hover:scale-110 transition-all duration-500 group-hover:shadow-green-500/30">
                                <GrCloudComputer className="text-4xl md:text-5xl text-gray-50" />
                                <p className="text-lg font-bold text-gray-50">Vision</p>
                            </div>
                        </div>

                        <div className="group flex flex-col items-center gap-4">
                            <div className="w-40 h-40 md:w-44 md:h-44 flex flex-col gap-1 justify-center items-center rounded-[40px] md:rounded-[50px] border-3 border-blue-300 bg-linear-to-tl from-blue-600 to-blue-400 shadow-xl group-hover:scale-110 transition-all duration-500 group-hover:shadow-blue-500/30">
                                <BsAppleMusic className="text-4xl md:text-5xl text-gray-50" />
                                <p className="text-lg font-bold text-gray-50">Music</p>
                            </div>
                        </div>

                        <div className="group flex flex-col items-center gap-4 lg:col-span-1 sm:col-span-2 lg:sm:col-span-1">
                            <div className="w-40 h-40 md:w-44 md:h-44 flex flex-col gap-1 justify-center items-center rounded-[40px] md:rounded-[50px] border-3 border-orange-300 bg-linear-to-tl from-orange-600 to-orange-400 shadow-xl group-hover:scale-110 transition-all duration-500 group-hover:shadow-orange-500/30 mx-auto">
                                <GiHumanPyramid className="text-4xl md:text-5xl text-gray-50" />
                                <p className="text-lg font-bold text-gray-50 text-center">Culture</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ઈમેજ સેક્શન */}
                <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-6 justify-center items-center px-6 py-10 md:pb-24">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="w-full lg:w-[60%] h-64 md:h-100 rounded-[40px] bg-red-800 shadow-2xl p-4 md:p-6"
                    >
                        <div className="w-full h-full bg-amber-50 overflow-hidden rounded-[30px] border border-red-950/20 shadow-inner">
                            <img src={BhayavadarImg} className="w-full h-full object-cover" alt="Bhayavadar Gurukul Overview" />
                        </div>
                    </motion.div>

                    <div className="w-full lg:w-[40%] flex flex-col sm:flex-row lg:flex-col gap-4 h-full">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="w-full h-48 md:h-47.5 rounded-[30px] bg-red-800 p-4 shadow-2xl"
                        >
                            <div className="w-full h-full bg-amber-50 rounded-[20px] overflow-hidden border border-red-950/20 shadow-inner">
                                <img src={BhayavadarImg} className="w-full h-full object-cover animate-pulse" alt="Gurukul Gallery 1" />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="w-full h-48 md:h-47.5 p-4 rounded-[30px] bg-red-800 shadow-2xl"
                        >
                            <div className="w-full h-full bg-amber-50 overflow-hidden rounded-[20px] border border-red-950/20 shadow-inner">
                                <img src={BhayavadarImg} className="w-full h-full object-cover" alt="Gurukul Gallery 2" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
}