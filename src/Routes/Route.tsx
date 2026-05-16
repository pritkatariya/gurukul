import { Route, Routes } from "react-router-dom";
import Overview from "../pages/Overview";
import Login from "../Auth/Login";
import Deshbord from "../pages/Deshbord";
import Layout from "../Layout/Layout";
import CreateNewAdmin from "../pages/Admin-system/Create-new-admin";
import CreateRoll from "../pages/Roll-management/Create-roll";
import CreateNewUser from "../pages/User-management/Create-new-user";

export default function Router() {
    return (
        <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/login" element={<Login />} />
            <Route path="/deshbord" element={<Layout />}>
                <Route index element={<Deshbord/>}/>
                <Route path="/deshbord/new-admin-create" element={<CreateNewAdmin/>}/>
                <Route path="/deshbord/new-roll-create" element={<CreateRoll/>}/>
                <Route path="/deshbord/new-user-create" element={<CreateNewUser/>}/>
            </Route>
        </Routes>
    )
}
