import { Route, Routes } from "react-router-dom";
import Overview from "../pages/Overview";
import Login from "../Auth/Login";
import Deshbord from "../pages/Deshbord";

export default function Router() {
  return (
    <Routes>
        <Route path="/" element={<Overview/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/deshbord" element={<Deshbord/>}>

        </Route>
    </Routes>
  )
}
