import { useState, useEffect } from "react";
import { IoMdArrowDroprightCircle } from "react-icons/io";
import { IoLogOut } from "react-icons/io5";
// 🎯 FaMusic આઇકોન અહીં ઇમ્પોર્ટ કર્યો છે
import { FaUserTie, FaPlus, FaList, FaBuilding, FaImages, FaSlidersH, FaMusic } from "react-icons/fa";
import { FaClipboardUser } from "react-icons/fa6";
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
    role: ModulePermission;
    user: ModulePermission;
}

export default function Navbar({ isCollapsed, setIsCollapsed }: NavbarProps) {
    const [openId, setOpenId] = useState<string | null>(null);
    const navigate = useNavigate();

    const [userPerms, setUserPerms] = useState<UserPermissions>({
        role: { create: false, view: false },
        user: { create: false, view: false }
    });

    const loggedInUserRole = localStorage.getItem("user_role") || "";
    const userRaw = localStorage.getItem("user");

    let userId: number | null = null;
    let userDepartmentId: number | null = null;

    if (userRaw) {
        try {
            const parsed = JSON.parse(userRaw);
            userId = parsed.id ? Number(parsed.id) : null;
            userDepartmentId = parsed.department_id !== undefined ? Number(parsed.department_id) : null;
        } catch (e) {
            console.error(e);
        }
    }

    const isMainSuperAdmin = userId === 123098 || loggedInUserRole.trim().toUpperCase() === "SUPER_ADMIN";
    const isNormalUser = loggedInUserRole.trim().toLowerCase() === "user";

    const allDepartments = [
        { id: 1, department_name: "G-Music", route: "g-music" },
        { id: 2, department_name: "Gurukul Art", route: "gurukul-art" }
    ];

    const staticDepartments = isMainSuperAdmin
        ? allDepartments
        : allDepartments.filter(dept => Number(dept.id) === Number(userDepartmentId));

    const fetchLiveNavbarStructure = async () => {
        try {
            let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            if (API_URL.endsWith('/')) API_URL = API_URL.slice(0, -1);

            if (isMainSuperAdmin) {
                setUserPerms({
                    role: { create: true, view: true },
                    user: { create: true, view: true }
                });
                return;
            }

            const response = await fetch(`${API_URL}/roll/alldata`);
            const data = await response.json();

            if (data.success && data.roles) {
                const cleanRole = loggedInUserRole.trim().toLowerCase();
                const matchedRole = data.roles.find(
                    (r: any) => r.role_code.trim().toLowerCase() === cleanRole
                );

                if (matchedRole) {
                    let livePerms = matchedRole.permissions;
                    if (typeof livePerms === 'string') {
                        livePerms = JSON.parse(livePerms);
                    }

                    setUserPerms({
                        role: {
                            create: !!livePerms?.role?.create,
                            view: !!livePerms?.role?.view
                        },
                        user: {
                            create: !!livePerms?.user?.create,
                            view: !!livePerms?.user?.view
                        }
                    });
                }
            }
        } catch (error) {
            console.error(error);
            if (isMainSuperAdmin) {
                setUserPerms({
                    role: { create: true, view: true },
                    user: { create: true, view: true }
                });
            }
        }
    };

    useEffect(() => {
        if (!loggedInUserRole) {
            handleLogout();
            return;
        }
        fetchLiveNavbarStructure();
    }, [loggedInUserRole]);

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

    const handleLogout = () => {
        localStorage.clear();
        toast.info("Logged out successfully! 🔒");
        navigate("/login");
    };

    return (
        <div className="relative w-full h-full flex flex-col gap-4 rounded-2xl bg-red-800 shadow-md p-3 select-none">
            <div className="w-full flex flex-col overflow-y-auto max-h-full gap-2 scrollbar-none">

                {!isCollapsed && (
                    <p className="text-xs font-black uppercase tracking-wider text-red-100 px-2 mb-1 truncate">
                        Admin Management
                    </p>
                )}

                <div className="w-full flex flex-col gap-2">
                    {(userPerms.role.create || userPerms.role.view || isMainSuperAdmin) && (
                        <Dropdown
                            icon={<FaClipboardUser />}
                            arrowicon={<IoMdArrowDroprightCircle />}
                            text={!isCollapsed ? "Roll & Permission" : ""}
                            isOpen={openId === "admin-1"}
                            onToggle={() => handleToggle("admin-1")}
                            isCollapsed={isCollapsed}
                        >
                            {(userPerms.role.create || isMainSuperAdmin) && (
                                <Link to={`/deshbord/new-roll-create`} className="flex items-center gap-2 w-full text-left p-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-red-900 hover:bg-red-800/10 transition-colors">
                                    <FaPlus className="text-red-800/70 text-base shrink-0" />
                                    <span>Create Role</span>
                                </Link>
                            )}
                            {(userPerms.role.view || isMainSuperAdmin) && (
                                <Link to={`/deshbord/roll-list`} className="flex items-center gap-2 w-full text-left p-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-red-900 hover:bg-red-800/10 transition-colors">
                                    <FaList className="text-red-800/70 text-base shrink-0" />
                                    <span>Role List</span>
                                </Link>
                            )}
                        </Dropdown>
                    )}

                    {(userPerms.user.create || userPerms.user.view || isMainSuperAdmin) && (
                        <Dropdown
                            icon={<FaUserTie />}
                            arrowicon={<IoMdArrowDroprightCircle />}
                            text={!isCollapsed ? "User / Sevak" : ""}
                            isOpen={openId === "admin-2"}
                            onToggle={() => handleToggle("admin-2")}
                            isCollapsed={isCollapsed}
                        >
                            {(userPerms.user.create || isMainSuperAdmin) && (
                                <Link to={`/deshbord/new-user-create`} className="flex items-center gap-2 w-full text-left p-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-red-900 hover:bg-red-800/10 transition-colors">
                                    <FaPlus className="text-red-800/70 text-base shrink-0" />
                                    <span>Create User / Sevak</span>
                                </Link>
                            )}
                            {(userPerms.user.view || isMainSuperAdmin) && (
                                <Link to={`/deshbord/user-list`} className="flex items-center gap-2 w-full text-left p-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-red-900 hover:bg-red-800/10 transition-colors">
                                    <FaList className="text-red-800/70 text-base shrink-0" />
                                    <span>User / Sevak List</span>
                                </Link>
                            )}
                        </Dropdown>
                    )}
                    {isMainSuperAdmin && (
                        <Dropdown
                            icon={<FaImages />}
                            arrowicon={<IoMdArrowDroprightCircle />}
                            text={!isCollapsed ? "Overview Control" : ""}
                            isOpen={openId === "admin-3"}
                            onToggle={() => handleToggle("admin-3")}
                            isCollapsed={isCollapsed}
                        >
                            <Link
                                to="/deshbord/overview-controller"
                                className="flex items-center gap-2 w-full text-left p-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-red-900 hover:bg-red-800/10 transition-colors"
                            >
                                <FaSlidersH className="text-red-800/70 text-base shrink-0" />
                                <span>Manage Overview</span>
                            </Link>

                            <Link
                                to="/deshbord/overview-music"
                                className="flex items-center gap-2 w-full text-left p-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-red-900 hover:bg-red-800/10 transition-colors"
                            >
                                <FaMusic className="text-red-800/70 text-base shrink-0" />
                                <span>Music Tracks</span>
                            </Link>
                        </Dropdown>
                    )}
                </div>

                <div className="w-full flex flex-col gap-2">
                    <LinkButton To="/deshbord" text="Dashboard" icon={<GoHomeFill />} />
                </div>

                {!isNormalUser && staticDepartments.length > 0 && (
                    <>
                        {!isCollapsed && (
                            <p className="text-xs font-black uppercase tracking-wider text-red-100 px-2 mt-2 mb-1 truncate">
                                Departments
                            </p>
                        )}

                        <div className="w-full flex flex-col gap-2">
                            {staticDepartments.map((dept, index) => (
                                <Dropdown
                                    key={dept.id}
                                    icon={<FaBuilding />}
                                    arrowicon={<IoMdArrowDroprightCircle />}
                                    text={!isCollapsed ? dept.department_name : ""}
                                    isOpen={openId === `dept-${index}`}
                                    onToggle={() => handleToggle(`dept-${index}`)}
                                    isCollapsed={isCollapsed}
                                >
                                    <Link to={`/deshbord/${dept.route}/admit-request?dept_id=${dept.id}`} className="flex items-center gap-2 w-full text-left p-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-red-900 hover:bg-red-800/10 transition-colors">
                                        <FaPlus className="text-red-800/70 text-base shrink-0" />
                                        <span>Admit Request</span>
                                    </Link>
                                    <Link to={`/deshbord/${dept.route}/user-lists?dept_id=${dept.id}`} className="flex items-center gap-2 w-full text-left p-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-red-900 hover:bg-red-800/10 transition-colors">
                                        <FaList className="text-red-800/70 text-base shrink-0" />
                                        <span>Student List</span>
                                    </Link>
                                </Dropdown>
                            ))}
                        </div>
                    </>
                )}

            </div>

            <div className="absolute bottom-0 left-0 p-2 w-full flex flex-col gap-2">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 text-xs font-black uppercase tracking-wider text-red-100 hover:bg-red-900/40 p-3 rounded-xl transition-all cursor-pointer"
                >
                    <IoLogOut className="text-xl shrink-0" />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );
}