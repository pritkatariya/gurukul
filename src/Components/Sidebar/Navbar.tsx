import { useState, useEffect } from "react";
import { IoMdArrowDroprightCircle } from "react-icons/io";
import {
    FaUserTie,
    FaKey,
    FaUserPlus,
    FaUsersCog,
    FaMusic,
    FaTv,
    FaGraduationCap
} from "react-icons/fa";
import Dropdown from "./DropDown";
import LinkButton from "../commen/Link-button";
import { GoHomeFill } from "react-icons/go";
import { Link } from "react-router-dom";

interface NavbarProps {
    isCollapsed: boolean;
    setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Navbar({ isCollapsed, setIsCollapsed }: NavbarProps) {
    const [openId, setOpenId] = useState<string | null>(null);

    // સાઇડબાર બંધ (close) થતાં જ બધા જ ડ્રોપડાઉન આપોઆપ બંધ થઈ જશે
    useEffect(() => {
        if (isCollapsed) {
            setOpenId(null);
        }
    }, [isCollapsed]);

    const handleToggle = (id: string) => {
        // જો સાઇડબાર નાનો હોય અને ક્લિક કરીએ, તો સાઇડબાર પહેલા ઓપન (મોટો) થઈ જશે
        if (isCollapsed) {
            setIsCollapsed(false);
        }
        setOpenId(openId === id ? null : id);
    };

    return (
        <div className="w-full h-full flex flex-col gap-4 rounded-2xl bg-red-800 shadow-md shadow-gray-950 p-3 select-none">
            <div
                className="w-full flex flex-col overflow-y-auto max-h-full gap-2 scrollbar-none"
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

                    <Dropdown
                        icon={<FaUserTie />}
                        arrowicon={<IoMdArrowDroprightCircle />}
                        text={!isCollapsed ? "Admin Controls 1" : ""}
                        isOpen={openId === "admin-1"}
                        onToggle={() => handleToggle("admin-1")}
                        isCollapsed={isCollapsed}
                    >
                        <Link to={`/deshbord/new-admin-create`} className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                            <FaUserPlus className="text-red-800/70 text-base shrink-0" />
                            <span>Create New Admin</span>
                        </Link>
                        <button className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                            <FaUserPlus className="text-red-800/70 text-base shrink-0" />
                            <span>Create Department</span>
                        </button>
                        <Link to={`/deshbord/new-user-create`} className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                            <FaUserPlus className="text-red-800/70 text-base shrink-0" />
                            <span>Add New Sevak</span>
                        </Link>
                        <Link to={`/deshbord/new-roll-create`} className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                            <FaUsersCog className="text-red-800/70 text-base shrink-0" />
                            <span>Manage Roles</span>
                        </Link>
                        <button className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                            <FaKey className="text-red-800/70 text-base shrink-0" />
                            <span>Security & Permissions</span>
                        </button>
                    </Dropdown>

                    <LinkButton To="/deshbord" text="Dashboard" icon={<GoHomeFill />} className={`w-`}/>

                    <Dropdown
                        icon={<FaTv />}
                        arrowicon={<IoMdArrowDroprightCircle />}
                        text={!isCollapsed ? "Gurukul Arts" : ""}
                        isOpen={openId === "admin-2"}
                        onToggle={() => handleToggle("admin-2")}
                        isCollapsed={isCollapsed}
                    >
                        <button className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                            <FaUserPlus className="text-red-800/70 text-base shrink-0" />
                            <span>Create New Admin</span>
                        </button>
                        <button className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                            <FaUserPlus className="text-red-800/70 text-base shrink-0" />
                            <span>Create Department</span>
                        </button>
                        <button className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                            <FaUserPlus className="text-red-800/70 text-base shrink-0" />
                            <span>Add New Sevak</span>
                        </button>
                        <button className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                            <FaUsersCog className="text-red-800/70 text-base shrink-0" />
                            <span>Manage Roles</span>
                        </button>
                        <button className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                            <FaKey className="text-red-800/70 text-base shrink-0" />
                            <span>Security & Permissions</span>
                        </button>
                    </Dropdown>

                    {/* 3. G-Music */}
                    <Dropdown
                        icon={<FaMusic />}
                        arrowicon={<IoMdArrowDroprightCircle />}
                        text={!isCollapsed ? "G-Music" : ""}
                        isOpen={openId === "admin-3"}
                        onToggle={() => handleToggle("admin-3")}
                        isCollapsed={isCollapsed}
                    >
                        <button className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                            <FaUserPlus className="text-red-800/70 text-base shrink-0" />
                            <span>Create New Admin</span>
                        </button>
                        <button className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                            <FaUserPlus className="text-red-800/70 text-base shrink-0" />
                            <span>Create Department</span>
                        </button>
                        <button className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                            <FaUserPlus className="text-red-800/70 text-base shrink-0" />
                            <span>Add New Sevak</span>
                        </button>
                        <button className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                            <FaUsersCog className="text-red-800/70 text-base shrink-0" />
                            <span>Manage Roles</span>
                        </button>
                        <button className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                            <FaKey className="text-red-800/70 text-base shrink-0" />
                            <span>Security & Permissions</span>
                        </button>
                    </Dropdown>

                    {/* 4. G-Culcher */}
                    <Dropdown
                        icon={<FaGraduationCap />}
                        arrowicon={<IoMdArrowDroprightCircle />}
                        text={!isCollapsed ? "G-Culcher" : ""}
                        isOpen={openId === "admin-4"}
                        onToggle={() => handleToggle("admin-4")}
                        isCollapsed={isCollapsed}
                    >
                        <button className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                            <FaUserPlus className="text-red-800/70 text-base shrink-0" />
                            <span>Create New Admin</span>
                        </button>
                        <button className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                            <FaUserPlus className="text-red-800/70 text-base shrink-0" />
                            <span>Create Department</span>
                        </button>
                        <button className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                            <FaUserPlus className="text-red-800/70 text-base shrink-0" />
                            <span>Add New Sevak</span>
                        </button>
                        <button className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                            <FaUsersCog className="text-red-800/70 text-base shrink-0" />
                            <span>Manage Roles</span>
                        </button>
                        <button className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                            <FaKey className="text-red-800/70 text-base shrink-0" />
                            <span>Security & Permissions</span>
                        </button>
                    </Dropdown>

                </div>

                {!isCollapsed && (
                    <p className="text-xs font-bold tracking-wider text-red-100 px-2 mb-1 truncate">
                        Admin Management
                    </p>
                )}
            </div>
        </div>
    );
}