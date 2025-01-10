import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router";
import Dashboard from "./pages/admins/dashboard-Admin/Dashboard";
import Homepage from "./pages/customers/homepage-Customer/Homepage";
import List from "./pages/admins/medicines/list-pages/List";
import MedicineAddForm from "./pages/admins/medicines/add-form/MedicineAddForm";
import PointRuleList from "./pages/admins/pointRule/pointRuleList/PointRuleList";
import TreatmentList from "./pages/admins/treatment/TreatmentList";
import ServiceTypeList from "./pages/admins/servicetype/ServiceTypeList";
import RoomTypeList from "./pages/admins/roomtype/RoomTypeList";
import MedicineUpdateForm from "./pages/admins/medicines/update-form/MedicineUpdateForm";
import MedicineDetailForm from "./pages/admins/medicines/detail-form/MedicineDetailForm";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
        <Route path="/customer" element={<Homepage />} />
        <Route path="/pointrule" element={<PointRuleList />} />
          <Route path="/">
          <Route index element={<Dashboard />} />
          </Route>
          <Route path="/medicines">
          <Route index element={<List />} />
          <Route path="new" element={<MedicineAddForm />} />
          <Route path="update/:medicineId" element={<MedicineUpdateForm />} />
          <Route path="detail/:medicineId" element={<MedicineDetailForm />} />
          </Route>
          <Route path="/treatments">
          <Route index element={<TreatmentList/>} /></Route>
          <Route path="/servicetypes">
          <Route index element={<ServiceTypeList/>} /></Route>
          <Route path="/roomtypes">
          <Route index element={<RoomTypeList/>} /></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
