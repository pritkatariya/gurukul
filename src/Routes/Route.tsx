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
import AdmitRequestGurukulArt from "../pages/Departments/Gurukul-Art/Admit-Request";
import StudentListGurukulArt from "../pages/Departments/Gurukul-Art/User-lists";

export default function Router() {
    return (
        <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/login" element={<Login />} />
            <Route path="/deshbord" element={<Layout />}>
                <Route index element={<Deshbord/>}/>
                <Route path="/deshbord/new-user-create" element={<CreateNewUser/>}/>
                <Route path="/deshbord/user-list" element={<UserList/>} />
                <Route path="/deshbord/new-roll-create" element={<CreateRoll/>}/>
                <Route path="/deshbord/roll-list" element={<RollList/>}/>

                <Route path="/deshbord/g-music/admit-request" element={<AdmitRequestGMusic/>}/>
                <Route path="/deshbord/g-music/user-lists" element={<StudentListGMusic/>}/>

                <Route path="/deshbord/gurukul-art/admit-request" element={<AdmitRequestGurukulArt/>}/>
                <Route path="/deshbord/gurukul-art/user-lists" element={<StudentListGurukulArt/>}/>
            </Route>
        </Routes>
    )
}