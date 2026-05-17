import { motion } from "motion/react";
import { FaUserAlt, FaLock, FaArrowRight } from "react-icons/fa";
import Logo from '../assets/gurukul logo.png';
import '../App.css';
import Input from "../Components/commen/Input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const preventDefault = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username.trim() || !password.trim()) {
            toast.error('Please enter both username and password');
            return;
        }

        // સુપર એડમિન માટે સ્ટેટિક ડેટા
        if (username === 'super-admin' && password === 'admin123') {
            toast.success('Super Admin Login Successful! 🎉');
            
            localStorage.setItem('user', JSON.stringify({ 
                id: 123098,
                username: 'super-admin', 
                role: 'admin',
                full_name: 'Super Admin Principal',
                profile_image_url: null,
                std: "Main",
                roll_number: null,
                department: "Administration"
            }));
            localStorage.setItem('user_role', 'SUPER_ADMIN');
            
            const fullPermissions = {
                department: { create: true, view: true },
                role: { create: true, view: true },
                user: { create: true, view: true }
            };
            localStorage.setItem('user_permissions', JSON.stringify(fullPermissions));
            
            navigate("/deshbord");
            return;
        }

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username, 
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success('Login Successful! 🎉');
                
                // ડેટાબેઝમાંથી આવેલો આખો યુઝર ઓબ્જેક્ટ
                const userSessionData = { ...data.user };
                delete userSessionData.password; // સેક્યુરિટી માટે પાસવર્ડ ડિલીટ

                // તમારા ડેટાબેઝ મુજબની કી પકડી
                let rawImageUrl = data.user.profile_image_url || data.user.image || data.user.avatar || null;

                // 💡 Mixed Content ફિક્સ: લાઈવ સર્વર પર localhost ની લિંક બદલો
                if (rawImageUrl && rawImageUrl.startsWith('http://localhost:3000')) {
                    rawImageUrl = rawImageUrl.replace('http://localhost:3000', API_URL);
                }

                userSessionData.profile_image_url = rawImageUrl;

                // બધો જ ડેટા (department, std, roll_number વગેરે) લોકલ સ્ટોરેજમાં સેવ થશે
                localStorage.setItem('user', JSON.stringify(userSessionData));
                
                // રોલ કોડ સેટિંગ (તમારા ડેટાબેઝ મુજબ 'user1029' અથવા 'sevak')
                const finalRole = data.user.role || "sevak";
                localStorage.setItem('user_role', finalRole);
                
                navigate("/deshbord");
            } else {
                toast.error(data.message || 'Invalid credentials');
            }
        } catch (error) {
            console.error("Login Error:", error);
            toast.error('Server is not connected or offline');
        }
    }

    return (
        <div className="w-screen min-h-screen flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20 overflow-hidden relative selection:bg-red-200 p-6 scrollbar-hide">

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

            <div
                className="fixed inset-0 -z-20 opacity-[0.05] pointer-events-none"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, #991b1b 1px, transparent 1px),
                        linear-gradient(to bottom, #991b1b 1px, transparent 1px)
                    `,
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
                    <a href="#" className="text-[10px] font-black text-red-800/40 hover:text-red-800 uppercase tracking-widest transition-colors">
                        Forgot password for Application?
                    </a>
                    <p className="text-sm text-gray-400 font-bold">
                        New here? <span className="text-red-800 cursor-pointer hover:underline underline-offset-4">Register</span>
                    </p>
                </div>
            </motion.div>

        </div>
    );
}