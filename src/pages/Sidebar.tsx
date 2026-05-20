import { FaPlay, FaPause } from "react-icons/fa";
import Navbar from "../Components/Sidebar/Navbar";
import SidebarHeader from "../Components/Sidebar/Sidebar-header";
import { useMusic } from "../Components/MusicProvider";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const { isMusicPlaying, toggleMusic } = useMusic();

  return (
    <div className="w-full h-full p-2 flex flex-col justify-start items-center">
      <SidebarHeader isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <button
        type="button"
        onClick={toggleMusic}
        title={isMusicPlaying ? "Stop Song" : "Start Song"}
        className={`mt-5 flex h-12 w-full items-center justify-center gap-3 rounded-2xl bg-red-800 px-4 text-sm font-bold text-white shadow-md transition-all hover:bg-red-700 active:scale-95 ${
          isCollapsed ? "px-0" : ""
        }`}
      >
        {isMusicPlaying ? <FaPause className="text-sm" /> : <FaPlay className="text-sm" />}

        {!isCollapsed && (
          <span>{isMusicPlaying ? "Stop Song" : "Start Song"}</span>
        )}
      </button>

      <div className="w-full h-full pt-7 overflow-hidden">
        <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>
    </div>
  );
}