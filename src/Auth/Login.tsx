import { motion } from "motion/react";
import { FaUserAlt, FaLock, FaArrowRight } from "react-icons/fa";
import Logo from '../assets/gurukul logo.png';
import '../App.css';
import Input from "../Components/commen/Input";
import { FaVolumeDown, FaVolumeUp } from "react-icons/fa";
import ElasticSlider from "../Components/ElasticSlider";
import { useMusic } from "../Components/MusicProvider";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Application from "../pages/Application";

export default function Login() {
    const { isMusicPlaying, toggleMusic, volume, setVolume } = useMusic();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState("");

    const sidebarRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                setIsSidebarOpen(false);
            }
        }
        if (isSidebarOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isSidebarOpen]);

    const preventDefault = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            toast.error('Please enter both username and password');
            return;
        }

        if (username === 'super-admin' && password === 'admin123') {
            toast.success('Super Admin Login Successful! 🎉');
            localStorage.setItem('user', JSON.stringify({
                id: 123098, username: 'super-admin', role: 'admin', full_name: 'Super Admin Principal', department_id: 0, profile_image_url: null
            }));
            localStorage.setItem('user_role', 'SUPER_ADMIN');
            navigate("/deshbord");
            return;
        }

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                toast.success('Login Successful! 🎉');
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('user_role', data.user_role || data.user.role || "user");
                navigate("/deshbord");
            } else {
                toast.error(data.message || 'Invalid credentials');
            }
        } catch (error) {
            toast.error('Server offline or connection refused');
        }
    };

    const openApplicationWithSubject = (subjectText: string) => {
        setSelectedSubject(subjectText);
        setIsSidebarOpen(true);
    };

    return (
        <div className="w-screen min-h-screen flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20 overflow-hidden relative selection:bg-red-200 p-6 scrollbar-hide">
            <div className="fixed left-0 top-4 z-9999 flex flex-col -translate-x-55.5 items-center gap-3 rounded-r-2xl bg-white py-2 pl-4 pr-5 shadow-2xl ring-1 ring-red-100 transition-transform duration-300 hover:translate-x-0 md:top-6">
                <ElasticSlider
                    defaultValue={volume}
                    startingValue={0}
                    maxValue={100}
                    isStepped
                    stepSize={5}
                    leftIcon={<FaVolumeDown className="text-xs" />}
                    rightIcon={<FaVolumeUp className="text-xs" />}
                    onChange={setVolume}
                    className="w-36"
                />

                <button
                    type="button"
                    onClick={toggleMusic}
                    className="flex h-10 min-w-16 items-center justify-center rounded-full bg-red-800 px-4 text-sm font-bold text-white shadow-md transition-all hover:bg-red-700 active:scale-95"
                >
                    {isMusicPlaying ? "Stop" : "Start"}
                </button>
            </div>
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-20 -left-20 w-72 h-72 md:w-125 md:h-125 bg-red-100 rounded-full blur-[80px] md:blur-[100px] opacity-60"
                />
                <motion.div
                    animate={{ x: [0, -40, 0], y: [0, 60, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 -right-10 w-80 h-80 md:w-150 md:h-150 bg-blue-50 rounded-full blur-[100px] md:blur-[120px] opacity-50"
                />
            </div>

            <div className="fixed inset-0 -z-20 opacity-[0.05] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(to right, #991b1b 1px, transparent 1px), linear-gradient(to bottom, #991b1b 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }}
            />

            <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:flex w-full max-w-lg aspect-square p-10 rounded-[3rem] flex-col gap-8 bg-white/60 backdrop-blur-2xl shadow-[0_32px_64px_rgba(153,27,27,0.08)] border border-white/40 z-10 justify-center items-center text-center"
            >
                <div className="w-64 h-64 flex justify-center items-center p-4">
                    <img src={Logo} className="w-full h-full object-contain drop-shadow-2xl" alt="Gurukul Logo" />
                </div>
                <div className="w-full pt-8 border-t-2 border-red-800/20">
                    <h1 className="text-2xl md:text-3xl text-red-900 font-medium leading-relaxed">
                        Please input your <br />
                        <span className="font-black uppercase tracking-tight text-red-700">I AM GURUKUL SEVAK</span> <br />
                        Identity
                    </h1>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md flex flex-col justify-center items-center p-8 md:p-12 rounded-[3rem] bg-white/80 backdrop-blur-2xl shadow-[0_32px_64px_rgba(153,27,27,0.12)] border border-red-100 z-10"
            >
                <img src={Logo} className="w-16 mb-4 lg:hidden" alt="Logo" />

                <div className="text-center mb-10">
                    <h2 className="text-5xl font-black text-red-800 tracking-tighter">LOGIN</h2>
                    <div className="h-1.5 w-12 bg-red-800 mx-auto mt-2 rounded-full" />
                </div>

                <form className="w-full flex flex-col gap-5" onSubmit={preventDefault}>
                    <Input
                        icon={<FaUserAlt className="text-red-800/50" />}
                        placeholder="Username"
                        className="w-full h-16 rounded-2xl border-gray-100 focus:border-red-300 transition-all"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <Input
                        icon={<FaLock className="text-red-800/50" />}
                        placeholder="Password"
                        type="password"
                        className="w-full h-16 rounded-2xl border-gray-100 focus:border-red-300 transition-all"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button type="submit" className="w-full h-16 mt-4 rounded-2xl bg-red-800 text-white font-black text-lg flex items-center justify-center gap-3 shadow-[0_10px_25px_rgba(153,27,27,0.3)] hover:shadow-[0_15px_30px_rgba(153,27,27,0.4)] hover:-translate-y-1 active:scale-95 transition-all duration-300">
                        ENTER
                        <FaArrowRight className="text-sm" />
                    </button>
                </form>

                <div className="mt-10 flex flex-col gap-3 items-center">
                    <button
                        onClick={() => openApplicationWithSubject("Request for password reset")}
                        className="text-[10px] font-black text-red-800/40 hover:text-red-800 uppercase tracking-widest transition-colors cursor-pointer focus:outline-none"
                    >
                        Forgot password for Application?
                    </button>
                </div>
            </motion.div>

            <Application isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} sidebarRef={sidebarRef} defaultSubject={selectedSubject} />

        </div>
    );
}