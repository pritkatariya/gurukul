import React, { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { FaUser, FaSave, FaImages } from "react-icons/fa";
import { PiPasswordFill } from "react-icons/pi";
import { AiOutlineUser, AiOutlineLock } from "react-icons/ai";
import { toast } from "sonner";
import Input from "../../../Components/commen/Input";
import "../../../App.css";

type PermissionState = {
    role: { create: boolean; view: boolean };
    user: { create: boolean; view: boolean };
    overview: { manage: boolean; music: boolean; editor: boolean };
};

const defaultPermissions: PermissionState = {
    role: { create: false, view: false },
    user: { create: false, view: false },
    overview: { manage: false, music: false, editor: false },
};

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

export default function CreateRoll() {
    const [isSaving, setIsSaving] = useState(false);
    const [roleName, setRoleName] = useState("");
    const [roleCode, setRoleCode] = useState("");
    const [permissions, setPermissions] = useState<PermissionState>(defaultPermissions);

    const isAllSelected =
        Object.values(permissions.role).every(Boolean) &&
        Object.values(permissions.user).every(Boolean) &&
        Object.values(permissions.overview).every(Boolean);

    const handleSelectAll = () => {
        const nextState = !isAllSelected;

        setPermissions({
            role: { create: nextState, view: nextState },
            user: { create: nextState, view: nextState },
            overview: { manage: nextState, music: nextState, editor: nextState },
        });
    };

    const handleCheckboxChange = (module: keyof PermissionState, key: string) => {
        setPermissions((prev) => ({
            ...prev,
            [module]: {
                ...prev[module],
                [key]: !(prev[module] as any)[key],
            },
        }));
    };

    const resetForm = () => {
        setRoleName("");
        setRoleCode("");
        setPermissions(defaultPermissions);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const cleanRoleName = roleName.trim();
        const cleanRoleCode = roleCode.trim();

        if (!cleanRoleName || !cleanRoleCode) {
            toast.error("Please fill Role Name and Role Code");
            return;
        }

        try {
            setIsSaving(true);

            const response = await fetch(`${API_URL}/auth/create-role`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    roleName: cleanRoleName,
                    roleCode: cleanRoleCode,
                    permissions,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to create role");
            }

            toast.success(data.message || "Role created successfully!");
            resetForm();
        } catch (error) {
            console.error("Create role error:", error);
            toast.error(error instanceof Error ? error.message : "Server is offline or unreachable");
        } finally {
            setIsSaving(false);
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                when: "beforeChildren",
                staggerChildren: 0.1,
            },
        },
    };

    return (
        <div className="w-full min-h-screen bg-gray-50/50 flex flex-col items-center p-4 md:p-8 select-none">
            <div className="text-center mb-8">
                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-2xl md:text-3xl font-black text-red-950 uppercase tracking-tight"
                >
                    Create New Role / Permission
                </motion.h1>
                <p className="text-gray-500 text-xs md:text-sm mt-1">
                    Add a new profile with custom access roles to the Gurukul system
                </p>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-5xl bg-white shadow-xl border border-red-50 rounded-[2.5rem] p-6 md:p-10"
            >
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 bg-red-50/10 rounded-2xl border border-red-50">
                        <Input
                            label="Role Name"
                            icon={<FaUser className="text-red-800" />}
                            placeholder="E.g. Department Head"
                            value={roleName}
                            onChange={(event: any) => setRoleName(event.target.value)}
                        />

                        <Input
                            label="Role Code"
                            icon={<PiPasswordFill className="text-red-800" />}
                            placeholder="E.g. HEAD1019"
                            value={roleCode}
                            onChange={(event: any) => setRoleCode(event.target.value)}
                        />
                    </div>

                    <div className="relative w-full rounded-2xl border border-red-50 p-6 mt-6">
                        <div className="absolute -top-3 left-6 flex items-center gap-4 bg-white px-2">
                            <span className="text-xs font-black text-red-950 uppercase">
                                Permissions Management
                            </span>

                            <label className="flex items-center gap-2 bg-red-800 text-white text-[10px] px-3 py-1 rounded-full cursor-pointer hover:bg-red-900 transition-all">
                                <input
                                    type="checkbox"
                                    className="accent-white"
                                    checked={isAllSelected}
                                    onChange={handleSelectAll}
                                />
                                Select All
                            </label>
                        </div>

                        <div className="space-y-4 pt-4">
                            <PermissionRow
                                title="Role Permission"
                                icon={<AiOutlineLock />}
                                module="role"
                                items={["create", "view"]}
                                permissions={permissions}
                                onChange={handleCheckboxChange}
                            />

                            <PermissionRow
                                title="User / Sevak Permission"
                                icon={<AiOutlineUser />}
                                module="user"
                                items={["create", "view"]}
                                permissions={permissions}
                                onChange={handleCheckboxChange}
                            />

                            <PermissionRow
                                title="Overview Controller"
                                icon={<FaImages />}
                                module="overview"
                                items={["manage", "music", "editor"]}
                                permissions={permissions}
                                onChange={handleCheckboxChange}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className={`w-full h-14 rounded-2xl bg-red-800 text-white font-black hover:bg-red-900 transition-all active:scale-95 flex items-center justify-center gap-3 ${
                            isSaving ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                    >
                        {isSaving ? (
                            <>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                SAVING...
                            </>
                        ) : (
                            <>
                                <FaSave /> SAVE ROLE & PERMISSIONS
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

function PermissionRow({
    title,
    icon,
    module,
    items,
    permissions,
    onChange,
}: {
    title: string;
    icon: React.ReactNode;
    module: keyof PermissionState;
    items: string[];
    permissions: PermissionState;
    onChange: (module: keyof PermissionState, key: string) => void;
}) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors gap-4">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 text-red-800 bg-red-50 rounded-xl flex items-center justify-center">
                    {icon}
                </div>
                <div>
                    <h2 className="text-sm font-black text-red-950">{title}</h2>
                </div>
            </div>

            <div className="flex flex-wrap gap-6">
                {items.map((item) => (
                    <label key={item} className="flex items-center gap-2 cursor-pointer capitalize">
                        <input
                            type="checkbox"
                            className="w-4 h-4 accent-red-800"
                            checked={Boolean((permissions[module] as any)[item])}
                            onChange={() => onChange(module, item)}
                        />

                        <span className="text-sm text-gray-600 font-bold">
                            {item
                                .replace("manage", "Manage Overview")
                                .replace("music", "Music Tracks")
                                .replace("editor", "Event Editor")}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
}