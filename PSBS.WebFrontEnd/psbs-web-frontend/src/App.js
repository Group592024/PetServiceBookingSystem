import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./protectPageRoute";  // Import ProtectedRoute

// Các import khác của bạn
import Dashboard from "./pages/admins/dashboard-Admin/Dashboard";
import Homepage from "./pages/customers/homepage-Customer/Homepage";
import Login from "./pages/login/dashboard-Admin/Login";
import ChangePassword from "./pages/changepassword/dashboard-Admin/ChangePassword";
import ForgotPassword from "./pages/forgotpassword/dashboard-Admin/ForgotPassword";
import Profile from "./pages/profile/dashboard-Admin/Profile";
import EditProfile from "./pages/profile/dashboard-Admin/EditProfile";
import AccountList from "./pages/account/dashboard-Admin/AccountList";
import Register from "./pages/register/dashboard-Admin/Register";
import List from "./pages/admins/medicines/list-pages/List";
import MedicineAddForm from "./pages/admins/medicines/add-form/MedicineAddForm";
import PointRuleList from "./pages/admins/subTableInReservation/pointRuleList/PointRuleList";
import PaymentTypeList from "./pages/admins/subTableInReservation/paymentTypeList/PaymentTypeList";
import BookingStatusList from "./pages/admins/subTableInReservation/bookingStatusList/BookingStatusList";
import BookingTypeList from "./pages/admins/subTableInReservation/bookingTypeList/BookingTypeList";
import TreatmentList from "./pages/admins/subTableInFacilityAndHealthcare/treatment/TreatmentList";
import MedicineUpdateForm from "./pages/admins/medicines/update-form/MedicineUpdateForm";
import MedicineDetailForm from "./pages/admins/medicines/detail-form/MedicineDetailForm";
import PetTypeList from './pages/admins/PetType/PetTypeList';
import AddPetType from './pages/admins/PetType/AddPetType';
import PetTypeDetail from './pages/admins/PetType/PetTypeDetail';
import UpdatePetType from './pages/admins/PetType/UpdatePetType';
import ServiceTypeList from "./pages/admins/subTableInFacilityAndHealthcare/servicetype/ServiceTypeList";
import RoomTypeList from "./pages/admins/subTableInFacilityAndHealthcare/roomtype/RoomTypeList";
import GiftsList from "./pages/admins/gifts/list-pages/GiftList";
import GiftAddForm from "./pages/admins/gifts/add-form/GiftAddForm";
import GiftDetailForm from "./pages/admins/gifts/detail-form/GiftDetailForm";
import GiftUpdatePage from "./pages/admins/gifts/update-form/GiftUpdateForm";
import GiftListPage from "./pages/customers/gifts/list-page/GiftListPage";
import GiftDetailPage from "./pages/customers/gifts/detail-page/GiftDetailPage";


function App() {
  return (
    <div className='App'>
      <BrowserRouter>
        <Routes>
          {/* Route không yêu cầu bảo vệ */}
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          {/* Route yêu cầu bảo vệ */}
          <Route path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/profile/:accountId"
            element={
              <ProtectedRoute>  
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/account"
            element={
              <ProtectedRoute>
                <AccountList />
              </ProtectedRoute>
            }
          />
          <Route path="/changepassword/:accountId"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route path="/editprofile/:accountId"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />
          <Route path="/editprofile/:accountId"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />
         
          {/* Các route khác */}
          <Route path="/medicines">
            <Route index element={<List />} />
            <Route path="new" element={<MedicineAddForm />} />
            <Route path="update/:medicineId" element={<MedicineUpdateForm />} />
            <Route path="detail/:medicineId" element={<MedicineDetailForm />} />
          </Route>

          <Route path="/gifts">
            <Route index element={<GiftsList/>} />
            <Route path="new" element={<GiftAddForm />} />
            <Route path="update/:giftId" element={<GiftUpdatePage />} />
            <Route path="detail/:giftId" element={<GiftDetailForm />} />
          </Route>

          <Route path="/customer/gifts">
            <Route index element={<GiftListPage/>} />
            <Route path="detail/:giftId" element={<GiftDetailPage />} />
          </Route>

          <Route path="/petType">
            <Route index element={<PetTypeList />} />
            <Route path="add" element={<AddPetType />} />
            <Route path=":id" element={<PetTypeDetail />} />
            <Route path="edit/:id" element={<UpdatePetType />} />
          </Route>

          <Route path="/settings">
            <Route path="pointrule" element={<PointRuleList />} />
            <Route path="paymentType" element={<PaymentTypeList />} />
            <Route path="bookingType" element={<BookingTypeList />} />
            <Route path="bookingStatus" element={<BookingStatusList />} />
            <Route path="treatments" element={<TreatmentList />} />
            <Route path="servicetypes" element={<ServiceTypeList />} />
            <Route path="roomtypes" element={<RoomTypeList />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
