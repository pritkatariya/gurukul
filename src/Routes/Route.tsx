import { Route, Routes } from "react-router-dom";
import Overview from "../pages/Overview";
import Login from "../Auth/Login";
import Deshbord from "../pages/Deshbord";
import Layout from "../Layout/Layout";

export default function Router() {
    return (
        <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/login" element={<Login />} />
            <Route path="/deshbord" element={<Layout />}>
                <Route index element={<Deshbord/>}/>
                
            </Route>
        </Routes>
    )
}
