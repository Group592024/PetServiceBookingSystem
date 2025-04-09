import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./protectPageRoute";
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
import ChangePasswordCustomer from "./pages/customers/profile-Customer/ChangePasswordCustomer";
import ProfileCustomer from "./pages/customers/profile-Customer/ProfileCustomer";
import EditProfileCustomer from "./pages/customers/profile-Customer/EditProfileCustomer";
import CustomerRedeemHistory from "./pages/customers/gifts/gift-history/CustomerRedeemHistory";
import AdminRedeemHistory from "./pages/admins/gifts/gift-history/AdminRedeemHistory";
import CustomerPetList from "./pages/customers/pets/PetList";
import CustomerPetDetail from "./pages/customers/pets/PetDetail";
import CustomerPetCreate from "./pages/customers/pets/PetCreate";
import CustomerPetEdit from "./pages/customers/pets/PetEdit";
import AdminPetList from "./pages/admins/Pets/Pet/PetList";
import AdminPetDetail from "./pages/admins/Pets/Pet/PetDetail";
import AdminPetCreate from "./pages/admins/Pets/Pet/PetCreate";
import AdminPetEdit from "./pages/admins/Pets/Pet/PetEdit";
import ServiceListPage from "./pages/customers/services/ServiceListPage";
import ServiceDetailPage from "./pages/customers/services/ServiceDetailPage";
import PetDiaryListPage from "./pages/customers/Diary/PetDiaryListPage";
import PetHealthBookList from "./pages/admins/pethealthbook/PetHealthBookList";
import PetHealthBookDetail from "./pages/admins/pethealthbook/PetHealthBookDetail";
import PetHealthBookCreate from "./pages/admins/pethealthbook/PetHealthBookCreate";
import PetHealthBookEdit from "./pages/admins/pethealthbook/PetHealthBookEdit";
import ReportBookingPage from "./pages/admins/reports/ReportBookingPage";
import PetHealthBookListAdmin from "./pages/admins/pethealthbook/ListPetHealthBook/ListPetHealthBookAdmin";
import PetHealthBookDetailAdmin from "./pages/admins/pethealthbook/ListPetHealthBook/DetailPetHealthBookAdmin";
import CameraList from "./pages/admins/camera/CameraList";
import CreateCamera from "./pages/admins/camera/CreateCamera";
import CameraDetail from "./pages/admins/camera/CameraDetail";
import EditCamera from "./pages/admins/camera/EditCamera";
import Chat from "./pages/admins/chat/Chat";
import signalRService from "./lib/ChatService";
import { useEffect } from "react";
import CustomerChatPage from "./pages/customers/chat/CustomerChatPage";
import AdminBookingList from "./pages/admins/bookings/list-pages/AdminBookingList";
import ServiceBookingDetailPage from "./pages/admins/bookings/detail-form/ServiceBookingDetailPage";
import RoomBookingDetailPage from "./pages/admins/bookings/detail-form/RoomBookingDetailPage";
import CustomerBookingList from "./pages/customers/bookings/list-pages/CustomerBookingList";
import { BookingProvider } from "./components/Booking/add-form/BookingContext";
import AddBooking from "./pages/customers/bookings/AddBooking";
import Admin_Add_Booking from "./pages/admins/bookings/add-form/Admin_Add_Booking";
import CustomerServiceBookingDetail from "./pages/customers/bookings/detail-pages/CustomerServiceBookingDetail";
import CustomerRoomBookingDetail from "./pages/customers/bookings/detail-pages/CustomerRoomBookingDetail";
import CameraCreate from "./pages/admins/camera/CreateCamera";
import CameraCus from "./pages/customers/cameras/CameraCus";
import Unauthorized from "./pages/authorize/Unauthorized";
import ListNotification from "./pages/admins/notification/listNotification/ListNotification";

function App() {
  const userId = sessionStorage.getItem("accountId");
  useEffect(() => {
    signalRService.startConnection("http://localhost:5050/chatHub", userId);

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
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/customer/services">
            <Route index element={<ServiceListPage />} />
            <Route path=":id" element={<ServiceDetailPage />} />
          </Route>
          <Route path="/customerRoom">
            <Route index element={<CustomerRoomList />} />
            <Route path=":id" element={<CustomerRoomDetail />} />
          </Route>

          {/* Route yêu cầu bảo vệ */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/report">
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ReportBookingPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Account links*/}
          <Route
            path="/profile/:accountId"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff", "user"]}>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profilecustomer/:accountId"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff", "user"]}>
                <ProfileCustomer />
              </ProtectedRoute>
            }
          />

          <Route
            path="/detailcus/:healthBookId"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <PetHealthBookDetailCus />
              </ProtectedRoute>
            }
          />
          <Route
            path="/list/:petId"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <PetHealthBookListCus />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pethealthbook/detail/:healthBookId"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff", "user"]}>
                <PetHealthBookDetailAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pethealthbook/list/:petId/:accountId"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff", "user"]}>
                <PetHealthBookListAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <AccountList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/changepassword/:accountId"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff", "user"]}>
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          <Route
            path="/changepasswordcustomer/:accountId"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <ChangePasswordCustomer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editprofile/:accountId"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <EditProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/editprofilecustomer/:accountId"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <EditProfileCustomer />
              </ProtectedRoute>
            }
          />

          {/* PetHealthBook links*/}
          <Route
            path="/update/:healthBookId"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <PetHealthBookEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/detail/:healthBookId"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <PetHealthBookDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <PetHealthBookCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pethealthbook"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <PetHealthBookList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/camera"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <CameraCus />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cameralist"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <CameraList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addcamera"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <CreateCamera />
              </ProtectedRoute>
            }
          />
          <Route
            path="/detailcamera/:cameraId"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <CameraDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editcamera/:cameraId"
            element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <EditCamera />
              </ProtectedRoute>
            }
          />
          {/* Các route khác */}
          {/* Medicine links*/}

          <Route path="/medicines">
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <List />
                </ProtectedRoute>
              }
            />
            <Route
              path="new"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <MedicineAddForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="update/:medicineId"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <MedicineUpdateForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="detail/:medicineId"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <MedicineDetailForm />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Booking links*/}
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

          {/* Gift links*/}
          <Route path="/gifts">
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={["admin", "staff"]}>
                  <GiftsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="new"
              element={
                <ProtectedRoute allowedRoles={["admin", "staff"]}>
                  <GiftAddForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="update/:giftId"
              element={
                <ProtectedRoute allowedRoles={["admin", "staff"]}>
                  <GiftUpdatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="detail/:giftId"
              element={
                <ProtectedRoute allowedRoles={["admin", "staff"]}>
                  <GiftDetailForm />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="/customer/redeemHistory">
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <CustomerRedeemHistory />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="redeemHistory">
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={["admin", "staff"]}>
                  <AdminRedeemHistory />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="/customer/gifts">
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <GiftListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="detail/:giftId"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <GiftDetailPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/*PetType links*/}
          <Route path="/petType">
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <PetTypeList />
                </ProtectedRoute>
              }
            />
            <Route
              path="add"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AddPetType />
                </ProtectedRoute>
              }
            />
            <Route
              path=":id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <PetTypeDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="edit/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <UpdatePetType />
                </ProtectedRoute>
              }
            />
          </Route>

          {/*Setting links*/}
          <Route path="/settings">
            <Route
              path="pointrule"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <PointRuleList />
                </ProtectedRoute>
              }
            />
            <Route
              path="paymentType"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <PaymentTypeList />
                </ProtectedRoute>
              }
            />
            <Route
              path="bookingType"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <BookingTypeList />
                </ProtectedRoute>
              }
            />
            <Route
              path="bookingStatus"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <BookingStatusList />
                </ProtectedRoute>
              }
            />
            <Route
              path="treatments"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <TreatmentList />
                </ProtectedRoute>
              }
            />
            <Route
              path="servicetypes"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ServiceTypeList />
                </ProtectedRoute>
              }
            />
            <Route
              path="roomtypes"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <RoomTypeList />
                </ProtectedRoute>
              }
            />
          </Route>

          {/*Service links*/}
          <Route path="/service">
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={["admin", "staff"]}>
                  <ServiceList />
                </ProtectedRoute>
              }
            />
            <Route
              path="add"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AddService />
                </ProtectedRoute>
              }
            />
            <Route
              path=":id"
              element={
                <ProtectedRoute allowedRoles={["admin", "staff"]}>
                  <ServiceDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="edit/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <UpdateService />
                </ProtectedRoute>
              }
            />
          </Route>

          {/*Voucher links*/}
          <Route path="/vouchers">
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <VoucherList />
                </ProtectedRoute>
              }
            />
            <Route
              path="new"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <VoucherAdd />
                </ProtectedRoute>
              }
            />
            <Route
              path="update/:voucherId"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <VoucherEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="detail/:voucherId"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <VoucherDetail />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="/customer/vouchers">
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <CustomerVoucherList />
                </ProtectedRoute>
              }
            />
            <Route
              path="detail/:voucherId"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <CustomerVoucherDetail />
                </ProtectedRoute>
              }
            />
          </Route>

          {/*PetBreed links */}
          <Route path="/petBreed">
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <PetBreedList />
                </ProtectedRoute>
              }
            />
            <Route
              path=":id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <PetBreedDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="add"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <PetBreedCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="edit/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <PetBreedEdit />
                </ProtectedRoute>
              }
            />
          </Route>

          {/*Room links*/}
          <Route path="/room">
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={["admin", "staff"]}>
                  <RoomList />
                </ProtectedRoute>
              }
            />
            <Route
              path=":id"
              element={
                <ProtectedRoute allowedRoles={["admin", "staff"]}>
                  <RoomDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="add"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <RoomCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="edit/:id"
              element={
                <ProtectedRoute allowedRoles={["admin", "staff"]}>
                  <RoomEdit />
                </ProtectedRoute>
              }
            />
          </Route>

          {/*PetDiary links */}
          <Route path="/customer/pet-diaries/:petId">
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={["admin", "staff", "user"]}>
                  <PetDiaryListPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/*Pet links */}
          <Route path="/pet">
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={["admin", "staff"]}>
                  <AdminPetList />
                </ProtectedRoute>
              }
            />
            <Route
              path=":id"
              element={
                <ProtectedRoute allowedRoles={["admin", "staff"]}>
                  <AdminPetDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="add"
              element={
                <ProtectedRoute allowedRoles={["admin", "staff"]}>
                  <AdminPetCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="edit/:id"
              element={
                <ProtectedRoute allowedRoles={["admin", "staff"]}>
                  <AdminPetEdit />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="/customer/pet">
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <CustomerPetList />
                </ProtectedRoute>
              }
            />
            <Route
              path=":id"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <CustomerPetDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="add"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <CustomerPetCreate />
                </ProtectedRoute>
              }
            />
            <Route
              path="edit/:id"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <CustomerPetEdit />
                </ProtectedRoute>
              }
            />
          </Route>

          {/**Chat links */}
          <Route path="/chat">
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={["admin", "staff"]}>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="customer"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <CustomerChatPage />
                </ProtectedRoute>
              }
            />
          </Route>
          {/**Notification links */}
          <Route path="/notification">
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ListNotification />
                </ProtectedRoute>
              }
            />
            {/* <Route
              path="detail/:voucherId"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <CustomerVoucherDetail />
                </ProtectedRoute>
              }
            /> */}
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}
export default App;
