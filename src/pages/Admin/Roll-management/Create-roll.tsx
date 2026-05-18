import React, { useState } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { FaUser, FaSave } from "react-icons/fa";
import { PiPasswordFill } from "react-icons/pi";
import { AiOutlineUser, AiOutlineLock } from "react-icons/ai";
import { toast } from "sonner";
import Input from "../../../Components/commen/Input";
import "../../../App.css";

export default function CreateRoll() {
    const [roleName, setRoleName] = useState("");
    const [roleCode, setRoleCode] = useState("");

    const [permissions, setPermissions] = useState({
        role: { create: false, view: false },
        user: { create: false, view: false },
    });

    const isAllSelected =
        permissions.role.create && permissions.role.view &&
        permissions.user.create && permissions.user.view;

    const handleSelectAll = () => {
        const nextState = !isAllSelected;
        setPermissions({
            role: { create: nextState, view: nextState },
            user: { create: nextState, view: nextState },
        });
    };

    const handleCheckboxChange = (module: 'role' | 'user', type: 'create' | 'view') => {
        setPermissions((prev) => ({
            ...prev,
            [module]: {
                ...prev[module],
                [type]: !prev[module][type],
            },
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleName.trim() || !roleCode.trim()) {
            toast.error("Please fill Role Name and Role Code");
            return;
        }

        try {
            let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            if (API_URL.endsWith('/')) {
                API_URL = API_URL.slice(0, -1);
            }

            const response = await fetch(`${API_URL}/auth/create-role`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roleName: roleName,
                    roleCode: roleCode,
                    permissions: permissions
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success(data.message || "Role created successfully! 🎉");
                setRoleName("");
                setRoleCode("");
                setPermissions({
                    role: { create: false, view: false },
                    user: { create: false, view: false },
                });
            } else {
                toast.error(data.message || "Failed to create role");
            }
        } catch (error) {
            console.error("Create Role Frontend Error:", error);
            toast.error("Server is offline or unreachable");
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1], when: "beforeChildren", staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
    };

    return (
        <div className="w-full min-h-screen bg-gray-50/50 flex flex-col items-center p-4 md:p-8 select-none">
            <div className="text-center mb-8">
                <motion.h1 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-2xl md:text-3xl font-black text-red-950 uppercase tracking-tight">
                    Create New Role / Permission
                </motion.h1>
                <p className="text-gray-500 text-xs md:text-sm mt-1">Add a new profile with custom access roles to the Gurukul system</p>
                <motion.div initial={{ width: 0 }} animate={{ width: 64 }} transition={{ duration: 0.5, delay: 0.2 }} className="h-1.5 bg-red-800 mx-auto mt-3 rounded-full" />
            </div>

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-5xl bg-white shadow-[0_20px_50px_rgba(153,27,27,0.03)] border border-red-50 rounded-[2.5rem] p-4 md:p-10">
                <form onSubmit={handleSubmit} className="space-y-8">

                    <motion.div variants={itemVariants} className="relative w-full rounded-2xl gap-5 border border-red-50 bg-red-50/10 flex flex-col p-5 md:p-6 mt-4">
                        <p className="absolute left-6 bg-white px-3 text-xs font-black text-red-950 tracking-wider uppercase -top-3 border border-red-50 rounded-full shadow-sm">
                            Role Information
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                            <Input label="Role Name" icon={<FaUser className="text-red-800" />} placeholder="E.g. Department Head" value={roleName} onChange={(e: any) => setRoleName(e.target.value)} />
                            <Input label="Role Code" icon={<PiPasswordFill className="text-red-800" />} placeholder="E.g. HEAD1019" value={roleCode} onChange={(e: any) => setRoleCode(e.target.value)} />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="relative w-full rounded-2xl gap-4 border border-red-50 bg-red-50/10 flex flex-col p-5 md:p-6 mt-6">
                        <div className="absolute left-6 -top-3 flex items-center gap-3">
                            <p className="bg-white px-3 text-xs font-black text-red-950 tracking-wider uppercase border border-red-50 rounded-full shadow-sm">Permissions Management</p>
                            <label className="flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-full cursor-pointer shadow transition-all select-none">
                                <input type="checkbox" className="w-3.5 h-3.5 accent-white rounded cursor-pointer" checked={isAllSelected} onChange={handleSelectAll} />
                                <span>Select All Permissions</span>
                            </label>
                        </div>

                        <div className="w-full flex flex-col gap-4 pt-4">
                            
                            <motion.div whileHover={{ scale: 1.005 }} className="w-full border border-gray-100 bg-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all">
                                <div className="flex gap-4 font-bold text-gray-800 items-center">
                                    <AiOutlineLock className="w-10 h-10 text-red-800 bg-red-50 rounded-xl p-2 shadow-inner shrink-0" />
                                    <div className="text-left">
                                        <h2 className="text-sm md:text-base font-black text-red-950">Role Permission</h2>
                                        <p className="text-[11px] text-gray-400 font-normal">Manage access tiers and security configurations</p>
                                    </div>
                                </div>
                                <div className="flex text-xs md:text-sm font-bold items-center gap-10 pl-2 sm:pl-0 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                                    <label className="flex items-center gap-2.5 cursor-pointer group">
                                        <input type="checkbox" className="w-4 h-4 accent-red-800 rounded cursor-pointer transition-transform group-hover:scale-110" checked={permissions.role.create} onChange={() => handleCheckboxChange('role', 'create')} />
                                        <span className="text-gray-600 group-hover:text-red-800 font-bold transition-colors">Create</span>
                                    </label>
                                    <label className="flex items-center gap-2.5 cursor-pointer group">
                                        <input type="checkbox" className="w-4 h-4 accent-red-800 rounded cursor-pointer transition-transform group-hover:scale-110" checked={permissions.role.view} onChange={() => handleCheckboxChange('role', 'view')} />
                                        <span className="text-gray-600 group-hover:text-red-800 font-bold transition-colors">View</span>
                                    </label>
                                </div>
                            </motion.div>

                            <motion.div whileHover={{ scale: 1.005 }} className="w-full border border-gray-100 bg-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all">
                                <div className="flex gap-4 font-bold text-gray-800 items-center">
                                    <AiOutlineUser className="w-10 h-10 text-red-800 bg-red-50 rounded-xl p-2 shadow-inner shrink-0" />
                                    <div className="text-left">
                                        <h2 className="text-sm md:text-base font-black text-red-950">User / Sevak Permission</h2>
                                        <p className="text-[11px] text-gray-400 font-normal">Manage profiles of registered users and sevaks</p>
                                    </div>
                                </div>
                                <div className="flex text-xs md:text-sm font-bold items-center gap-10 pl-2 sm:pl-0 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                                    <label className="flex items-center gap-2.5 cursor-pointer group">
                                        <input type="checkbox" className="w-4 h-4 accent-red-800 rounded cursor-pointer transition-transform group-hover:scale-110" checked={permissions.user.create} onChange={() => handleCheckboxChange('user', 'create')} />
                                        <span className="text-gray-600 group-hover:text-red-800 font-bold transition-colors">Create</span>
                                    </label>
                                    <label className="flex items-center gap-2.5 cursor-pointer group">
                                        <input type="checkbox" className="w-4 h-4 accent-red-800 rounded cursor-pointer transition-transform group-hover:scale-110" checked={permissions.user.view} onChange={() => handleCheckboxChange('user', 'view')} />
                                        <span className="text-gray-600 group-hover:text-red-800 font-bold transition-colors">View</span>
                                    </label>
                                </div>
                            </motion.div>

                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="pt-2 flex justify-end">
                        <button type="submit" className="w-full sm:w-auto px-8 h-14 rounded-2xl bg-red-800 hover:bg-red-900 text-white font-black text-sm md:text-base flex items-center justify-center gap-3 shadow-md hover:shadow-lg active:scale-95 transition-all duration-300 cursor-pointer">
                            <FaSave className="text-lg" /> SAVE ROLE & PERMISSIONS
                        </button>
                    </motion.div>
                </form>
            </motion.div>
        </div>
    );
}