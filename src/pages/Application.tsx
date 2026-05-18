import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaIdCard, FaUserAlt, FaPen, FaArrowRight } from "react-icons/fa";
import { toast } from "sonner";
// 🎯 પાથ સુધારીને સાચો કન્ફિગર કર્યો જેથી Vite ની 'Failed to resolve import' એરર સોલ્વ થાય 👍
import Input from "../Components/commen/Input";
import SGDropdown from "../Components/commen/SGDropdown";

interface ApplicationProps {
    isOpen: boolean;
    onClose: () => void;
    sidebarRef?: React.RefObject<HTMLDivElement | null>;
    defaultSubject: string; 
}

interface DropdownOption {
    value: string;
    label: string;
}

export default function Application({ isOpen, onClose, sidebarRef, defaultSubject }: ApplicationProps) {
    const [reqDate, setReqDate] = useState(new Date().toISOString().split('T')[0]);
    const [reqDeptId, setReqDeptId] = useState("");
    const [reqSuid, setReqSuid] = useState("");
    const [reqUsername, setReqUsername] = useState("");
    const [reqSubject, setReqSubject] = useState("");
    const [reqText, setReqText] = useState("");
    const [dbDepartments, setDbDepartments] = useState<DropdownOption[]>([]);

    useEffect(() => {
        if (isOpen) {
            setReqSubject(defaultSubject);
            fetchLiveDepartments();
        }
    }, [isOpen, defaultSubject]);

    const fetchLiveDepartments = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${API_URL}/auth/departments`);
            const data = await response.json();
            if (data.success && data.departments) {
                const formatted = data.departments.map((d: any) => ({
                    value: String(d.id),
                    label: d.name
                }));
                setDbDepartments(formatted);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // 🎯 'e: React.FormEvent' ઉમેરીને ts(7006) 'implicitly has an any type' એરર ફિક્સ કરી 🛠️
    const handleRequestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reqDeptId || !reqSuid || !reqUsername || !reqSubject || !reqText) {
            toast.error('All fields are required to submit application!');
            return;
        }

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await fetch(`${API_URL}/auth/forgot-password-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: reqDate,
                    department_id: Number(reqDeptId),
                    suid: reqSuid,
                    username: reqUsername,
                    subject: reqSubject,
                    message: reqText 
                })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                toast.success('Application Request Verified & Submitted! 🙏');
                onClose();
                setReqDeptId(""); setReqSuid(""); setReqUsername(""); setReqText("");
            } else {
                toast.error(data.message || 'Failed to submit request.');
            }
        } catch (error) {
            toast.error('Server connection error');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 cursor-pointer" onClick={onClose} />
                    <motion.div
                        ref={sidebarRef}
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-lg bg-white/95 backdrop-blur-xl shadow-[-10px_0_40px_rgba(0,0,0,0.1)] z-50 p-6 md:p-8 flex flex-col border-l border-red-50 overflow-y-auto"
                    >
                        <div className="flex items-center justify-between border-b border-red-100 pb-4 mb-6 text-left">
                            <div>
                                <h3 className="text-2xl font-black text-red-800 tracking-tight">APPLICATION REQUEST</h3>
                                <p className="text-xs text-gray-400 font-bold mt-1">Submit your request to reset credentials</p>
                            </div>
                            <button type="button" onClick={onClose} className="w-10 h-10 rounded-full bg-red-50 text-red-800 flex justify-center items-center hover:bg-red-100 active:scale-90 transition-all cursor-pointer focus:outline-none">
                                <FaTimes size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleRequestSubmit} className="flex flex-col gap-5 flex-1 text-left">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-black text-red-800/70 uppercase tracking-wider">Application Date</label>
                                {/* 🎯 ઇનપુટ ચેન્જમાં પણ ઇવેન્ટ ટાઇપ સેટ કરી દીધી */}
                                <input type="date" className="w-full p-3 h-12 border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none font-bold text-gray-700 text-sm shadow-sm" value={reqDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReqDate(e.target.value)} />
                            </div>

                            <SGDropdown
                                label="DEPARTMENT"
                                name="department"
                                value={reqDeptId}
                                placeholder="-- Select Live Department --"
                                options={dbDepartments}
                                onChange={(e: any) => setReqDeptId(e.target.value)}
                                className="text-xs font-black text-red-800/70 uppercase tracking-wider"
                            />

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-black text-red-800/70 uppercase tracking-wider">SUID (Unique ID)</label>
                                <Input icon={<FaIdCard className="text-red-800/40" />} placeholder="Enter your Student / Sevak Unique ID" className="w-full h-12 rounded-xl border-gray-200 text-sm" value={reqSuid} onChange={(e: any) => setReqSuid(e.target.value)} />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-black text-red-800/70 uppercase tracking-wider">Registered Username</label>
                                <Input icon={<FaUserAlt className="text-red-800/40" />} placeholder="Enter your current username" className="w-full h-12 rounded-xl border-gray-200 text-sm" value={reqUsername} onChange={(e: any) => setReqUsername(e.target.value)} />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-black text-red-800/70 uppercase tracking-wider">SUBJECT</label>
                                <input type="text" disabled className="w-full p-3 h-12 border border-gray-200 rounded-xl bg-gray-100 font-bold text-gray-500 text-sm shadow-sm outline-none" value={reqSubject} />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-black text-red-800/70 uppercase tracking-wider">Request Message / Description</label>
                                <div className="relative w-full flex items-start">
                                    <span className="absolute left-5 top-3.5 text-red-800/40"><FaPen size={13} /></span>
                                    <textarea rows={4} placeholder="Write your brief application reason here..." className="w-full rounded-xl border border-gray-200 bg-white pl-12 pr-4 py-3 font-bold text-gray-700 text-sm shadow-sm focus:outline-none resize-none" value={reqText} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReqText(e.target.value)} />
                                </div>
                            </div>

                            <button type="submit" className="w-full h-14 mt-2 rounded-xl bg-red-800 text-white font-black text-base flex items-center justify-center gap-3 shadow-lg hover:bg-red-900 active:scale-98 transition-all cursor-pointer">
                                SUBMIT APPLICATION <FaArrowRight className="text-xs" />
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}