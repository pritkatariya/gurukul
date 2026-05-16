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
import { Link } from "react-router-dom";

interface NavbarProps {
    isCollapsed: boolean;
    setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Navbar({ isCollapsed, setIsCollapsed }: NavbarProps) {
    const [openId, setOpenId] = useState<string | null>(null);

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

                    <Dropdown
                        icon={<AiOutlinePartition />}
                        arrowicon={<IoMdArrowDroprightCircle />}
                        text={!isCollapsed ? "Department" : ""}
                        isOpen={openId === "admin-1"}
                        onToggle={() => handleToggle("admin-1")}
                        isCollapsed={isCollapsed}
                    >
                        <Link to={`/deshbord/new-department-create`} className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                            <FaPlus className="text-red-800/70 text-base shrink-0" />
                            <span>Create Department</span>
                        </Link>
                        <Link to={`/deshbord/department-list`} className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                            <FaList className="text-red-800/70 text-base shrink-0" />
                            <span>Department</span>
                        </Link>
                    </Dropdown>

                    <Dropdown
                        icon={<FaClipboardUser />}
                        arrowicon={<IoMdArrowDroprightCircle />}
                        text={!isCollapsed ? "Roll & Permission" : ""}
                        isOpen={openId === "admin-2"}
                        onToggle={() => handleToggle("admin-2")}
                        isCollapsed={isCollapsed}
                    >
                        <Link to={`/deshbord/new-roll-create`} className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                            <FaPlus className="text-red-800/70 text-base shrink-0" />
                            <span>Create Role</span>
                        </Link>
                        <Link to={`/deshbord/roll-list`} className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                            <FaList className="text-red-800/70 text-base shrink-0" />
                            <span>Role List</span>
                        </Link>
                    </Dropdown>

                    <Dropdown
                        icon={<FaUserTie />}
                        arrowicon={<IoMdArrowDroprightCircle />}
                        text={!isCollapsed ? "User / Sevak" : ""}
                        isOpen={openId === "admin-3"}
                        onToggle={() => handleToggle("admin-3")}
                        isCollapsed={isCollapsed}
                    >
                        <Link to={`/deshbord/new-user-create`} className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                            <FaPlus className="text-red-800/70 text-base shrink-0" />
                            <span>Create User / Sevak</span>
                        </Link>
                        <Link to={`/deshbord/user-list`} className="flex items-center gap-2 w-full text-left cursor-pointer text-sm font-medium text-red-900 hover:bg-red-800/10 p-2.5 rounded-xl transition-colors">
                            <FaList className="text-red-800/70 text-base shrink-0" />
                            <span>User / Sevak List</span>
                        </Link>
                    </Dropdown>

                </div>

                <div className="w-full flex flex-col gap-2">
                    <LinkButton To="/deshbord" text="Dashboard" icon={<GoHomeFill />} />
                </div>
            </div>
            <div className="absolute bottom-0 left-0 p-2 w-full flex flex-col gap-2">
                <LinkButton To="/login" text="Logout" icon={<IoLogOut />} className={`w-`} />
            </div>
        </div>
    );
}