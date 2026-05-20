import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import SidebarHeader from "../Components/Sidebar/Sidebar-header";
import Navbar from "../Components/Sidebar/Navbar";
import { FaVolumeDown, FaVolumeUp } from "react-icons/fa";
import ElasticSlider from "../Components/ElasticSlider";
import { useMusic } from "../Components/MusicProvider";
import Header from "../pages/Header";
import NavbarMusicPlayer from "../Components/commen/NavbarMusicPlayer";

export default function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { isMusicPlaying, volume, setVolume } = useMusic();

  useEffect(() => {
    const findAndExposeAudio = () => {
      const audios = document.getElementsByTagName("audio");
      if (audios.length > 0) {
        (window as any).gurukulAudioInstance = audios[0];
        return true;
      }
      
      const originalPlay = Audio.prototype.play;
      Audio.prototype.play = function() {
        (window as any).gurukulAudioInstance = this;
        return originalPlay.apply(this, arguments as any);
      };
      return false;
    };

    findAndExposeAudio();
  }, []);

  return (
    <div className="w-screen h-screen flex overflow-hidden bg-gray-50 p-3 gap-3 relative">
      
      <div className="fixed left-0 top-4 z-9999 border-r-11 border-gray-800 flex flex-col -translate-x-61.25 w-64 items-center gap-2 rounded-r-2xl bg-white py-4 pl-4 pr-5 shadow-lg shadow-gray-950 ring-1 ring-red-100 transition-transform duration-300 hover:translate-x-0 md:top-6">
        
        <NavbarMusicPlayer />

        <div className="w-full border-t border-gray-100 my-1"></div>

        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
          Volume Control
        </span>
        <ElasticSlider
          defaultValue={volume}
          startingValue={0}
          maxValue={100}
          isStepped
          stepSize={5}
          leftIcon={<FaVolumeDown className="text-xs" />}
          rightIcon={<FaVolumeUp className="text-xs" />}
          onChange={setVolume}
          className="w-full px-2"
        />
      </div>

      {/* 💻 ડેસ્કટોપ સાઇડબાર */}
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

      {/* 📱 મોબાઈલ સાઇડબાર ડ્રોઅર */}
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

      {/* 📄 મેઈન કન્ટેન્ટ એરિયા */}
      <div className="flex-1 h-full flex flex-col gap-3 w-full">
        {/* હેડર બાર */}
        <header className="w-full h-16 shrink-0">
          <Header onMenuClick={() => setIsMobileOpen(true)} />
        </header>

        {/* રાઉટીંગ પેજીસ ડિસ્પ્લે એરિયા */}
        <main className="w-full flex-1 overflow-y-auto rounded-2xl bg-white border border-gray-200 shadow-sm p-5 text-gray-800 scrolls">
          <Outlet />
        </main>
      </div>

    </div>
  );
}