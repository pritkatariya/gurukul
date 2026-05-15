import { motion } from "motion/react";
import '../App.css'
import { GiHumanPyramid, GiPagoda } from "react-icons/gi";
import { GrCloudComputer } from "react-icons/gr";
import { BsAppleMusic } from "react-icons/bs";
import { FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Overview() {
    return (
        <div className="w-screen min-h-screen scrolls flex flex-col items-center overflow-x-hidden scrollbar-hide">
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-20 -left-20 w-72 h-72 md:w-125 md:h-125 bg-[#ffa0a0] rounded-full blur-[80px] md:blur-[100px] opacity-60"
                />
                <motion.div
                    animate={{ x: [0, -40, 0], y: [0, 60, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 -right-10 w-80 h-80 md:w-150 md:h-150 bg-[#a3c0ff] rounded-full blur-[100px] md:blur-[120px] opacity-50"
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
                        0% { 
                            background-position: 0 0; 
                        }
                        100% { 
                            /* 45px size che, etle exactly 45px move karva thi seamless loop thase */
                            background-position: 45px 45px; 
                        }
                    }
                `}</style>
            </div>

            <div className="fixed top-0 left-0 w-full z-50 p-2 md:p-4">
                <header className="w-full mx-auto rounded-2xl shadow-xl md:rounded-3xl h-16 md:h-20 bg-red-800 flex justify-between items-center px-4 md:px-8 border border-white/10 backdrop-blur-sm">

                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="flex items-center justify-center bg-linear-to-tl from-red-700/70 to-gray-200/70 border-2 border-red-900/50 rounded-xl w-10 h-10 md:w-12 md:h-12 shadow-inner">
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

            <div className="h-20 md:h-28 scrolls w-full"></div>

            <div className="relative scrolls grow w-full flex flex-col justify-center items-center px-6 py-10 md:py-20">
                <div className="flex flex-col gap-6 md:gap-8 justify-center items-center mb-16 md:mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="w-40 h-40 md:w-48 md:h-48 flex flex-col gap-1 justify-center items-center rounded-[40px] md:rounded-[50px] border-3 border-red-300 bg-linear-to-tl from-red-700/70 shadow-2xl"
                    >
                        <GiPagoda className="text-5xl md:text-6xl text-gray-50" />
                        <p className="text-base md:text-xl font-bold text-gray-50 uppercase tracking-widest">Gurukul</p>
                    </motion.div>

                    <div className="select-none text-center">
                        <h1 className="text-5xl md:text-7xl font-black text-white text-shadow-lg text-shadow-red-800/40 tracking-tighter">
                            GURUKUL
                        </h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14 w-full max-w-5xl pb-20">

                    <div className="group flex flex-col items-center gap-4">
                        <div className="w-40 h-40 md:w-44 md:h-44 flex flex-col gap-1 justify-center items-center rounded-[40px] md:rounded-[50px] border-3 border-green-300 bg-linear-to-tl from-green-500/80 shadow-xl group-hover:scale-110 transition-all duration-500 group-hover:shadow-green-500/40">
                            <GrCloudComputer className="text-4xl md:text-5xl text-gray-50" />
                            <p className="text-lg font-bold text-gray-50">Vision</p>
                        </div>
                    </div>

                    <div className="group flex flex-col items-center gap-4">
                        <div className="w-40 h-40 md:w-44 md:h-44 flex flex-col gap-1 justify-center items-center rounded-[40px] md:rounded-[50px] border-3 border-blue-300 bg-linear-to-tl from-blue-500/70 shadow-xl group-hover:scale-110 transition-all duration-500 group-hover:shadow-blue-500/40">
                            <BsAppleMusic className="text-4xl md:text-5xl text-gray-50" />
                            <p className="text-lg font-bold text-gray-50">Music</p>
                        </div>
                    </div>

                    <div className="group flex flex-col items-center gap-4 lg:col-span-1 sm:col-span-2 lg:sm:col-span-1">
                        <div className="w-40 h-40 md:w-44 md:h-44 flex flex-col gap-1 justify-center items-center rounded-[40px] md:rounded-[50px] border-3 border-orange-300 bg-linear-to-tl from-orange-500/70 shadow-xl group-hover:scale-110 transition-all duration-500 group-hover:shadow-orange-500/40 mx-auto">
                            <GiHumanPyramid className="text-4xl md:text-5xl text-gray-50" />
                            <p className="text-lg font-bold text-gray-50 text-center">Culture</p>
                        </div>
                    </div>

                </div>
            </div>
            <div className=" relative grow w-full flex gap-3 justify-center items-center px-6 py-10 md:py-20">
                <motion.div
                    initial={{ opacity: 1, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className={`w-250 h-200 rounded-[70px] bg-red-800 shadow-2xl p-10`}
                >
                    <div className={`w-full h-full bg-amber-50 overflow-hidden rounded-[50px] ishadow`}>
                        <img src="" className="w-full h-full" alt="" />
                    </div>
                </motion.div>
                <div className={`w-150 h-200 flex flex-col justify-center items-center gap-3`}>
                    <motion.div className={`w-150 h-full rounded-[70px] bg-red-800 p-7 shadow-2xl`}>

                        <div className={`w-full h-full bg-amber-50 rounded-[50px] overflow-hidden ishadow`}>
                            <img src="" className="w-full h-full" alt="" />
                        </div>
                    </motion.div>
                    <motion.div className={`w-150 h-full p-7 rounded-[70px] bg-red-800 shadow-2xl`}>
                        <div className={`w-full h-full bg-amber-50 overflow-hidden rounded-[50px] ishadow`}>
                            <img src="" className="w-full h-full" alt="" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}