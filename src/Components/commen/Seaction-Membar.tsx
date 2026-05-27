import { useState, useEffect, useRef } from "react";
import { FaArrowDown, FaArrowUp, FaArrowRight, FaUserPlus, FaUsers, FaEllipsisV, FaEye, FaPen, FaTrash, FaStar, FaCrown } from "react-icons/fa";
import AddMemberModal from "./AddMemberModal";
import { getSectionMembersDetails } from "../../Action/Section/view";
import { removeMemberFromSection, deleteWholeSection } from "../../Action/Section/delete";
import { toast } from "sonner";

interface SectionMemberProps {
    id: number;
    department_id: number | string;
    title?: string;
    description?: string;
    section_head_id?: number | string | null;
    users_id?: number[];
    onRefresh?: () => void;
}

export default function SectionMember({
    id,
    department_id,
    title,
    description,
    section_head_id,
    users_id = [],
    onRefresh
}: SectionMemberProps) {
    // 🔐 લોગીન યુઝરનો રોલ LocalStorage માંથી ડાયરેક્ટ મેળવવો
    const rawRole = localStorage.getItem("user_role") || "";
    const isNormalUser = rawRole.replace(/"/g, "").trim().toLowerCase() === "user";

    const [isDown, setIsDown] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [membersData, setMembersData] = useState<any[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);

    const [activeMemberDropdown, setActiveMemberDropdown] = useState<string | number | null>(null);
    const [showSectionDropdown, setShowSectionDropdown] = useState(false);

    const memberDropdownRef = useRef<HTMLDivElement | null>(null);
    const sectionDropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (isDown && users_id.length > 0) {
            setLoadingMembers(true);
            getSectionMembersDetails(users_id).then((data) => {
                if (data) {
                    setMembersData(data);
                }
                setLoadingMembers(false);
            });
        } else {
            setMembersData([]);
            setActiveMemberDropdown(null);
            setShowSectionDropdown(false);
        }
    }, [isDown, users_id]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (memberDropdownRef.current && !memberDropdownRef.current.contains(event.target as Node)) {
                setActiveMemberDropdown(null);
            }
            if (sectionDropdownRef.current && !sectionDropdownRef.current.contains(event.target as Node)) {
                setShowSectionDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 🔒 BULLETPROOF CRUD SECURITY: જો યુઝર નોર્મલ 'user' (સેક્શન હેડ) હોય તો તે ફક્ત જોઈ જ શકશે (Read-Only)
    const isReadOnly = isNormalUser;

    const handleViewSection = () => {
        toast.info(`Section Details: ${title}`, {
            description: description || "No description available for this section."
        });
        setShowSectionDropdown(false);
    };

    const handleEditSection = () => {
        toast.warning(`Redirecting to edit section...`);
        setShowSectionDropdown(false);
    };

    const handleDeleteSection = async () => {
        setShowSectionDropdown(false);
        if (confirm(`Are you really sure you want to permanently delete the section "${title}"?`)) {
            const loadingToast = toast.loading("Deleting section...");
            try {
                const success = await deleteWholeSection(id);
                if (success) {
                    toast.success("Section deleted successfully from database!", { id: loadingToast });
                    if (onRefresh) onRefresh();
                } else {
                    toast.error("Failed to delete section from database.", { id: loadingToast });
                }
            } catch (error) {
                toast.error("Something went wrong while deleting.", { id: loadingToast });
            }
        }
    };

    const handleDeleteMember = async (userId: string | number) => {
        setActiveMemberDropdown(null);
        if (confirm("Are you sure you want to remove this member from the section?")) {
            const loadingToast = toast.loading("Removing member...");
            try {
                const success = await removeMemberFromSection(id, users_id, Number(userId));
                if (success) {
                    toast.success("Member removed from section successfully!", { id: loadingToast });
                    if (onRefresh) onRefresh();
                } else {
                    toast.error("Failed to remove member.", { id: loadingToast });
                }
            } catch (error) {
                toast.error("Something went wrong while removing member.", { id: loadingToast });
            }
        }
    };

    const sortedMembers = [...membersData].sort((a, b) => {
        const isAHead = section_head_id && Number(a.id) === Number(section_head_id);
        const isBHead = section_head_id && Number(b.id) === Number(section_head_id);
        if (isAHead) return -1;
        if (isBHead) return 1;
        return 0;
    });

    return (
        <div className="w-full shadow-md border border-gray-200/60 rounded-xl bg-white flex flex-col transition-all overflow-visible mb-4">

            <div className="w-full flex justify-between items-center p-5 hover:bg-gray-50/60 transition-colors select-none">
                <div onClick={() => setIsDown(!isDown)} className="flex flex-col items-start gap-1 cursor-pointer flex-1">
                    <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800">
                        <FaArrowRight size={12} className={`text-red-800 transition-transform duration-300 ${isDown ? "rotate-90" : ""}`} />
                        {title}
                    </h2>
                    {description && <p className="text-xs text-gray-500 pl-6">{description}</p>}
                </div>

                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    {/* 🚫 જો Read-Only હોય તો નવો મેમ્બર ઉમેરવાનું બટન હાઈડ થઈ જશે */}
                    {!isReadOnly && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                            title="Add Member"
                        >
                            <FaUserPlus size={18} />
                        </button>
                    )}

                    <div className="relative overflow-visible" ref={sectionDropdownRef}>
                        <button
                            onClick={() => setShowSectionDropdown(!showSectionDropdown)}
                            className="p-2.5 bg-gray-50 text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                            title="Section Options"
                        >
                            <FaEllipsisV size={16} />
                        </button>
                        {showSectionDropdown && (
                            <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 shadow-xl rounded-xl py-1.5 z-50 text-xs font-bold text-gray-700">
                                <button onClick={handleViewSection} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-blue-600 cursor-pointer"><FaEye /> View Section</button>

                                {/* 🚫 જો Read-Only હોય તો સેક્શન એડિટ અને ડિલીટના ઓપ્શન્સ છુપાઈ જશે */}
                                {!isReadOnly && (
                                    <>
                                        <button onClick={handleEditSection} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-amber-600 cursor-pointer"><FaPen /> Edit Section</button>
                                        <div className="border-t my-1" />
                                        <button onClick={handleDeleteSection} className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600 cursor-pointer"><FaTrash /> Delete Section</button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <button onClick={() => setIsDown(!isDown)} className="w-8 h-8 flex justify-center items-center text-gray-400 hover:text-gray-600">
                        {isDown ? <FaArrowUp size={16} /> : <FaArrowDown size={16} />}
                    </button>
                </div>
            </div>

            {isDown && (
                <div className="w-full bg-slate-50/60 border-t border-gray-100 p-5 flex flex-col gap-3 overflow-visible relative">
                    <div className="border-b border-gray-200 pb-2">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5 pl-2">
                            <FaUsers size={14} className="text-gray-400" /> Section Members ({users_id.length})
                        </h4>
                    </div>

                    {loadingMembers ? (
                        <p className="text-sm text-gray-400 italic pl-4 py-2">Loading profiles from server...</p>
                    ) : users_id.length === 0 ? (
                        <p className="text-sm text-gray-400 italic pl-4 py-2">No members assigned to this section yet.</p>
                    ) : (
                        <div className="w-full flex flex-col gap-2.5 overflow-visible">
                            {sortedMembers.map((member) => {
                                const roleClean = member.role?.toLowerCase().replace(/_/g, " ") || "";
                                const isDeptHead = ["department main", "super admin", "superadmin", "head1029"].includes(roleClean);

                                const isSectionHead = section_head_id && Number(member.id) === Number(section_head_id);
                                const isBothHead = isDeptHead && isSectionHead;

                                return (
                                    <div
                                        key={member.id}
                                        className={`w-full flex justify-between items-center p-4 rounded-xl shadow-sm transition-all overflow-visible relative border ${isBothHead
                                                ? "bg-gradient-to-r from-red-50/40 via-blue-50/30 to-white border-purple-300 shadow-md ring-1 ring-purple-100"
                                                : isSectionHead
                                                    ? "bg-blue-50/40 border-blue-200"
                                                    : isDeptHead
                                                        ? "bg-red-50/40 border-red-200"
                                                        : "bg-white border-gray-100 hover:shadow"
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className={`w-11 h-11 rounded-full font-black text-sm flex items-center justify-center border shadow-inner ${isBothHead
                                                        ? "bg-gradient-to-br from-red-100 to-blue-100 text-purple-900 border-purple-300"
                                                        : isDeptHead
                                                            ? "bg-red-100 text-red-800 border-red-300"
                                                            : isSectionHead
                                                                ? "bg-blue-100 text-blue-800 border-blue-300"
                                                                : "bg-gray-100 text-gray-700 border-gray-200"
                                                    }`}>
                                                    {member.name ? member.name.charAt(0).toUpperCase() : "U"}
                                                </div>

                                                {isDeptHead && (
                                                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow border bg-red-600 text-white border-white transition-all z-10">
                                                        <FaStar size={9} />
                                                    </div>
                                                )}

                                                {isSectionHead && (
                                                    <div className={`absolute w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow border bg-blue-600 text-white border-white transition-all z-10 ${isBothHead ? "-top-1 -left-1" : "-top-1 -right-1"
                                                        }`}>
                                                        <FaStar size={9} />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-extrabold text-sm ${isBothHead ? "text-purple-950 text-base" : "text-gray-800"}`}>
                                                        {member.name}
                                                    </span>

                                                    {isBothHead ? (
                                                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-600 to-blue-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                                            <FaCrown size={8} /> Dept & Section Head
                                                        </span>
                                                    ) : (
                                                        <>
                                                            {isDeptHead && (
                                                                <span className="bg-red-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                                                                    Dept Head
                                                                </span>
                                                            )}
                                                            {isSectionHead && (
                                                                <span className="bg-blue-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                                                                    Section Head
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-gray-400 font-bold tracking-wider uppercase">
                                                    {member.role?.replace(/_/g, " ")}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="relative overflow-visible" ref={activeMemberDropdown === member.id ? memberDropdownRef : null}>
                                            <button
                                                onClick={() => setActiveMemberDropdown(activeMemberDropdown === member.id ? null : member.id)}
                                                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
                                            >
                                                <FaEllipsisV size={14} />
                                            </button>

                                            {activeMemberDropdown === member.id && (
                                                <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 shadow-xl rounded-xl py-1.5 z-50 text-xs font-semibold text-gray-700">
                                                    <button onClick={() => { toast.info(`Viewing member: ${member.name}`); setActiveMemberDropdown(null); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-blue-600 cursor-pointer"><FaEye size={12} /> View</button>

                                                    {/* 🚫 જો Read-Only હોય તો મેમ્બર એડિટ કે ડિલીટ (Remove) કરવાના ઓપ્શન્સ છુપાઈ જશે */}
                                                    {!isReadOnly && (
                                                        <>
                                                            <button onClick={() => { toast.info(`Editing member: ${member.name}`); setActiveMemberDropdown(null); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-amber-600 cursor-pointer"><FaPen size={12} /> Edit</button>
                                                            <div className="border-t border-gray-100 my-1" />
                                                            <button onClick={() => handleDeleteMember(member.id)} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer"><FaTrash size={12} /> Delete</button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {showAddModal && (
                <AddMemberModal
                    sectionId={id}
                    departmentId={department_id}
                    currentUsers={users_id}
                    onClose={() => setShowAddModal(false)}
                    onUpdate={() => {
                        setShowAddModal(false);
                        if (onRefresh) onRefresh();
                    }}
                />
            )}
        </div>
    );
}