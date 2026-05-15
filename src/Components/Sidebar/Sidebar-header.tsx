import { VscLayoutSidebarLeftDock, VscLayoutSidebarRightDock } from 'react-icons/vsc'
import "../../App.css"
import Logo from '../../assets/gurukul logo.png'

interface SidebarHeaderProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SidebarHeader({ isCollapsed, setIsCollapsed }: SidebarHeaderProps) {
  return (
    <div 
      className={`w-full h-16 rounded-2xl bg-red-800 flex p-2 pl-3 pr-3 shadow-md shadow-gray-950 items-center transition-all duration-300 ${
        isCollapsed ? "justify-center" : "justify-between"
      }`}
    >
        {/* જો સાઇડબાર ક્લોઝ હોય તો લોગો સંતાઈ જશે */}
        {!isCollapsed && <img src={Logo} className="w-10 h-10 object-contain" alt="Logo" />}
        
        {/* સાઇડબાર ઓપન/ક્લોઝ કરવાનું બટન */}
        <div 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-10 h-10 rounded-lg cursor-pointer bg-red-100 headerinset flex justify-center items-center shrink-0"
        >
            {isCollapsed ? (
              <VscLayoutSidebarRightDock size={20} className="text-red-800" />
            ) : (
              <VscLayoutSidebarLeftDock size={20} className="text-red-800" />
            )}
        </div>
    </div>
  )
}