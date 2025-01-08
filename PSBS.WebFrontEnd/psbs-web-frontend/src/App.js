import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router";
import Dashboard from "./pages/admins/dashboard-Admin/Dashboard";
import Homepage from "./pages/customers/homepage-Customer/Homepage";
import List from "./pages/admins/medicines/list-pages/List";
import MedicineAddForm from "./pages/admins/medicines/add-form/MedicineAddForm";
import PointRuleList from "./pages/admins/pointRule/pointRuleList/PointRuleList";

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
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
