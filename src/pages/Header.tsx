import { useState, useRef, useEffect } from "react";
import { FaGlobe, FaChevronDown, FaUserCircle, FaBars } from "react-icons/fa";
import Logo from "../assets/gurukul logo.png";

interface HeaderProps {
  onMenuClick?: () => void; // મોબાઈલ મેનુ ઓપન કરવાનું ફંક્શન
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("English");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languages = ["ગુજરાતી", "English", "हिन्दी"];

  return (
    <div className="w-full h-full flex items-center rounded-2xl bg-red-800 justify-between select-none p-2 pl-3 pr-3 shadow-md shadow-gray-950">
      
      <div className="flex items-center gap-2 sm:gap-3">
        {/* 🍔 મોબાઈલ મેનુ બટન: આ માત્ર md સાઇઝથી નાની સ્ક્રીન પર જ દેખાશે */}
        <button 
          onClick={onMenuClick}
          className="md:hidden w-9 h-9 rounded-xl bg-red-100 text-red-800 headerinset flex justify-center items-center shrink-0 cursor-pointer active:scale-95 transition-transform"
        >
          <FaBars size={16} />
        </button>

        <img src={Logo} className="w-10 h-10 object-contain shrink-0" alt="Gurukul Logo" />
        <span className="text-amber-100 font-bold text-lg tracking-wide hidden sm:block">
          GURUKUL
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 sm:gap-2 bg-gray-50 text-red-800 px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all headerinset active:scale-[0.98] cursor-pointer focus:outline-none"
          >
            <span className="w-6 h-6 sm:w-7 sm:h-7 bg-red-100 text-red-800 shadow-md shadow-gray-950 rounded-full flex items-center justify-center shrink-0">
              <FaGlobe size={12} />
            </span>
            <span className="px-0.5 sm:px-1">{selectedLang}</span>
            <FaChevronDown className={`text-[10px] sm:text-xs text-red-200 transition-transform duration-200 mr-0.5 ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-32 sm:w-36 bg-red-800 border border-red-950/40 rounded-2xl shadow-xl shadow-gray-950 overflow-hidden z-50 p-1 flex flex-col gap-0.5">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setSelectedLang(lang);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                    selectedLang === lang
                      ? "bg-red-100 text-red-800 headerinset font-bold"
                      : "text-amber-100 hover:bg-red-700"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-50 text-red-800 px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all headerinset active:scale-[0.98] cursor-pointer focus:outline-none">
          <div className="w-6 h-6 sm:w-7 sm:h-7 bg-red-100 text-red-800 shadow-md shadow-gray-950 rounded-full flex items-center justify-center shrink-0">
            <FaUserCircle size={14} />
          </div>
          <div className="flex flex-col text-left pr-0.5 sm:flex">
            <span className="text-[11px] sm:text-xs font-bold text-red-800 tracking-wide leading-tight">Admin User</span>
            <span className="text-[9px] font-medium text-red-800/50">Super Admin</span>
          </div>
        </div>

      </div>

    </div>
  );
}