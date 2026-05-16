import { useState } from "react";
import { Outlet } from "react-router-dom";
import SidebarHeader from "../Components/Sidebar/Sidebar-header";
import Navbar from "../Components/Sidebar/Navbar";
import Header from "../pages/Header";

export default function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="w-screen h-screen flex overflow-hidden bg-gray-50 p-3 gap-3 relative">
      
      <aside 
        className={`hidden md:flex flex-col h-full shrink-0 gap-3 transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <SidebarHeader isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <div className="flex-1 min-h-0">
          <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        </div>
      </aside>

      <div 
        className={`fixed inset-0 z-50 md:hidden bg-black/40 transition-opacity duration-300 ${
          isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileOpen(false)}
      >
        <aside 
          className="w-64 h-[calc(100vh-24px)] flex flex-col gap-3 bg-red-800 m-3 rounded-2xl p-2 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <SidebarHeader isCollapsed={false} setIsCollapsed={() => setIsMobileOpen(false)} />
          <div className="flex-1 min-h-0">
            <Navbar isCollapsed={false} setIsCollapsed={() => setIsMobileOpen(false)} />
          </div>
        </aside>
      </div>
      
      <div className="flex-1 h-full flex flex-col gap-3 w-full">
        
        <header className="w-full h-16 shrink-0">
            <Header onMenuClick={() => setIsMobileOpen(true)} />
        </header>

        <main className="w-full flex-1 overflow-y-auto rounded-2xl bg-white border border-gray-200 shadow-sm p-5 text-gray-800 scrolls">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
}