import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";
import Swal from "sweetalert2";

const PetHealthBookDetail = () => {
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const { healthBookId } = useParams();
  const [petHealthBook, setPetHealthBook] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [pets, setPets] = useState([]);
  const [accountDetails, setAccountDetails] = useState({});
  const [accountName, setAccountName] = useState("");
  const [accountPhoneNumber, setAccountPhoneNumber] = useState("");
  const [petImage, setPetImage] = useState(null);
  const [petName, setPetName] = useState("");
  const [dateOfBirth, setdateOfBirth] = useState("");
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching Pet Health Book Data...");
        const [healthBookRes, medicinesRes, treatmentsRes, bookingsRes, petsRes, bookingServiceItemsRes] = await Promise.all([
          fetch(`http://localhost:5003/api/PetHealthBook/${healthBookId}`),
          fetch(`http://localhost:5003/Medicines`),
          fetch(`http://localhost:5003/api/Treatment`),
          fetch(`http://localhost:5201/Bookings`),
          fetch(`http://localhost:5010/api/pet`),
          fetch(`http://localhost:5023/api/BookingServiceItems/GetBookingServiceList`),
        ]);

        if (!healthBookRes.ok || !medicinesRes.ok || !treatmentsRes.ok || !bookingsRes.ok || !petsRes.ok || !bookingServiceItemsRes.ok) {
          throw new Error("Failed to fetch some data.");
        }

        const [healthBookData, medicinesData, treatmentsData, bookingsData, petsData, bookingServiceItemsData] = await Promise.all([
          healthBookRes.json(),
          medicinesRes.json(),
          treatmentsRes.json(),
          bookingsRes.json(),
          petsRes.json(),
          bookingServiceItemsRes.json(),
        ]);

        console.log("Pet Health Book Data:", healthBookData);

        setPetHealthBook(healthBookData.data || {});
        setMedicines(medicinesData.data || []);
        setTreatments(treatmentsData.data || []);
        setBookings(bookingsData.data || []);
        setPets(petsData.data || []);
        if (!healthBookData.data?.bookingServiceItemId) return;
        const bookingServiceItem = bookingServiceItemsData.data.find(
          (bsi) => bsi.bookingServiceItemId === healthBookData.data.bookingServiceItemId
        );

        if (!bookingServiceItem) return;
        const booking = bookingsData.data.find((b) => b.bookingId === bookingServiceItem.bookingId);
        if (!booking) return;
        fetchAccountDetails(booking.accountId);
        const pet = petsData.data.find((p) => p.petId === bookingServiceItem.petId);
        if (pet) {
          setPetImage(pet.petImage);
          setPetName(pet.petName);
          setdateOfBirth(pet.dateOfBirth);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire("Error", "Failed to load data. Please try again later.", "error");
      }
    };
    fetchData();
  }, [healthBookId]);

  const fetchAccountDetails = async (accountId) => {
    try {
      console.log("Fetching account details for ID:", accountId);
      const res = await fetch(`http://localhost:5000/api/Account/${accountId}`);
      if (!res.ok) throw new Error("Failed to fetch account details");
      const data = await res.json();
      console.log("Fetched Account Data:", data);
      setAccountName(data.data.accountName || "N/A");
      setAccountPhoneNumber(data.data.accountPhoneNumber || "N/A");
    } catch (error) {
      console.error("Error fetching account:", error);
    }
  };
  useEffect(() => {
    if (petHealthBook?.bookingId && bookings.length > 0) {
      const booking = bookings.find(b => b.bookingId === petHealthBook.bookingId);
      if (booking?.accountId) {
        console.log("Booking Found:", booking);
        fetchAccountDetails(booking.accountId);
      } else {
        console.warn("Booking or Account ID not found!");
      }
    }
  }, [petHealthBook, bookings]);
  const handleBack = () => {
    navigate(-1);
  };
  if (!petHealthBook) {
    return <div>Loading...</div>;
  }
  const {
    performBy,
    visitDate,
    nextVisitDate,
    createdAt,
    updatedAt,
  } = petHealthBook;
  const medicineIds = petHealthBook?.medicineIds || [];
  const selectedMedicines = medicines.filter((m) => medicineIds.includes(m.medicineId));
  const medicineNames = selectedMedicines.map((m) => m.medicineName).join(", ") || "No Medicines Assigned";
  const treatmentIds = [...new Set(selectedMedicines.map((m) => m.treatmentId))]; // Lấy danh sách treatmentId duy nhất
  const assignedTreatments = treatments.filter((t) => treatmentIds.includes(t.treatmentId));
  const treatmentNames = assignedTreatments.length > 0
    ? assignedTreatments.map((t) => t.treatmentName).join(", ")
    : "No Treatments Assigned";
  const bookingAccount = bookings.find((b) => b.id === healthBookId);
  const ownerAccount = accountDetails[bookingAccount?.accountId] || {};
  return (
    <div className="flex h-screen bg-dark-grey-100 overflow-x-hidden">
      <Sidebar ref={sidebarRef} />
      <div className="content overflow-y-auto">
        <Navbar sidebarRef={sidebarRef} />
        <div className="p-6 bg-white shadow-md rounded-md max-w-full">
          <h2 className="mb-4 text-xl font-bold text-left">Health Book Detail</h2>
          <div className="flex flex-wrap">
            <div className="w-full sm:w-1/3 bg-white shadow-md rounded-md p-6">
              <div className="flex flex-col items-center">
                <img
                  src={petImage ? `http://localhost:5010${petImage}` : '/Images/default-image.png'}
                  alt="Pet Health Record"
                  className="w-[300px] h-[300px] object-cover rounded-lg shadow-lg"
                />
                <div className="mt-4 text-sm font-bold">{petName || "Bull"}</div>
                <div className="mt-4 text-sm ">{formatDate(dateOfBirth) || "17/02/2023"}</div>
              </div>
              <div className="mt-4 flex items-center">
                <label className="text-base font-bold mb-2 mt-4 w-[12rem]">Owner:</label>
                <input
                  type="text"
                  className="w p-3 border rounded-md"
                  defaultValue={accountName}
                  disabled
                />
              </div>
              <div className="mt-4 flex items-center">
                <label className="text-base font-bold mb-2 mt-4 w-[12rem]">Owner's Phone Number:</label>
                <input
                  type="text"
                  className="w p-3 border rounded-md"
                  defaultValue={accountPhoneNumber}
                  disabled
                />
              </div>
            </div>
            <div className="w-full sm:w-2/3 bg-white shadow-md rounded-md p-6">
              <form>
                <div className="mb-3">
                  <label className="block text-sm  mb-1 font-bold">Treatment</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-md"
                    value={treatmentNames}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm  mb-1 font-bold">Performed By</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-md"
                    value={performBy || ""}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm  mb-1 font-bold">Visit Date</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-md"
                    value={formatDate(visitDate)}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm  mb-1 font-bold">Next Visit Date</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-md"
                    value={formatDate(nextVisitDate)}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm mb-1 font-bold">Medicine</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-md"
                    value={medicineNames}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm mb-1 font-bold">Created At</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-md"
                    value={formatDate(createdAt)}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm mb-1 font-bold">Created By</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-md"
                    value={performBy || ""}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm mb-1 font-bold">Latest Update</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-md"
                    value={formatDate(updatedAt)}
                    disabled
                  />
                </div>
              </form>
            </div>
            {/* <button
                type="button"
                onClick={handleBack}
                className="bg-gray-600 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700"
              >
                Back
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};
export default PetHealthBookDetail;