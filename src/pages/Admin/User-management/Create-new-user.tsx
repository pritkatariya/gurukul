import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaSave, FaGraduationCap, FaHashtag } from "react-icons/fa";
import { toast } from "sonner";
import Input from "../../../Components/commen/Input";
import SGDropdown from "../../../Components/commen/SGDropdown";
import { PiPasswordFill } from "react-icons/pi";

interface RoleOption {
    value: string;
    label: string;
}

interface DeptOption {
    value: string;
    label: string;
}

export default function CreateNewUser() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const deptIdFromUrl = searchParams.get("dept_id") || ""; 
    const nameFromUrl = searchParams.get("name") || "";
    const suidFromUrl = searchParams.get("suid") || "";

    const cleanSUID = suidFromUrl.replace(/[^0-9]/g, "");
    const isRedirectedFromList = nameFromUrl !== ""; 

    const loggedInUserRole = localStorage.getItem("user_role") || "";
    const userRaw = localStorage.getItem("user");
    
    let userId: number | null = null;
    let userDepartmentId = "0"; 

    if (userRaw) {
        try {
            const parsed = JSON.parse(userRaw);
            userId = parsed.id ? Number(parsed.id) : null;
            userDepartmentId = parsed.department_id !== undefined ? parsed.department_id.toString() : "0";
        } catch (e) {
            console.error(e);
        }
    }

    const isMainSuperAdmin = userId === 123098 || loggedInUserRole.trim().toUpperCase() === "SUPER_ADMIN";

    const [formData, setFormData] = useState({
        fullName: nameFromUrl,
        username: "",
        std: "",
        SUID: cleanSUID || suidFromUrl,
        password: "",
        role: isRedirectedFromList ? "user" : "", 
        department: isRedirectedFromList ? deptIdFromUrl : (isMainSuperAdmin ? "" : userDepartmentId)
    });

    const [selectedFile] = useState<File | null>(null);
    const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
    const [dbDepartments, setDbDepartments] = useState<DeptOption[]>([]);
    const [loadingRoles, setLoadingRoles] = useState<boolean>(true);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const fetchLiveDepartments = async () => {
            try {
                let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                if (API_URL.endsWith('/')) API_URL = API_URL.slice(0, -1);

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

        const fetchRolesForDropdown = async () => {
            if (isRedirectedFromList) {
                setRoleOptions([{ value: "user", label: "User" }]);
                setLoadingRoles(false);
                return;
            }

            try {
                let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                if (API_URL.endsWith('/')) API_URL = API_URL.slice(0, -1);

                const response = await fetch(`${API_URL}/auth/role/alldata`);
                if (!response.ok) throw new Error("Failed to load roles");
                
                const data = await response.json();

                if (data.success && data.roles) {
                    let dynamicOptions = data.roles.map((role: any) => ({
                        value: role.role_code.trim().toLowerCase(),
                        label: role.role_name.trim()
                    }));

                    if (!isMainSuperAdmin) {
                        dynamicOptions = dynamicOptions.filter((r: any) => r.value === "user");
                    }

                    setRoleOptions(dynamicOptions);
                }
            } catch (error) {
                console.error(error);
                if (isMainSuperAdmin) {
                    setRoleOptions([
                        { value: "admin", label: "Admin" },
                        { value: "user", label: "User" }
                    ]);
                } else {
                    setRoleOptions([{ value: "user", label: "User" }]);
                }
            } finally {
                setLoadingRoles(false);
            }
        };

        fetchLiveDepartments();
        fetchRolesForDropdown();
    }, [isRedirectedFromList, isMainSuperAdmin]);

    const isDepartmentHeadSelected = () => {
        if (!formData.role) return false;
        const cleanRole = formData.role.trim().toLowerCase();
        return cleanRole === "head1029" || cleanRole === "department main";
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
        if (!formData.username.trim()) newErrors.username = "Username is required";
        if (!formData.password.trim()) newErrors.password = "Password is required";
        if (!formData.std.trim()) newErrors.std = "Standard (STD) is required";
        if (!formData.SUID.toString().trim()) newErrors.SUID = "Roll/SUID number is required";
        if (!formData.role) newErrors.role = "Please select a user role";
        
        if (isDepartmentHeadSelected() && !formData.department) {
            newErrors.department = "Please select a department for the Department Head";
        } else if (!isDepartmentHeadSelected() && !formData.department) {
            formData.department = isMainSuperAdmin ? "0" : userDepartmentId;
        }

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
            if (API_URL.endsWith('/')) API_URL = API_URL.slice(0, -1);

            const dataToSend = new FormData();
            dataToSend.append("fullName", formData.fullName);
            dataToSend.append("username", formData.username);
            dataToSend.append("password", formData.password);
            dataToSend.append("std", formData.std);
            dataToSend.append("rollNumber", formData.SUID);
            dataToSend.append("userRole", formData.role);
            dataToSend.append("department", formData.department); 
            
            if (selectedFile) dataToSend.append("image", selectedFile);

            const response = await fetch(`${API_URL}/create/user`, {
                method: 'POST',
                body: dataToSend
            });

            const data = await response.json();
            if (data.success) {
                toast.success(`User created successfully! 🎉`);

                setFormData({ 
                    fullName: "", 
                    username: "", 
                    std: "", 
                    password: "", 
                    SUID: "", 
                    role: "", 
                    department: isMainSuperAdmin ? "" : userDepartmentId 
                });

                if (isRedirectedFromList) {
                    navigate(`/deshbord/user-lists?dept_id=${encodeURIComponent(deptIdFromUrl)}`);
                }
            } else {
                toast.error(data.message || "Failed to create user");
            }
        } catch (error) {
            toast.error("Server is offline or unreachable");
        }
    };

    return (
        <div className="w-full flex flex-col items-center p-4 md:p-8 select-none">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-red-950 uppercase tracking-tight">Create New Sevak / User</h1>
                <div className="h-1.5 w-16 bg-red-800 mx-auto mt-3 rounded-full" />
            </div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-7xl bg-white shadow-md border border-red-50 rounded-[2.5rem] p-6 md:p-10">
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Input label="Full Name" icon={<FaUser />} placeholder="E.g. Prit" value={formData.fullName} onChange={(e: any) => setFormData({ ...formData, fullName: e.target.value })} />
                        <Input label="Username" icon={<FaUser />} placeholder="E.g. prit-123" value={formData.username} onChange={(e: any) => setFormData({ ...formData, username: e.target.value })} />
                        <Input type="password" label="Password" icon={<PiPasswordFill />} placeholder="Enter secure password" value={formData.password} onChange={(e: any) => setFormData({ ...formData, password: e.target.value })} />
                        <Input label="Standard (STD)" icon={<FaGraduationCap />} placeholder="E.g. 12" value={formData.std} onChange={(e: any) => setFormData({ ...formData, std: e.target.value })} />
                        <Input label="SUID" type="number" icon={<FaHashtag />} placeholder="E.g. 221355" value={formData.SUID} onChange={(e: any) => setFormData({ ...formData, SUID: e.target.value })} />
                    </div>

                    <div>
                        <SGDropdown
                            label={loadingRoles ? "Loading system roles..." : "Select Role"}
                            name="role"
                            value={formData.role} 
                            onChange={(e: { target: { name: string; value: string } }) => {
                                setFormData({ ...formData, role: e.target.value, department: isMainSuperAdmin ? "" : userDepartmentId });
                            }}
                            options={roleOptions}
                            error={errors.role}
                        />
                    </div>

                    <AnimatePresence>
                        {(isMainSuperAdmin && isDepartmentHeadSelected()) && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0, y: -10 }}
                                animate={{ opacity: 1, height: "auto", y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -10 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <SGDropdown
                                    label="Select Department"
                                    name="department"
                                    value={formData.department}
                                    onChange={(e: { target: { name: string; value: string } }) => {
                                        setFormData({ ...formData, department: e.target.value });
                                    }}
                                    options={dbDepartments}
                                    error={errors.department}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <button type="submit" className="w-full md:w-auto px-8 h-14 rounded-2xl bg-red-800 hover:bg-red-900 text-white font-black text-base flex items-center justify-center gap-3 shadow-md cursor-pointer">
                            <FaSave className="text-lg" /> CREATE USER
                        </button>
                    </div>

                </form>
            </motion.div>
        </div>
    );
}