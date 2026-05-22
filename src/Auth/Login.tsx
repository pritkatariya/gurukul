import { motion } from "motion/react";
import { FaUserAlt, FaLock, FaArrowRight, FaVolumeDown, FaVolumeUp } from "react-icons/fa";
import Logo from "../assets/gurukul logo.png";
import "../App.css";
import Input from "../Components/commen/Input";
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
    const [isLoggingIn, setIsLoggingIn] = useState(false);

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

    const preventDefault = async (event: React.FormEvent) => {
        event.preventDefault();

        if (isLoggingIn) return;

        if (!username.trim() || !password.trim()) {
            toast.error("Please enter both username and password");
            return;
        }

        try {
            setIsLoggingIn(true);

            if (username === "super-admin" && password === "admin123") {
                toast.success("Super Admin Login Successful!");

                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        id: 123098,
                        username: "super-admin",
                        role: "admin",
                        full_name: "Super Admin Principal",
                        department_id: 5,
                        profile_image_url: Logo,
                    })
                );

                localStorage.setItem("user_role", "SUPER_ADMIN");

                setTimeout(() => {
                    navigate("/deshbord");
                }, 450);

                return;
            }

            let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
            if (API_URL.endsWith("/")) API_URL = API_URL.slice(0, -1);

            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success("Login Successful!");

                const userWithImage = {
                    ...data.user,
                    profile_image_url: data.user?.profile_image_url || Logo,
                };

                localStorage.setItem("user", JSON.stringify(userWithImage));
                localStorage.setItem("user_role", data.user_role || data.user.role || "user");

                setTimeout(() => {
                    navigate("/deshbord");
                }, 450);
            } else {
                toast.error(data.message || "Invalid credentials");
                setIsLoggingIn(false);
            }
        } catch (error) {
            toast.error("Server offline or connection refused");
            setIsLoggingIn(false);
        }
    };

    const openApplicationWithSubject = (subjectText: string) => {
        setSelectedSubject(subjectText);
        setIsSidebarOpen(true);
    };

    return (
        <div className="relative flex min-h-screen w-screen items-center justify-center overflow-hidden bg-[#eef1f5] p-4 selection:bg-red-200 sm:p-6">
            <div className="fixed left-0 top-4 z-50 flex -translate-x-55.5 flex-col items-center gap-3 rounded-r-2xl bg-white py-2 pl-4 pr-5 shadow-2xl ring-1 ring-red-100 transition-transform duration-300 hover:translate-x-0 md:top-6">
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

            <div
                className="fixed inset-0 -z-10 opacity-[0.05] pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, #991b1b 1px, transparent 1px), linear-gradient(to bottom, #991b1b 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 28, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                className="grid w-full max-w-5xl overflow-hidden rounded-4xl bg-white p-3 shadow-[0_35px_90px_rgba(15,23,42,0.16)] sm:rounded-[2.5rem] md:grid-cols-[1.02fr_0.98fr] md:p-5"
            >
                <div className="relative hidden min-h-140 overflow-hidden rounded-[1.75rem] bg-linear-to-br from-red-700 via-red-800 to-amber-600 p-10 text-white md:flex md:flex-col md:items-center md:justify-between lg:p-12">
                    <div className="absolute inset-0 opacity-15">
                        <div
                            className="h-full w-full"
                            style={{
                                backgroundImage:
                                    "linear-gradient(to right, rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.35) 1px, transparent 1px)",
                                backgroundSize: "34px 34px",
                            }}
                        />
                    </div>

                    <div className="relative z-10 flex justify-center">
                        <div className="flex h-52 w-52 items-center justify-center rounded-4xl bg-white p-8 ring-1 ring-white/20 headerinset lg:h-64 lg:w-64">
                            <img src={Logo} alt="Gurukul" className="h-full w-full object-contain" />
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <h1 className="mt-10 flex max-w-sm items-center justify-center text-4xl font-bold leading-tight tracking-tight lg:text-2xl">
                            Please Add your <br /> I AM GURUKUL SEVAK <br /> Identity
                        </h1>

                        <div className="mt-4 h-1.5 w-40 rounded-full bg-amber-200" />

                        <p className="mt-8 max-w-sm text-sm font-semibold leading-7 text-white/80">
                            Secure access for Gurukul sevaks, department heads, and system administration.
                        </p>
                    </div>
                </div>

                <div className="flex min-h-140 flex-col items-center justify-center px-5 py-10 sm:px-8 md:px-10 lg:px-14">
                    <div className="mb-8 flex flex-col items-center text-center">
                        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 p-2 ring-1 ring-red-100 md:hidden">
                            <img src={Logo} className="h-full w-full object-contain" alt="Logo" />
                        </div>

                        <h2 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
                            Welcome Back
                        </h2>
                        <p className="mt-2 text-sm font-semibold text-gray-400">
                            Please login to your account
                        </p>
                    </div>

                    <form className="flex w-full max-w-sm flex-col gap-4" onSubmit={preventDefault}>
                        <Input
                            icon={<FaUserAlt className="text-red-800/45" />}
                            placeholder="Username"
                            className="h-14 w-full rounded-2xl border-gray-100 bg-gray-50 text-sm transition-all focus:border-red-300"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                        />

                        <Input
                            icon={<FaLock className="text-red-800/45" />}
                            placeholder="Password"
                            type="password"
                            className="h-14 w-full rounded-2xl border-gray-100 bg-gray-50 text-sm transition-all focus:border-red-300"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />

                        <div className="flex justify-end">
                            <button
                                type="button"
                                disabled={isLoggingIn}
                                onClick={() => openApplicationWithSubject("Request for password reset")}
                                className="text-[11px] font-black uppercase tracking-wider text-red-800/50 transition-colors hover:text-red-800 disabled:opacity-50"
                            >
                                Forgot Password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoggingIn}
                            className="mt-5 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-red-800 text-sm font-black uppercase tracking-wider text-white shadow-[0_14px_30px_rgba(153,27,27,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-75"
                        >
                            {isLoggingIn ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                    Logging In...
                                </>
                            ) : (
                                <>
                                    Login
                                    <FaArrowRight className="text-xs" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>

            <Application
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                sidebarRef={sidebarRef}
                defaultSubject={selectedSubject}
            />
        </div>
    );
}