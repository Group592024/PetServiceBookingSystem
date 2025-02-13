import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./protectPageRoute"; // Import ProtectedRoute

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
import PetTypeList from "./pages/admins/PetType/PetTypeList";
import AddPetType from "./pages/admins/PetType/AddPetType";
import PetTypeDetail from "./pages/admins/PetType/PetTypeDetail";
import UpdatePetType from "./pages/admins/PetType/UpdatePetType";

import ServiceList from "./pages/admins/services/ServiceList";
import AddService from "./pages/admins/services/AddService";
import UpdateService from "./pages/admins/services/UpdateService";
import ServiceDetail from "./pages/admins/services/ServiceDetail";
import PetHealthBookListCus from "./pages/customers/pethealthbook/PetHealthBookListCus";
import PetHealthBookDetailCus from "./pages/customers/pethealthbook/PetHealthBookDetailCus";
import ServiceTypeList from "./pages/admins/subTableInFacilityAndHealthcare/servicetype/ServiceTypeList";
import RoomTypeList from "./pages/admins/subTableInFacilityAndHealthcare/roomtype/RoomTypeList";
import VoucherList from "./pages/admins/vouchers/voucherList/VoucherList";
import VoucherAdd from "./pages/admins/vouchers/voucherAdd/VoucherAdd";
import VoucherEdit from "./pages/admins/vouchers/voucherEdit/VoucherEdit";
import VoucherDetail from "./pages/admins/vouchers/voucherDetail/VoucherDetail";
import CustomerVoucherList from "./pages/customers/vouchers/voucherList/VoucherList";
import CustomerVoucherDetail from "./pages/customers/vouchers/voucherDetail/VoucherDetail";
import GiftsList from "./pages/admins/gifts/list-pages/GiftList";
import GiftAddForm from "./pages/admins/gifts/add-form/GiftAddForm";
import GiftDetailForm from "./pages/admins/gifts/detail-form/GiftDetailForm";
import GiftUpdatePage from "./pages/admins/gifts/update-form/GiftUpdateForm";
import GiftListPage from "./pages/customers/gifts/list-page/GiftListPage";
import GiftDetailPage from "./pages/customers/gifts/detail-page/GiftDetailPage";
import PetBreedList from "./pages/admins/Pets/PetBreed/PetBreedList";
import PetBreedDetail from "./pages/admins/Pets/PetBreed/PetBreedDetail";
import PetBreedCreate from "./pages/admins/Pets/PetBreed/PetBreedCreate";
import PetBreedEdit from "./pages/admins/Pets/PetBreed/PetBreedEdit";
import RoomList from "./pages/admins/rooms/RoomList";
import RoomDetail from "./pages/admins/rooms/RoomDetail";
import RoomCreate from "./pages/admins/rooms/RoomCreate";
import RoomEdit from "./pages/admins/rooms/RoomEdit";
import CustomerRoomList from "./pages/customers/Room/RoomList";
import CustomerRoomDetail from "./pages/customers/Room/RoomDetail";
import CustomerRedeemHistory from "./pages/customers/gifts/gift-history/CustomerRedeemHistory";
import AdminRedeemHistory from "./pages/admins/gifts/gift-history/AdminRedeemHistory";
import ChangePasswordCustomer from "./pages/customers/profile-Customer/ChangePasswordCustomer";
import ProfileCustomer from "./pages/customers/profile-Customer/ProfileCustomer";
import EditProfileCustomer from "./pages/customers/profile-Customer/EditProfileCustomer";
import ServiceCardList from "./pages/customers/services/ServiceListPage";
import ServiceListPage from "./pages/customers/services/ServiceListPage";
import ServiceCard from "./components/ServiceCustomer/ServiceCard";
import ServiceDetailPage from "./pages/customers/services/ServiceDetailPage";
import Chat from "./pages/admins/chat/Chat";
import signalRService from "./lib/ChatService";
import { useEffect } from "react";
import CustomerChatPage from "./pages/customers/chat/CustomerChatPage";
import Booking from "./pages/customers/bookings/AddBooking";
import AdminBookingList from "./pages/admins/bookings/list-pages/AdminBookingList";
import ServiceBookingDetailPage from "./pages/admins/bookings/detail-form/ServiceBookingDetailPage";
import RoomBookingDetailPage from "./pages/admins/bookings/detail-form/RoomBookingDetailPage";
import CustomerBookingList from "./pages/customers/bookings/list-pages/CustomerBookingList";
import { BookingProvider } from "./components/Booking/add-form/BookingContext";
import AddBooking from "./pages/customers/bookings/AddBooking";
import Admin_Add_Booking from "./pages/admins/bookings/add-form/Admin_Add_Booking";
import CustomerServiceBookingDetail from "./pages/customers/bookings/detail-pages/CustomerServiceBookingDetail";
import CustomerRoomBookingDetail from "./pages/customers/bookings/detail-pages/CustomerRoomBookingDetail";

import CustomerPetList from "./pages/customers/pets/PetList";
import CustomerPetDetail from "./pages/customers/pets/PetDetail";
import CustomerPetCreate from "./pages/customers/pets/PetCreate";
import CustomerPetEdit from "./pages/customers/pets/PetEdit";
import AdminPetList from "./pages/admins/Pets/Pet/PetList";
import AdminPetDetail from "./pages/admins/Pets/Pet/PetDetail";
import AdminPetCreate from "./pages/admins/Pets/Pet/PetCreate";
import AdminPetEdit from "./pages/admins/Pets/Pet/PetEdit";

import PetDiaryListPage from "./pages/customers/Diary/PetDiaryListPage";
import AddPetDiaryPage from "./pages/customers/Diary/AddPetDiaryPage";
import EditPetDiaryPage from "./pages/customers/Diary/EditPetDiaryPage";

import PetHealthBookList from "./pages/admins/pethealthbook/PetHealthBookList";
import PetHealthBookDetail from "./pages/admins/pethealthbook/PetHealthBookDetail";
import PetHealthBookCreate from "./pages/admins/pethealthbook/PetHealthBookCreate";

import PetHealthBookEdit from "./pages/admins/pethealthbook/PetHealthBookEdit";

function App() {
 const userId = sessionStorage.getItem('accountId');
  useEffect(() => {
    signalRService.startConnection("http://localhost:5159/chatHub", userId );

    return () => {
      signalRService.stopConnection(); // Cleanup
    };
  }, []);
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Route không yêu cầu bảo vệ */}

          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />

          {/* Route yêu cầu bảo vệ */}
          <Route
            path="/dashboard"
            element={
              //<ProtectedRoute>
              <Dashboard />
              // </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:accountId"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profilecustomer/:accountId"
            element={
              <ProtectedRoute>
                <ProfileCustomer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/detailcus/:healthBookId"
            element={
              <ProtectedRoute>
                <PetHealthBookDetailCus />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/changepassword/:accountId"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          <Route
            path="/changepasswordcustomer/:accountId"
            element={
              <ProtectedRoute>
                <ChangePasswordCustomer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editprofile/:accountId"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/editprofilecustomer/:accountId"
            element={
              <ProtectedRoute>
                <EditProfileCustomer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/update/:healthBookId"
            element={
              <ProtectedRoute>
                <PetHealthBookEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/detail/:healthBookId"
            element={
              <ProtectedRoute>
                <PetHealthBookDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add"
            element={
              <ProtectedRoute>
                <PetHealthBookCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pethealthbook"
            element={
              <ProtectedRoute>
                <PetHealthBookList />
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
          <Route path="/bookings">
            <Route index element={<CustomerBookingList />} />
            <Route
              path="new"
              element={
                <BookingProvider>
                  {" "}
                  <AddBooking />{" "}
                </BookingProvider>
              }
            />
            <Route
              path="detail/ServiceBookingDetailPage/:bookingId"
              element={<CustomerServiceBookingDetail />}
            />
            <Route
              path="detail/RoomBookingDetailPage/:bookingId"
              element={<CustomerRoomBookingDetail />}
            />
          </Route>

          <Route path="/admin/bookings">
            <Route index element={<AdminBookingList />} />
            <Route
              path="detail/ServiceBookingDetailPage/:bookingId"
              element={<ServiceBookingDetailPage />}
            />
            <Route
              path="detail/RoomBookingDetailPage/:bookingId"
              element={<RoomBookingDetailPage />}
            />
            <Route
              path="new"
              element={
                <BookingProvider>
                  {" "}
                  <Admin_Add_Booking />{" "}
                </BookingProvider>
              }
            />
          </Route>

          <Route path="/gifts">
            <Route index element={<GiftsList />} />
            <Route path="new" element={<GiftAddForm />} />
            <Route path="update/:giftId" element={<GiftUpdatePage />} />
            <Route path="detail/:giftId" element={<GiftDetailForm />} />
          </Route>

          <Route path="/customer/redeemHistory">
            <Route index element={<CustomerRedeemHistory />} />
          </Route>

          <Route path="redeemHistory">
            <Route index element={<AdminRedeemHistory />} />
          </Route>

          <Route path="/customer/gifts">
            <Route index element={<GiftListPage />} />
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

          <Route path="/service">
            <Route index element={<ServiceList />} />
            <Route path="add" element={<AddService />} />
            <Route path=":id" element={<ServiceDetail />} />
            <Route path="edit/:id" element={<UpdateService />} />
          </Route>

          <Route path="/vouchers">
            <Route index element={<VoucherList />} />
            <Route path="new" element={<VoucherAdd />} />
            <Route path="update/:voucherId" element={<VoucherEdit />} />
            <Route path="detail/:voucherId" element={<VoucherDetail />} />
          </Route>
          <Route path="/customer/vouchers">
            <Route index element={<CustomerVoucherList />} />
            <Route
              path="detail/:voucherId"
              element={<CustomerVoucherDetail />}
            />
          </Route>
          <Route path="/medicines">
            <Route index element={<List />} />
            <Route path="new" element={<MedicineAddForm />} />
            <Route path="update/:medicineId" element={<MedicineUpdateForm />} />
            <Route path="detail/:medicineId" element={<MedicineDetailForm />} />
          </Route>
          <Route path="/petType">
            <Route index element={<PetTypeList />} />
            <Route path="add" element={<AddPetType />} />
            <Route path=":id" element={<PetTypeDetail />} />
            <Route path="edit/:id" element={<UpdatePetType />} />
          </Route>
          <Route path="/petBreed">
            <Route index element={<PetBreedList />} />
            <Route path=":id" element={<PetBreedDetail />} />
            <Route path="add" element={<PetBreedCreate />} />
            <Route path="edit/:id" element={<PetBreedEdit />} />
          </Route>
          <Route path="/room">
            <Route index element={<RoomList />} />
            <Route path=":id" element={<RoomDetail />} />
            <Route path="add" element={<RoomCreate />} />
            <Route path="edit/:id" element={<RoomEdit />} />
          </Route>
          <Route path="/customerRoom">
            <Route index element={<CustomerRoomList />} />
            <Route path=":id" element={<CustomerRoomDetail />} />
          </Route>
          <Route path="/customer/services">
            <Route index element={<ServiceListPage />} />
            <Route path=":id" element={<ServiceDetailPage />} />

          </Route>
          <Route path="/customer/pet-diaries/:petId">
            <Route index element={<PetDiaryListPage />} />
          </Route>
          <Route path="/pet">
            <Route index element={<AdminPetList />} />
            <Route path=":id" element={<AdminPetDetail />} />
            <Route path="add" element={<AdminPetCreate />} />
            <Route path="edit/:id" element={<AdminPetEdit />} />
          </Route>
          <Route path="/customer/pet">
            <Route index element={<CustomerPetList />} />
            <Route path=":id" element={<CustomerPetDetail />} />
            <Route path="add" element={<CustomerPetCreate />} />
            <Route path="edit/:id" element={<CustomerPetEdit />} />

          </Route>
          <Route path="/register">
            <Route index element={<Register />} />
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
          <Route path="/chat">
            <Route index element={<Chat />} />
            <Route path="customer" element={<CustomerChatPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}
export default App;
