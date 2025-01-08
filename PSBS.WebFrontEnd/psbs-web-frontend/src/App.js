import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router";
import Dashboard from "./pages/admins/dashboard-Admin/Dashboard";
import Homepage from "./pages/customers/homepage-Customer/Homepage";
import Login from "./pages/login/dashboard-Admin/Login";
import ChangePassword from "./pages/changepassword/dashboard-Admin/ChangePassword";
import ForgotPassword from "./pages/forgotpassword/dashboard-Admin/ForgotPassword";
import Profile from "./pages/profile/dashboard-Admin/Profile";
import EditProfile from "./pages/profile/dashboard-Admin/EditProfile";
import AccountList from "./pages/account/dashboard-Admin/AccountList";




function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
        <Route path="/customer" element={<Homepage />} />
          <Route path="/">
            <Route index element={<Dashboard />} />
          </Route>
          <Route path="/login">
            <Route index element={<Login />} />
          </Route>
          <Route path="/changepassword/:accountId">
            <Route index element={<ChangePassword />} />
          </Route>
          <Route path="/forgotpassword">
            <Route index element={<ForgotPassword />} />
          </Route>
          <Route path="/profile/:accountId">
            <Route index element={<Profile />} />
          </Route>
          <Route path="/editprofile/:accountId">
            <Route index element={<EditProfile />} />
          </Route>
          <Route path="/account">
            <Route index element={<AccountList />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
