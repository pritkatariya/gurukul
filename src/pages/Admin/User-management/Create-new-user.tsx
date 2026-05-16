import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaUser, FaSave, FaGraduationCap, FaHashtag } from "react-icons/fa";
import { toast } from "sonner";
import Input from "../../../Components/commen/Input";
import SGDropdown from "../../../Components/commen/SGDropdown";
import { PiPasswordFill } from "react-icons/pi";

export default function CreateNewUser() {
    const [formData, setFormData] = useState({
        fullName: "",
        username: "",
        std: "",
        SUID: "",
        password: "",
        role: "",
        department: ""
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
        if (!formData.username.trim()) newErrors.username = "Username is required";
        if (!formData.password.trim()) newErrors.password = "Password is required";
        if (!formData.std.trim()) newErrors.std = "Standard (STD) is required";
        if (!formData.SUID.trim()) newErrors.SUID = "Roll number is required";
        if (!formData.role) newErrors.role = "Please select a user role";
        if (!formData.department) newErrors.department = "Please select a department";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fill all required fields.");
            return;
        }

        try {
            let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            if (API_URL.endsWith('/')) {
                API_URL = API_URL.slice(0, -1);
            }

            const response = await fetch(`${API_URL}/create/user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    username: formData.username,
                    password: formData.password,
                    std: formData.std,
                    rollNumber: parseInt(formData.SUID),
                    userRole: formData.role,
                    department: formData.department
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Server Error Response:", errorText);
                toast.error(`Server Error: ${response.status}. Path might be incorrect.`);
                return;
            }

            const data = await response.json();

            if (data.success) {
                // 💡 ટોસ્ટ મેસેજમાં યુઝર આઈડી સાથે જોઈનિંગ ડેટ પણ બતાવશે
                toast.success(`User created! ID: ${data.user.id}. Joined on: ${data.user.joined_date} 🎉`);
                setFormData({ fullName: "", username: "", std: "", password: "", SUID: "", role: "", department: "" });
            } else {
                toast.error(data.message || "Failed to create user");
            }
        } catch (error) {
            console.error("Create User Error:", error);
            toast.error("Server is offline or unreachable");
        }
    };

    return (
        <div className="w-full flex flex-col items-center p-4 md:p-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-red-950 uppercase tracking-tight">
                    Create New Sevak / User
                </h1>
                <p className="text-gray-500 text-sm mt-1">Add a new profile with custom access roles to the Gurukul system</p>
                <div className="h-1.5 w-16 bg-red-800 mx-auto mt-3 rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-7xl bg-white shadow-[0_20px_50px_rgba(153,27,27,0.05)] border border-red-100 rounded-[2.5rem] p-6 md:p-10"
            >
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Full Name */}
                        <div>
                            <Input
                                label="Full Name"
                                icon={<FaUser />}
                                placeholder="E.g. Shaswat Swami"
                                value={formData.fullName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setFormData({ ...formData, fullName: e.target.value });
                                    if (errors.fullName) setErrors({ ...errors, fullName: "" });
                                }}
                                className={errors.fullName ? "border-red-500 ring-2 ring-red-50" : ""}
                            />
                            {errors.fullName && <p className="text-red-500 text-xs font-semibold mt-1.5 pl-2">⚠️ {errors.fullName}</p>}
                        </div>

                        {/* Username */}
                        <div>
                            <Input
                                label="Username"
                                icon={<FaUser />}
                                placeholder="E.g. swami_sevak"
                                value={formData.username}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setFormData({ ...formData, username: e.target.value });
                                    if (errors.username) setErrors({ ...errors, username: "" });
                                }}
                                className={errors.username ? "border-red-500 ring-2 ring-red-50" : ""}
                            />
                            {errors.username && <p className="text-red-500 text-xs font-semibold mt-1.5 pl-2">⚠️ {errors.username}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <Input
                                type="password"
                                label="Password"
                                icon={<PiPasswordFill />}
                                placeholder="Enter secure password"
                                value={formData.password}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setFormData({ ...formData, password: e.target.value });
                                    if (errors.password) setErrors({ ...errors, password: "" });
                                }}
                                className={errors.password ? "border-red-500 ring-2 ring-red-50" : ""}
                            />
                            {errors.password && <p className="text-red-500 text-xs font-semibold mt-1.5 pl-2">⚠️ {errors.password}</p>}
                        </div>

                        {/* STD */}
                        <div>
                            <Input
                                label="Standard (STD)"
                                icon={<FaGraduationCap />}
                                placeholder="E.g. 12th Arts / B.Com"
                                value={formData.std}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setFormData({ ...formData, std: e.target.value });
                                    if (errors.std) setErrors({ ...errors, std: "" });
                                }}
                                className={errors.std ? "border-red-500 ring-2 ring-red-50" : ""}
                            />
                            {errors.std && <p className="text-red-500 text-xs font-semibold mt-1.5 pl-2">⚠️ {errors.std}</p>}
                        </div>

                        {/* SUID */}
                        <div>
                            <Input
                                label="SUID"
                                type="number"
                                icon={<FaHashtag />}
                                placeholder="E.g. 45"
                                value={formData.SUID}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setFormData({ ...formData, SUID: e.target.value });
                                    if (errors.SUID) setErrors({ ...errors, SUID: "" });
                                }}
                                className={errors.SUID ? "border-red-500 ring-2 ring-red-50" : ""}
                            />
                            {errors.SUID && <p className="text-red-500 text-xs font-semibold mt-1.5 pl-2">⚠️ {errors.SUID}</p>}
                        </div>
                    </div>

                    {/* Role Dropdown */}
                    <div>
                        <SGDropdown
                            label="Select Role"
                            name="role"
                            value={formData.role}
                            onChange={(e: { target: { name: string; value: string } }) => {
                                setFormData({ ...formData, role: e.target.value });
                                if (errors.role) setErrors({ ...errors, role: "" });
                            }}
                            options={[
                                { value: "admin", label: "admin" },
                                { value: "department main", label: "department main" },
                                { value: "user", label: "user" },
                            ]}
                            error={errors.role}
                        />
                    </div>

                    {/* Department Dropdown */}
                    <div>
                        <SGDropdown
                            label="Select Department"
                            name="department"
                            value={formData.department}
                            onChange={(e: { target: { name: string; value: string } }) => {
                                setFormData({ ...formData, department: e.target.value });
                                if (errors.department) setErrors({ ...errors, department: "" });
                            }}
                            options={[
                                { value: "Gurukul Arts", label: "Gurukul Arts" },
                                { value: "G-Music", label: "G-Music" },
                                { value: "G-Culcher", label: "G-Culcher" },
                                { value: "Administration", label: "Administration" }
                            ]}
                            error={errors.department}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            className="w-full md:w-auto px-8 h-14 rounded-2xl bg-red-800 hover:bg-red-900 text-white font-black text-base flex items-center justify-center gap-3 shadow-[0_10px_25px_rgba(153,27,27,0.2)] hover:shadow-[0_15px_30px_rgba(153,27,27,0.3)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
                        >
                            <FaSave className="text-lg" />
                            CREATE USER
                        </button>
                    </div>

                </form>
            </motion.div>
        </div>
    );
}