import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaUser,
    FaSave,
    FaGraduationCap,
    FaHashtag,
    FaCamera,
    FaTimes,
} from "react-icons/fa";
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
    const imageFromUrl = searchParams.get("image") || "";
    const navigate = useNavigate();

    const deptIdFromUrl = searchParams.get("dept_id") || "";
    const nameFromUrl = searchParams.get("name") || "";
    const suidFromUrl = searchParams.get("suid") || "";

    const loggedInUserRole = localStorage.getItem("user_role") || "";
    const userRaw = localStorage.getItem("user");

    let userId: number | null = null;

    if (userRaw) {
        try {
            const parsed = JSON.parse(userRaw);
            userId = parsed.id ? Number(parsed.id) : null;
        } catch (error) {
            console.error(error);
        }
    }

    const isMainSuperAdmin =
        userId === 123098 || loggedInUserRole.trim().toUpperCase() === "SUPER_ADMIN";

    const isRedirectedFromList = Boolean(nameFromUrl || suidFromUrl || deptIdFromUrl);

    const [formData, setFormData] = useState({
        fullName: nameFromUrl,
        username: "",
        password: "",
        suid: suidFromUrl,
        rollNumber: suidFromUrl.replace(/[^0-9]/g, ""),
        std: "",
        role: isRedirectedFromList ? "user" : "",
        department: isRedirectedFromList ? deptIdFromUrl : "",
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState(imageFromUrl);

    const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
    const [dbDepartments, setDbDepartments] = useState<DeptOption[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(true);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        return () => {
            if (previewImage) URL.revokeObjectURL(previewImage);
        };
    }, [previewImage]);

    const isDepartmentHeadSelected = () => {
        const role = formData.role.trim().toLowerCase();
        return role === "department main" || role === "department_main" || role === "head1029";
    };

    useEffect(() => {
        const fetchLiveDepartments = async () => {
            try {
                let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
                if (API_URL.endsWith("/")) API_URL = API_URL.slice(0, -1);

                const response = await fetch(`${API_URL}/auth/departments`);
                const data = await response.json();

                if (data.success && data.departments) {
                    setDbDepartments(
                        data.departments.map((department: any) => ({
                            value: String(department.id),
                            label: department.name || department.dept_name,
                        }))
                    );
                }
            } catch (error) {
                console.error(error);
            }
        };

        const fetchRolesForDropdown = async () => {
            if (isRedirectedFromList) {
                setRoleOptions([]);
                setLoadingRoles(false);
                return;
            }

            try {
                let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
                if (API_URL.endsWith("/")) API_URL = API_URL.slice(0, -1);

                const response = await fetch(`${API_URL}/auth/role/alldata`);
                const data = await response.json();

                if (data.success && data.roles) {
                    const hiddenRoleCodes = ["user"];

                    let options = data.roles
                        .map((role: any) => ({
                            value: role.role_code.trim().toLowerCase(),
                            label: role.role_name.trim(),
                        }))
                        .filter((role: RoleOption) => !hiddenRoleCodes.includes(role.value));

                    if (!isMainSuperAdmin) {
                        options = [];
                    }

                    setRoleOptions(options);
                }
            } catch (error) {
                console.error(error);

                setRoleOptions(
                    isMainSuperAdmin
                        ? [
                            { value: "admin", label: "Admin" },
                            { value: "department main", label: "Department Main" },
                        ]
                        : []
                );
            } finally {
                setLoadingRoles(false);
            }
        };

        fetchLiveDepartments();
        fetchRolesForDropdown();
    }, [isMainSuperAdmin, isRedirectedFromList]);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select only image file");
            return;
        }

        if (previewImage) URL.revokeObjectURL(previewImage);

        setSelectedFile(file);
        setPreviewImage(URL.createObjectURL(file));
        event.target.value = "";
    };

    const removeSelectedImage = () => {
        if (previewImage) URL.revokeObjectURL(previewImage);
        setPreviewImage("");
        setSelectedFile(null);
    };

    const validateForm = () => {
        const nextErrors: { [key: string]: string } = {};

        if (!formData.fullName.trim()) nextErrors.fullName = "Full name is required";
        if (!formData.username.trim()) nextErrors.username = "Username is required";
        if (!formData.password.trim()) nextErrors.password = "Password is required";
        if (!formData.suid.trim()) nextErrors.suid = "SUID is required";
        if (!formData.rollNumber.trim()) nextErrors.rollNumber = "Roll number is required";
        if (!formData.std.trim()) nextErrors.std = "Standard is required";

        if (!isRedirectedFromList && !formData.role) {
            nextErrors.role = "Role is required";
        }

        if (isDepartmentHeadSelected() && !formData.department) {
            nextErrors.department = "Department is required for Department Head";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isCreating) return;

        if (!validateForm()) {
            toast.error("Please fill all required fields.");
            return;
        }

        setIsCreating(true);
        await wait(150);

        try {
            let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
            if (API_URL.endsWith("/")) API_URL = API_URL.slice(0, -1);

            const finalRole = isRedirectedFromList ? "user" : formData.role;
            const finalDepartment = isRedirectedFromList
                ? deptIdFromUrl
                : isDepartmentHeadSelected()
                    ? formData.department
                    : "5";
            const dataToSend = new FormData();
            dataToSend.append("fullName", formData.fullName.trim());
            dataToSend.append("username", formData.username.trim());
            dataToSend.append("password", formData.password);
            dataToSend.append("suid", formData.suid.trim());
            dataToSend.append("rollNumber", formData.rollNumber.trim());
            dataToSend.append("std", formData.std.trim());
            dataToSend.append("userRole", finalRole);
            dataToSend.append("department", finalDepartment);

            if (selectedFile) {
                dataToSend.append("image", selectedFile);
            } else if (imageFromUrl) {
                dataToSend.append("existingImageUrl", imageFromUrl);
            }



            const response = await fetch(`${API_URL}/create/user`, {
                method: "POST",
                body: dataToSend,
            });

            const data = await response.json();

            if (!response.ok) {
                console.log("Create user error:", data);
                toast.error(data.detail || data.message || "Failed to create user");
                return;
            }

            if (response.ok && data.success) {
                toast.success("User created successfully!");

                const createdSuid = formData.suid.trim();

                setFormData({
                    fullName: "",
                    username: "",
                    password: "",
                    suid: "",
                    rollNumber: "",
                    std: "",
                    role: "",
                    department: "",
                });

                removeSelectedImage();

                if (isRedirectedFromList) {
                    try {
                        await fetch(
                            `${API_URL}/admit-request/delete-by-suid/${encodeURIComponent(createdSuid)}`,
                            { method: "DELETE" }
                        );
                    } catch (purgeError) {
                        console.error("Admit request purge error:", purgeError);
                    }

                    const deptNum = Number(deptIdFromUrl);

                    if (deptNum === 1) {
                        navigate("/deshbord/g-music/user-lists?dept_id=1");
                    } else if (deptNum === 2) {
                        navigate("/deshbord/gurukul-art/user-lists?dept_id=2");
                    } else {
                        navigate("/deshbord/user-list");
                    }
                }
            } else {
                toast.error(data.message || "Failed to create user");
            }
        } catch (error) {
            console.error(error);
            toast.error("Server is offline or unreachable");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="flex w-full select-none flex-col items-center p-4 md:p-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-black uppercase tracking-tight text-red-950">
                    Create New Sevak / User
                </h1>
                <div className="mx-auto mt-3 h-1.5 w-16 rounded-full bg-red-800" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-7xl rounded-[2.5rem] border border-red-50 bg-white p-6 shadow-md md:p-10"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center gap-3 border-b border-gray-100 pb-6">
                        <label className="relative flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-[2rem] border-2 border-dashed border-red-200 bg-red-50 text-red-800 transition-all hover:bg-red-100">
                            {previewImage ? (
                                <img
                                    src={previewImage}
                                    alt="Profile preview"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <FaCamera size={24} />
                                    <span className="text-[10px] font-black uppercase tracking-wider">
                                        Select Image
                                    </span>
                                </div>
                            )}

                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </label>

                        <p className="text-xs font-bold text-gray-400">
                            Profile image optional
                        </p>

                        {previewImage && (
                            <button
                                type="button"
                                onClick={removeSelectedImage}
                                className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-xs font-black uppercase text-red-800 hover:bg-red-100"
                            >
                                <FaTimes size={10} />
                                Remove Image
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <Input
                            label="Full Name"
                            icon={<FaUser />}
                            placeholder="E.g. Prit"
                            value={formData.fullName}
                            onChange={(event: any) =>
                                setFormData({ ...formData, fullName: event.target.value })
                            }
                        />

                        <Input
                            label="Username"
                            icon={<FaUser />}
                            placeholder="E.g. prit-123"
                            value={formData.username}
                            onChange={(event: any) =>
                                setFormData({ ...formData, username: event.target.value })
                            }
                        />

                        <Input
                            type="password"
                            label="Password"
                            icon={<PiPasswordFill />}
                            placeholder="Enter secure password"
                            value={formData.password}
                            onChange={(event: any) =>
                                setFormData({ ...formData, password: event.target.value })
                            }
                        />

                        <Input
                            label="SUID"
                            icon={<FaHashtag />}
                            placeholder="E.g. SUID-1001"
                            value={formData.suid}
                            onChange={(event: any) =>
                                setFormData({ ...formData, suid: event.target.value })
                            }
                        />

                        <Input
                            label="Roll Number"
                            type="number"
                            icon={<FaHashtag />}
                            placeholder="E.g. 221355"
                            value={formData.rollNumber}
                            onChange={(event: any) =>
                                setFormData({ ...formData, rollNumber: event.target.value })
                            }
                        />

                        <Input
                            label="Standard (STD)"
                            icon={<FaGraduationCap />}
                            placeholder="E.g. 12"
                            value={formData.std}
                            onChange={(event: any) =>
                                setFormData({ ...formData, std: event.target.value })
                            }
                        />
                    </div>

                    {!isRedirectedFromList && (
                        <SGDropdown
                            label={loadingRoles ? "Loading system roles..." : "Select Role"}
                            name="role"
                            value={formData.role}
                            onChange={(event: { target: { name: string; value: string } }) => {
                                setFormData({
                                    ...formData,
                                    role: event.target.value,
                                    department: "",
                                });
                            }}
                            options={roleOptions}
                            error={errors.role}
                        />
                    )}

                    <AnimatePresence>
                        {!isRedirectedFromList && isDepartmentHeadSelected() && (
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
                                    onChange={(event: { target: { name: string; value: string } }) => {
                                        setFormData({ ...formData, department: event.target.value });
                                    }}
                                    options={dbDepartments}
                                    error={errors.department}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {isRedirectedFromList && (
                        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-900">
                            This profile will be created as a User for the selected department.
                        </div>
                    )}

                    <div className="flex justify-end border-t border-gray-100 pt-4">
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-red-800 px-8 text-base font-black text-white shadow-md transition-all hover:bg-red-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-75 md:w-auto"
                        >
                            {isCreating ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                    CREATING...
                                </>
                            ) : (
                                <>
                                    <FaSave className="text-lg" />
                                    CREATE USER
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}