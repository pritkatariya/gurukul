import { FaPlus } from "react-icons/fa";
import Button from "../../../Components/commen/Button";
import SectionMember from "../../../Components/commen/Seaction-Membar";
import SeactionCreate from "../../../Components/commen/Seaction-Create";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

interface SectionItem {
    id: number;
    department_id: number;
    title: string;
    description: string;
    section_head_id: number | null;
    users_id: number[];
}

let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';


export default function GmusicSection() {
    const [isOpenPopup, setIsOpenPopup] = useState(false);
    const [sectionList, setSectionList] = useState<SectionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchParams] = useSearchParams();
    const deptId = searchParams.get("dept_id") || "";

    const rawRole = localStorage.getItem("user_role") || "";
    const loggedInUserRole = rawRole.replace(/"/g, "").trim().toLowerCase();

    const userRaw = localStorage.getItem("user");

    let currentUserId: number | null = null;
    if (userRaw) {
        try {
            const parsed = JSON.parse(userRaw);
            currentUserId = parsed.id ? Number(parsed.id) : null;
        } catch (error) {
            console.error("Error parsing user from localStorage:", error);
        }
    }

    const isNormalUser = loggedInUserRole === "user";
    console.log("=== SECTION PAGE ROLE CHECK ===", { loggedInUserRole, isNormalUser, currentUserId });

    const fetchSections = async () => {
        if (!deptId) return;
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/sections?dept_id=${deptId}`);
            const result = await response.json();

            if (result.success) {
                setSectionList(result.data);
            } else {
                setError(result.message || "Failed to fetch sections");
            }
        } catch (err) {
            console.error("Error fetching sections:", err);
            setError("Something went wrong while fetching data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSections();
    }, [deptId]);

    const handlePopupClose = () => {
        setIsOpenPopup(false);
        fetchSections();
    };

    // 🔍 જો યુઝર નોર્મલ હોય, તો તેને માત્ર પોતાના જ સેક્શન્સ ફિલ્ટર કરીને બતાવવા
    const displayedSections = isNormalUser
        ? sectionList.filter((section) => Number(section.section_head_id) === Number(currentUserId))
        : sectionList;

    return (
        <div className="w-full min-h-full flex flex-col justify-start items-center gap-6 p-2 md:p-6 bg-gray-50/30">
            <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 md:p-8 shadow-sm border border-gray-200 rounded-xl gap-6 md:gap-0">
                <div className="flex flex-col justify-center items-start gap-2">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                        Art Sections
                    </h1>
                    <p className="text-sm md:text-base text-gray-500">
                        Manage and organize different art categories and creative sections.
                    </p>
                </div>

                {/* 🔒 હવે આ કન્ડીશન 100% કામ કરશે અને નોર્મલ 'user' માટે બટન હાઇડ કરી દેશે */}
                {!isNormalUser && (
                    <Button
                        text="CREATE SECTION"
                        icon={<FaPlus />}
                        onClick={() => setIsOpenPopup(prev => !prev)}
                        className="flex justify-center items-center gap-2 rounded-xl py-3 px-6 text-sm md:text-base font-bold bg-[#800000] text-white hover:bg-[#600000] shadow-md hover:shadow-lg transition-all w-full md:w-auto"
                    />
                )}
            </div>

            {isOpenPopup && (
                <SeactionCreate
                    onClick={handlePopupClose}
                    departmentId={deptId}
                />
            )}

            <div className="w-full flex flex-col justify-start items-center gap-4">
                {loading && <p className="text-gray-500">Loading sections...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {!loading && displayedSections.length === 0 && (
                    <p className="text-gray-400">No sections found for you.</p>
                )}

                {!loading && displayedSections.map((data) => (
                    <SectionMember
                        key={data.id}
                        id={data.id}
                        title={data.title}
                        description={data.description}
                        department_id={data.department_id}
                        section_head_id={data.section_head_id}
                        users_id={data.users_id}
                        onRefresh={fetchSections}
                    />
                ))}
            </div>
        </div>
    );
}