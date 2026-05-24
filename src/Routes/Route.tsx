import { Route, Routes } from "react-router-dom";
import Overview from "../pages/Overview";
import Login from "../Auth/Login";
import Deshbord from "../pages/Deshbord";
import Layout from "../Layout/Layout";
import CreateRoll from "../pages/Admin/Roll-management/Create-roll";
import CreateNewUser from "../pages/Admin/User-management/Create-new-user";
import UserList from "../pages/Admin/User-management/User-list";
import RollList from "../pages/Admin/Roll-management/Role-list";
import AdmitRequestGMusic from "../pages/Departments/G-music/Admit-Request";
import StudentListGMusic from "../pages/Departments/G-music/User-lists";
import AdmitRequestGCulture from "../pages/Departments/G-Culture/Admit-Request";
import OverviewController from "../pages/Admin/Overview-controller/OverviewController";
import AdmitRequestGurukulArt from "../pages/Departments/Gurukul-Art/Admit-Request";
import StudentListGurukulArt from "../pages/Departments/Gurukul-Art/User-lists";
import MusicController from "../pages/Admin/Overview-controller/MusicController";
import EventEditor from "../pages/Admin/Event-editor/EventEditor";
import AmruthuAachaman from "../pages/Admin/Daily-Quotes/Amrut-nu-aachaman";
import DailyDarshan from "../pages/Admin/Daily-Quotes/Daily-Darshan";
import StudentListGCulture from "../pages/Departments/G-Culture/User-lists";

export default function Router() {
    return (
        <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/login" element={<Login />} />
            <Route path="/deshbord" element={<Layout />}>
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
                <Route path="gurukul-art/admit-request" element={<AdmitRequestGurukulArt />} />
                <Route path="gurukul-art/user-lists" element={<StudentListGurukulArt />} />
                <Route path="g-culture/admit-request" element={<AdmitRequestGCulture />} />
                <Route path="g-culture/user-lists" element={<StudentListGCulture />} />
            </Route>
        </Routes>
    );
}