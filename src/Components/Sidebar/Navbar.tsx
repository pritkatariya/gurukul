import { useState, useEffect } from "react";
import { IoMdArrowDroprightCircle } from "react-icons/io";
import { IoLogOut } from "react-icons/io5";
import {
    FaUserTie,
    FaPlus,
    FaList,
    FaBuilding,
    FaImages,
    FaSlidersH,
    FaMusic,
    FaCalendarPlus,
    FaQuoteLeft,
    FaWater,
    FaEye,
} from "react-icons/fa";
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

interface OverviewPermissions {
    manage: boolean;
    music: boolean;
    editor: boolean;
}

interface UserPermissions {
    role: ModulePermission;
    user: ModulePermission;
    overview: OverviewPermissions;
}

const emptyPerms: UserPermissions = {
    role: { create: false, view: false },
    user: { create: false, view: false },
    overview: { manage: false, music: false, editor: false },
};

export default function Navbar({ isCollapsed, setIsCollapsed }: NavbarProps) {
    const [openId, setOpenId] = useState<string | null>(null);
    const navigate = useNavigate();

    const [userPerms, setUserPerms] = useState<UserPermissions>(emptyPerms);

    const loggedInUserRole = localStorage.getItem("user_role") || "";
    const userRaw = localStorage.getItem("user");

    let userId: number | null = null;
    let userDepartmentId: number | null = null;

    if (userRaw) {
        try {
            const parsed = JSON.parse(userRaw);
            userId = parsed.id ? Number(parsed.id) : null;
            userDepartmentId =
                parsed.department_id !== undefined ? Number(parsed.department_id) : null;
        } catch (error) {
            console.error(error);
        }
    }

    const roleCode = loggedInUserRole.trim().toLowerCase();

    const isMainSuperAdmin =
        userId === 123098 ||
        roleCode === "super_admin" ||
        roleCode === "super-admin" ||
        roleCode === "superadmin";

    const isNormalUser = roleCode === "user";

    const hasRoleDropdown = userPerms.role.create || userPerms.role.view || isMainSuperAdmin;
    const hasUserDropdown = userPerms.user.create || userPerms.user.view || isMainSuperAdmin;

    const hasOverviewDropdown =
        userPerms.overview.manage ||
        userPerms.overview.music ||
        userPerms.overview.editor ||
        isMainSuperAdmin;

    const allDepartments = [
        { id: 1, department_name: "G-Music", route: "g-music" },
        { id: 2, department_name: "Gurukul Art", route: "gurukul-art" },
    ];

    const staticDepartments = isMainSuperAdmin
        ? allDepartments
        : allDepartments.filter((dept) => Number(dept.id) === Number(userDepartmentId));

    const fetchLiveNavbarStructure = async () => {
        try {
            let API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
            if (API_URL.endsWith("/")) API_URL = API_URL.slice(0, -1);

            if (isMainSuperAdmin) {
                setUserPerms({
                    role: { create: true, view: true },
                    user: { create: true, view: true },
                    overview: { manage: true, music: true, editor: true },
                });
                return;
            }

            const response = await fetch(`${API_URL}/roll/alldata`);
            const data = await response.json();

            if (data.success && data.roles) {
                const matchedRole = data.roles.find(
                    (role: any) => role.role_code.trim().toLowerCase() === roleCode
                );

                if (matchedRole) {
                    let livePerms = matchedRole.permissions;

                    if (typeof livePerms === "string") {
                        livePerms = JSON.parse(livePerms);
                    }

                    setUserPerms({
                        role: {
                            create: !!livePerms?.role?.create,
                            view: !!livePerms?.role?.view,
                        },
                        user: {
                            create: !!livePerms?.user?.create,
                            view: !!livePerms?.user?.view,
                        },
                        overview: {
                            manage: !!livePerms?.overview?.manage,
                            music: !!livePerms?.overview?.music,
                            editor: !!livePerms?.overview?.editor,
                        },
                    });
                } else {
                    setUserPerms(emptyPerms);
                }
            } else {
                setUserPerms(emptyPerms);
            }
        } catch (error) {
            console.error(error);

            if (isMainSuperAdmin) {
                setUserPerms({
                    role: { create: true, view: true },
                    user: { create: true, view: true },
                    overview: { manage: true, music: true, editor: true },
                });
            } else {
                setUserPerms(emptyPerms);
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
        toast.info("Logged out successfully!");
        navigate("/login");
    };

    return (
        <div className="relative flex h-full w-full select-none flex-col gap-4 rounded-2xl bg-red-800 p-3 shadow-md">
            <div className="flex max-h-full w-full flex-col gap-2 overflow-y-auto scrollbar-none">
                {!isCollapsed && (hasRoleDropdown || hasUserDropdown || hasOverviewDropdown) && (
                    <p className="mb-1 truncate px-2 text-xs font-black uppercase tracking-wider text-red-100">
                        Admin Management
                    </p>
                )}

                <div className="flex w-full flex-col gap-2">
                    {hasRoleDropdown && (
                        <Dropdown
                            icon={<FaClipboardUser />}
                            arrowicon={<IoMdArrowDroprightCircle />}
                            text={!isCollapsed ? "Roll & Permission" : ""}
                            isOpen={openId === "admin-1"}
                            onToggle={() => handleToggle("admin-1")}
                            isCollapsed={isCollapsed}
                        >
                            {(userPerms.role.create || isMainSuperAdmin) && (
                                <Link
                                    to="/deshbord/new-roll-create"
                                    className="flex w-full items-center gap-2 rounded-xl p-2.5 text-left text-xs font-black uppercase tracking-wider text-red-900 transition-colors hover:bg-red-800/10"
                                >
                                    <FaPlus className="shrink-0 text-base text-red-800/70" />
                                    <span>Create Role</span>
                                </Link>
                            )}

                            {(userPerms.role.view || isMainSuperAdmin) && (
                                <Link
                                    to="/deshbord/roll-list"
                                    className="flex w-full items-center gap-2 rounded-xl p-2.5 text-left text-xs font-black uppercase tracking-wider text-red-900 transition-colors hover:bg-red-800/10"
                                >
                                    <FaList className="shrink-0 text-base text-red-800/70" />
                                    <span>Role List</span>
                                </Link>
                            )}
                        </Dropdown>
                    )}

                    {hasUserDropdown && (
                        <Dropdown
                            icon={<FaUserTie />}
                            arrowicon={<IoMdArrowDroprightCircle />}
                            text={!isCollapsed ? "User / Sevak" : ""}
                            isOpen={openId === "admin-2"}
                            onToggle={() => handleToggle("admin-2")}
                            isCollapsed={isCollapsed}
                        >
                            {(userPerms.user.create || isMainSuperAdmin) && (
                                <Link
                                    to="/deshbord/new-user-create"
                                    className="flex w-full items-center gap-2 rounded-xl p-2.5 text-left text-xs font-black uppercase tracking-wider text-red-900 transition-colors hover:bg-red-800/10"
                                >
                                    <FaPlus className="shrink-0 text-base text-red-800/70" />
                                    <span>Create User / Sevak</span>
                                </Link>
                            )}

                            {(userPerms.user.view || isMainSuperAdmin) && (
                                <Link
                                    to="/deshbord/user-list"
                                    className="flex w-full items-center gap-2 rounded-xl p-2.5 text-left text-xs font-black uppercase tracking-wider text-red-900 transition-colors hover:bg-red-800/10"
                                >
                                    <FaList className="shrink-0 text-base text-red-800/70" />
                                    <span>User / Sevak List</span>
                                </Link>
                            )}
                        </Dropdown>
                    )}

                    {hasOverviewDropdown && (
                        <Dropdown
                            icon={<FaImages />}
                            arrowicon={<IoMdArrowDroprightCircle />}
                            text={!isCollapsed ? "Overview Control" : ""}
                            isOpen={openId === "admin-3"}
                            onToggle={() => handleToggle("admin-3")}
                            isCollapsed={isCollapsed}
                        >
                            {(userPerms.overview.manage || isMainSuperAdmin) && (
                                <Link
                                    to="/deshbord/overview-controller"
                                    className="flex w-full items-center gap-2 rounded-xl p-2.5 text-left text-xs font-black uppercase tracking-wider text-red-900 transition-colors hover:bg-red-800/10"
                                >
                                    <FaSlidersH className="shrink-0 text-base text-red-800/70" />
                                    <span>Manage Overview</span>
                                </Link>
                            )}

                            {(userPerms.overview.music || isMainSuperAdmin) && (
                                <Link
                                    to="/deshbord/overview-music"
                                    className="flex w-full items-center gap-2 rounded-xl p-2.5 text-left text-xs font-black uppercase tracking-wider text-red-900 transition-colors hover:bg-red-800/10"
                                >
                                    <FaMusic className="shrink-0 text-base text-red-800/70" />
                                    <span>Music Tracks</span>
                                </Link>
                            )}

                            {(userPerms.overview.manage || isMainSuperAdmin) && (
                                <Link
                                    to="/deshbord/amrut-nu-aachaman"
                                    className="flex w-full items-center gap-2 rounded-xl p-2.5 text-left text-xs font-black uppercase tracking-wider text-red-900 transition-colors hover:bg-red-800/10"
                                >
                                    <FaWater className="shrink-0 text-base text-red-800/70" />
                                    <span>Amrut Nu Aachaman</span>
                                </Link>
                            )}

                            {(userPerms.overview.manage || isMainSuperAdmin) && (
                                <Link
                                    to="/deshbord/daily-darshan"
                                    className="flex w-full items-center gap-2 rounded-xl p-2.5 text-left text-xs font-black uppercase tracking-wider text-red-900 transition-colors hover:bg-red-800/10"
                                >
                                    <FaEye className="shrink-0 text-base text-red-800/70" />
                                    <span>Daily Darshan</span>
                                </Link>
                            )}

                            {(userPerms.overview.editor || isMainSuperAdmin) && (
                                <Link
                                    to="/deshbord/event-editor"
                                    className="flex w-full items-center gap-2 rounded-xl p-2.5 text-left text-xs font-black uppercase tracking-wider text-red-900 transition-colors hover:bg-red-800/10"
                                >
                                    <FaCalendarPlus className="shrink-0 text-base text-red-800/70" />
                                    <span>Event Editor</span>
                                </Link>
                            )}
                        </Dropdown>
                    )}
                </div>{isMainSuperAdmin && (
    <Dropdown
        icon={<FaQuoteLeft />}
        arrowicon={<IoMdArrowDroprightCircle />}
        text={!isCollapsed ? "Daily Quotes" : ""}
        isOpen={openId === "admin-4"}
        onToggle={() => handleToggle("admin-4")}
        isCollapsed={isCollapsed}
    >
        <Link to="/deshbord/amrut-nu-aachaman" className="flex items-center gap-2 w-full text-left p-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-red-900 hover:bg-red-800/10 transition-colors">
            <FaWater className="text-red-800/70 text-base shrink-0" />
            <span>Amrut nu Aachaman</span>
        </Link>
        <Link to="/deshbord/daily-darshan" className="flex items-center gap-2 w-full text-left p-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-red-900 hover:bg-red-800/10 transition-colors">
            <FaEye className="text-red-800/70 text-base shrink-0" />
            <span>Daily Darshan</span>
        </Link>
    </Dropdown>
)}

                <div className="flex w-full flex-col gap-2">
                    <LinkButton To="/deshbord" text="Dashboard" icon={<GoHomeFill />} />
                </div>

                {!isNormalUser && staticDepartments.length > 0 && (
                    <>
                        {!isCollapsed && (
                            <p className="mb-1 mt-2 truncate px-2 text-xs font-black uppercase tracking-wider text-red-100">
                                Departments
                            </p>
                        )}

                        <div className="flex w-full flex-col gap-2">
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
                                    <Link
                                        to={`/deshbord/${dept.route}/admit-request?dept_id=${dept.id}`}
                                        className="flex w-full items-center gap-2 rounded-xl p-2.5 text-left text-xs font-black uppercase tracking-wider text-red-900 transition-colors hover:bg-red-800/10"
                                    >
                                        <FaPlus className="shrink-0 text-base text-red-800/70" />
                                        <span>Admit Request</span>
                                    </Link>

                                    <Link
                                        to={`/deshbord/${dept.route}/user-lists?dept_id=${dept.id}`}
                                        className="flex w-full items-center gap-2 rounded-xl p-2.5 text-left text-xs font-black uppercase tracking-wider text-red-900 transition-colors hover:bg-red-800/10"
                                    >
                                        <FaList className="shrink-0 text-base text-red-800/70" />
                                        <span>Student List</span>
                                    </Link>
                                </Dropdown>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="absolute bottom-0 left-0 flex w-full flex-col gap-2 p-2">
                <button
                    onClick={handleLogout}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-xl p-3 text-xs font-black uppercase tracking-wider text-red-100 transition-all hover:bg-red-900/40"
                >
                    <IoLogOut className="shrink-0 text-xl" />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );
}