import Navbar from "../Components/Sidebar/Navbar";
import SidebarHeader from "../Components/Sidebar/Sidebar-header";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  return (
    <div className="w-full h-full p-2 flex flex-col justify-start items-center">
        <SidebarHeader isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className="w-full h-full pt-7 overflow-hidden">
            <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        </div>
    </div>
  );
}