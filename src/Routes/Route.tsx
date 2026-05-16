import { Route, Routes } from "react-router-dom";
import Overview from "../pages/Overview";
import Login from "../Auth/Login";
import Deshbord from "../pages/Deshbord";
import Layout from "../Layout/Layout";
import CreateRoll from "../pages/Admin/Roll-management/Create-roll";
import CreateNewUser from "../pages/Admin/User-management/Create-new-user";
import UserList from "../pages/Admin/User-management/User-list";
import RollList from "../pages/Admin/Roll-management/Role-list";
import CreateDepartment from "../pages/Admin/Department-manage/Create-department";
import DepartmentList from "../pages/Admin/Department-manage/Department-list";

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
                <Route path="/deshbord/new-department-create" element={<CreateDepartment/>}/>
                <Route path="/deshbord/department-list" element={<DepartmentList/>}/>
            </Route>
        </Routes>
    )
}
