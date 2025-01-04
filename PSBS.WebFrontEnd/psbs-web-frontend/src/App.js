import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router";
import Dashboard from "./pages/admins/dashboard-Admin/Dashboard";
import Homepage from "./pages/customers/homepage-Customer/Homepage";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
        <Route path="/customer" element={<Homepage />} />
          <Route path="/">
            <Route index element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
