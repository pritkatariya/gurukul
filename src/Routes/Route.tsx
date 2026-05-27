import { Navigate, Route, Routes } from "react-router-dom";
import Overview from "../pages/Overview";
import Login from "../Auth/Login";
import Deshbord from "../pages/Deshbord";
import Layout from "../Layout/Layout";
import CreateRoll from "../pages/Admin/Roll-management/Create-roll";
import CreateNewUser from "../pages/Admin/User-management/Create-new-user";
import UserList from "../pages/Admin/User-management/User-list";
import RollList from "../pages/Admin/Roll-management/Role-list";
import AdmitRequestGMusic from "../pages/Departments/G-music/Admit-Request";
import OverviewController from "../pages/Admin/Overview-controller/OverviewController";
import StudentListGMusic from "../pages/Departments/G-music/User-lists";
import AdmitRequestGurukulArt from "../pages/Departments/Gurukul-Art/Admit-Request";
import StudentListGurukulArt from "../pages/Departments/Gurukul-Art/User-lists";
import MusicController from "../pages/Admin/Overview-controller/MusicController";
import EventEditor from "../pages/Admin/Event-editor/EventEditor";
import AmruthuAachaman from "../pages/Admin/Daily-Quotes/Amrut-nu-aachaman";
import DailyDarshan from "../pages/Admin/Daily-Quotes/Daily-Darshan";
import AmrutAachaman from "../pages/Overview-pages/Amrut-Aachaman";
import GmusicSection from "../pages/Departments/G-music/Section";
import ArtSection from "../pages/Departments/Gurukul-Art/Section";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const user = localStorage.getItem("user");
    return user ? children : <Navigate to="/login" />;
};

export default function Router() {
    return (
        <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/Amrut-Aachaman" element={<AmrutAachaman />} />
            <Route path="/login" element={<Login />} />
            <Route path="/deshbord" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Deshbord />} />
                <Route path="overview-controller" element={<OverviewController />} />
                <Route path="overview-music" element={<MusicController />} />
                <Route path="event-editor" element={<EventEditor />} />
                <Route path="amrut-nu-aachaman" element={<AmruthuAachaman />} />
                <Route path="daily-darshan" element={<DailyDarshan />} />
                <Route path="new-user-create" element={<CreateNewUser />} />
                <Route path="user-list" element={<UserList />} />
                <Route path="new-roll-create" element={<CreateRoll />} />
                <Route path="roll-list" element={<RollList />} />
                <Route path="g-music/admit-request" element={<AdmitRequestGMusic />} />
                <Route path="g-music/user-lists" element={<StudentListGMusic />} />
                <Route path="g-music/section" element={<GmusicSection />} />
                <Route path="gurukul-art/admit-request" element={<AdmitRequestGurukulArt />} />
                <Route path="gurukul-art/user-lists" element={<StudentListGurukulArt />} />
                <Route path="gurukul-art/section" element={<ArtSection />} />
            </Route>
        </Routes>
    );
}