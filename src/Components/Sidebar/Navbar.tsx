import { useState, useEffect } from "react";
import { IoMdArrowDroprightCircle } from "react-icons/io";
import { AiOutlinePartition } from "react-icons/ai";
import { IoLogOut } from "react-icons/io5";
import { FaClipboardUser } from "react-icons/fa6";
import {
    FaUserTie,
    FaPlus,
    FaList
} from "react-icons/fa";
import Dropdown from "./DropDown";
import LinkButton from "../commen/Link-button";
import { GoHomeFill } from "react-icons/go";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface NavbarProps {
    isCollapsed: boolean;
    setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

interface ModulePermission {
    create: boolean;
    view: boolean;
}

interface UserPermissions {
    department: ModulePermission;
    role: ModulePermission;
    user: ModulePermission;
}

export default function Navbar({ isCollapsed, setIsCollapsed }: NavbarProps) {
    const [openId, setOpenId] = useState<string | null>(null);
    const navigate = useNavigate();
    
    const [userPerms, setUserPerms] = useState<UserPermissions>({
        department: { create: false, view: false },
        role: { create: false, view: false },
        user: { create: false, view: false }
    });

    useEffect(() => {
        const fetchUserLivePermissions = async () => {
            try {
                let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                if (API_URL.endsWith('/')) {
                    API_URL = API_URL.slice(0, -1);
                }

                const loggedInUserRole = localStorage.getItem("user_role");
                
                // 💡 પ્રોટેક્શન ચેક: જો લોકલ સ્ટોરેજમાં રોલ જ ન હોય તો લોગઆઉટ કરાવી દો
                if (!loggedInUserRole) {
                    handleLogout();
                    return;
                }

                if (loggedInUserRole.toLowerCase() === 'super_admin') {
                    setUserPerms({
                        department: { create: true, view: true },
                        role: { create: true, view: true },
                        user: { create: true, view: true }
                    });
                    return;
                }

                const response = await fetch(`${API_URL}/roll/alldata`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch roles: ${response.status}`);
                }

                const data = await response.json();

                if (data.success && data.roles) {
                    const matchedRole = data.roles.find(
                        (r: any) => r.role_code.trim().toLowerCase() === loggedInUserRole.trim().toLowerCase()
                    );

                    if (matchedRole) {
                        let livePerms = matchedRole.permissions;
                        if (typeof livePerms === 'string') {
                            livePerms = JSON.parse(livePerms);
                        }

                        const safePerms: UserPermissions = {
                            department: {
                                create: !!livePerms?.department?.create,
                                view: !!livePerms?.department?.view
                            },
                            role: {
                                create: !!livePerms?.role?.create,
                                view: !!livePerms?.role?.view
                            },
                            user: {
                                create: !!livePerms?.user?.create,
                                view: !!livePerms?.user?.view
                            }
                        };

                        setUserPerms(safePerms);
                        localStorage.setItem("user_permissions", JSON.stringify(safePerms));
                    }
                }
            } catch (error) {
                console.error("Error fetching live permissions:", error);
                const backup = localStorage.getItem("user_permissions");
                if (backup) {
                    setUserPerms(JSON.parse(backup));
                }
            }
        };

        fetchUserLivePermissions();
    }, []);

    useEffect(() => {
        if (isCollapsed) {
            setOpenId(null);
        }
    }, [isCollapsed]);

    const handleToggle = (id: string) => {
        if (isCollapsed) {
            setIsCollapsed(false);
        }
        setOpenId(openId === id ? null : id);
    };

    // 💡 સિક્યોર લોગઆઉટ ફંક્શન: બધો જ ડેટા લોકલ સ્ટોરેજમાંથી ડિલીટ કરશે
    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("user_role");
        localStorage.removeItem("user_permissions");
        toast.info("Logged out successfully! 🔒");
        navigate("/login");
    };

    const shouldShowModule = (modulePerm: ModulePermission) => {
        return modulePerm.create || modulePerm.view; 
    };

    return (
        <div className="relative w-full h-full flex flex-col gap-4 rounded-2xl bg-red-800 shadow-md shadow-gray-950 p-3 select-none">
            <div
                className=" w-full flex flex-col overflow-y-auto max-h-full gap-2 scrollbar-none"
                style={{
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none',
                }}
            >
                <style>{`
                  div::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>

                {!isCollapsed && (
                    <p className="text-xs font-bold tracking-wider text-red-100 px-2 mb-1 truncate">
                        Admin Management
                    </p>
                )}

                <div className="w-full flex flex-col gap-2">

                    {/* 🏢 DEPARTMENT MODULE */}
                    {shouldShowModule(userPerms.department) && (
                        <Dropdown
                            icon={<AiOutlinePartition />}
                            arrowicon={<IoMdArrowDroprightCircle />}
                            text={!isCollapsed ? "Department" : ""}
                            isOpen={openId === "admin-1"}
                            onToggle={() => handleToggle("admin-1")}
                            isCollapsed={isCollapsed}
                        >
                            {userPerms.department.create && (
                                <Link to={`/deshbord/new-department-create`} className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                                    <FaPlus className="text-red-800/70 text-base shrink-0" />
                                    <span>Create Department</span>
                                </Link>
                            )}
                            {userPerms.department.view && (
                                <Link to={`/deshbord/department-list`} className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                                    <FaList className="text-red-800/70 text-base shrink-0" />
                                    <span>Department</span>
                                </Link>
                            )}
                        </Dropdown>
                    )}

                    {/* 🔐 ROLE & PERMISSION MODULE */}
                    {shouldShowModule(userPerms.role) && (
                        <Dropdown
                            icon={<FaClipboardUser />}
                            arrowicon={<IoMdArrowDroprightCircle />}
                            text={!isCollapsed ? "Roll & Permission" : ""}
                            isOpen={openId === "admin-2"}
                            onToggle={() => handleToggle("admin-2")}
                            isCollapsed={isCollapsed}
                        >
                            {userPerms.role.create && (
                                <Link to={`/deshbord/new-roll-create`} className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                                    <FaPlus className="text-red-800/70 text-base shrink-0" />
                                    <span>Create Role</span>
                                </Link>
                            )}
                            {userPerms.role.view && (
                                <Link to={`/deshbord/roll-list`} className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                                    <FaList className="text-red-800/70 text-base shrink-0" />
                                    <span>Role List</span>
                                </Link>
                            )}
                        </Dropdown>
                    )}

                    {/* 👥 USER / SEVAK MODULE */}
                    {shouldShowModule(userPerms.user) && (
                        <Dropdown
                            icon={<FaUserTie />}
                            arrowicon={<IoMdArrowDroprightCircle />}
                            text={!isCollapsed ? "User / Sevak" : ""}
                            isOpen={openId === "admin-3"}
                            onToggle={() => handleToggle("admin-3")}
                            isCollapsed={isCollapsed}
                        >
                            {userPerms.user.create && (
                                <Link to={`/deshbord/new-user-create`} className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                                    <FaPlus className="text-red-800/70 text-base shrink-0" />
                                    <span>Create User / Sevak</span>
                                </Link>
                            )}
                            {userPerms.user.view && (
                                <Link to={`/deshbord/user-list`} className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                                    <FaList className="text-red-800/70 text-base shrink-0" />
                                    <span>User / Sevak List</span>
                                </Link>
                            )}
                        </Dropdown>
                    )}

                </div>

                <div className="w-full flex flex-col gap-2">
                    <LinkButton To="/deshbord" text="Dashboard" icon={<GoHomeFill />} />
                </div>
            </div>
            {/* 💡 અહીં બટન પર onClick પ્રોપર્ટી સેટ કરી છે */}
            <div className="absolute bottom-0 left-0 p-2 w-full flex flex-col gap-2">
                <button 
                    onClick={handleLogout} 
                    className="w-full flex items-center gap-3 text-sm font-bold text-red-100 hover:bg-red-900/40 p-3 rounded-xl transition-all cursor-pointer"
                >
                    <IoLogOut className="text-xl shrink-0" />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );
}