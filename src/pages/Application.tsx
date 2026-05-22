import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaIdCard, FaUserAlt, FaPen, FaArrowRight } from "react-icons/fa";
import { toast } from "sonner";
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

const getApiUrl = () => {
    let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    if (API_URL.endsWith("/")) API_URL = API_URL.slice(0, -1);
    return API_URL;
};

export default function Application({ isOpen, onClose, sidebarRef, defaultSubject }: ApplicationProps) {
    const [reqDate, setReqDate] = useState(new Date().toISOString().split("T")[0]);
    const [reqDeptId, setReqDeptId] = useState("");
    const [reqSuid, setReqSuid] = useState("");
    const [reqUsername, setReqUsername] = useState("");
    const [reqSubject, setReqSubject] = useState("");
    const [reqText, setReqText] = useState("");
    const [dbDepartments, setDbDepartments] = useState<DropdownOption[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setReqSubject(defaultSubject || "Request for password reset");
            fetchLiveDepartments();
        }
    }, [isOpen, defaultSubject]);

    const fetchLiveDepartments = async () => {
        try {
            const API_URL = getApiUrl();
            const response = await fetch(`${API_URL}/auth/departments`);
            const data = await response.json();

            if (data.success && data.departments) {
                const formatted = data.departments.map((department: any) => ({
                    value: String(department.id),
                    label: department.name
                }));

                setDbDepartments(formatted);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const resetForm = () => {
        setReqDeptId("");
        setReqSuid("");
        setReqUsername("");
        setReqText("");
        setReqDate(new Date().toISOString().split("T")[0]);
    };

    const handleRequestSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!reqDeptId || !reqSuid || !reqSubject || !reqText) {
            toast.error("Department, SUID, subject and message are required!");
            return;
        }

        try {
            setSubmitting(true);
            const API_URL = getApiUrl();

            const response = await fetch(`${API_URL}/auth/forgot-password-request`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: reqDate,
                    department_id: Number(reqDeptId),
                    suid: reqSuid.trim(),
                    username: reqUsername.trim(),
                    subject: reqSubject,
                    message: reqText.trim()
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success(data.message || "Application submitted successfully!");
                resetForm();
                onClose();
            } else {
                toast.error(data.message || "Failed to submit request.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Server connection error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 cursor-pointer bg-black/30 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        ref={sidebarRef}
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-red-50 bg-white/95 p-6 shadow-[-10px_0_40px_rgba(0,0,0,0.1)] backdrop-blur-xl md:p-8"
                    >
                        <div className="mb-6 flex items-center justify-between border-b border-red-100 pb-4 text-left">
                            <div>
                                <h3 className="text-2xl font-black tracking-tight text-red-800">
                                    APPLICATION REQUEST
                                </h3>
                                <p className="mt-1 text-xs font-bold text-gray-400">
                                    Submit your password reset request
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-800 transition-all hover:bg-red-100 active:scale-90"
                            >
                                <FaTimes size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleRequestSubmit} className="flex flex-1 flex-col gap-5 text-left">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-black uppercase tracking-wider text-red-800/70">
                                    Application Date
                                </label>
                                <input
                                    type="date"
                                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50/50 p-3 text-sm font-bold text-gray-700 shadow-sm outline-none"
                                    value={reqDate}
                                    onChange={(event) => setReqDate(event.target.value)}
                                />
                            </div>

                            <SGDropdown
                                label="DEPARTMENT"
                                name="department"
                                value={reqDeptId}
                                placeholder="-- Select Department --"
                                options={dbDepartments}
                                onChange={(event: any) => setReqDeptId(event.target.value)}
                                className="text-xs font-black uppercase tracking-wider text-red-800/70"
                            />

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-black uppercase tracking-wider text-red-800/70">
                                    SUID
                                </label>
                                <Input
                                    icon={<FaIdCard className="text-red-800/40" />}
                                    placeholder="Enter your SUID"
                                    className="h-12 w-full rounded-xl border-gray-200 text-sm"
                                    value={reqSuid}
                                    onChange={(event: any) => setReqSuid(event.target.value)}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-black uppercase tracking-wider text-red-800/70">
                                    Registered Username Optional
                                </label>
                                <Input
                                    icon={<FaUserAlt className="text-red-800/40" />}
                                    placeholder="Enter username if you remember"
                                    className="h-12 w-full rounded-xl border-gray-200 text-sm"
                                    value={reqUsername}
                                    onChange={(event: any) => setReqUsername(event.target.value)}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-black uppercase tracking-wider text-red-800/70">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-100 p-3 text-sm font-bold text-gray-500 shadow-sm outline-none"
                                    value={reqSubject}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-black uppercase tracking-wider text-red-800/70">
                                    Request Message
                                </label>
                                <div className="relative flex w-full items-start">
                                    <span className="absolute left-5 top-3.5 text-red-800/40">
                                        <FaPen size={13} />
                                    </span>
                                    <textarea
                                        rows={4}
                                        placeholder="Write your request reason here..."
                                        className="w-full resize-none rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm font-bold text-gray-700 shadow-sm outline-none"
                                        value={reqText}
                                        onChange={(event) => setReqText(event.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="mt-2 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-red-800 text-base font-black text-white shadow-lg transition-all hover:bg-red-900 active:scale-98 disabled:opacity-60"
                            >
                                {submitting ? "SUBMITTING..." : "SUBMIT APPLICATION"}
                                <FaArrowRight className="text-xs" />
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}