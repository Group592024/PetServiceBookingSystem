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
  const [accountDetails, setAccountDetails] = useState({});
  const [accountName, setAccountName] = useState("");
  const [accountPhoneNumber, setAccountPhoneNumber] = useState("");

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
        // Fetch pet health book data
        console.log("Fetching Pet Health Book Data...");
        const response = await fetch(`http://localhost:5003/api/PetHealthBook/${healthBookId}`);
        if (!response.ok) throw new Error("Failed to fetch pet health book data.");
        const data = await response.json();
        console.log("Pet Health Book Data:", data);
        setPetHealthBook(data.data || {});

        // Fetch medicines data
        console.log("Fetching Medicines Data...");
        const medicinesResponse = await fetch(`http://localhost:5003/Medicines`);
        if (!medicinesResponse.ok) throw new Error("Failed to fetch medicines data.");
        const medicinesData = await medicinesResponse.json();
        console.log("Medicines Data:", medicinesData);
        setMedicines(medicinesData.data || []);

        // Fetch treatments data
        console.log("Fetching Treatments Data...");
        const treatmentsResponse = await fetch(`http://localhost:5003/api/Treatment`);
        if (!treatmentsResponse.ok) throw new Error("Failed to fetch treatments data.");
        const treatmentsData = await treatmentsResponse.json();
        console.log("Treatments Data:", treatmentsData);
        setTreatments(treatmentsData.data || []);

        if (!data.data || !data.data.bookingId) {
          console.log("Pet health book data is not loaded yet.");
          return; // Chưa có bookingId, dừng lại
        }

        // Fetch bookings data
        console.log("Fetching Bookings Data...");
        const bookingsResponse = await fetch(`http://localhost:5115/api/Booking`);
        if (!bookingsResponse.ok) throw new Error("Failed to fetch bookings data.");
        const bookingsData = await bookingsResponse.json();
        console.log("Bookings Data:", bookingsData);
        setBookings(bookingsData.data || []);

        // Find the bookingId and check if it matches with the petHealthBook data
        const booking = bookingsData.data.find((b) => b.bookingId === data.data.bookingId);
        if (booking) {
          console.log("Found booking with bookingId:", booking.bookingId);

          // Once bookingId is found, get the accountId
          const { accountId } = booking;

          // Check if accountId is available
          if (accountId) {
            console.log("Found accountId:", accountId);

            // Now call the function to get account data using accountId
            const accountResponse = await fetch(`http://localhost:5000/api/Account?AccountId=${accountId}`);
            if (!accountResponse.ok) throw new Error(`Failed to fetch account with ID: ${accountId}`);
            const accountData = await accountResponse.json();
            console.log("Account Data:", accountData);

            // Set account name and phone number
            setAccountName(accountData.accountName);
            setAccountPhoneNumber(accountData.accountPhoneNumber);
          } else {
            console.log("No accountId found in booking.");
          }
        } else {
          console.log("No matching booking found for this bookingId.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire("Error", "Failed to load data. Please try again later.", "error");
      }
    };

    fetchData();
  }, [healthBookId]);

  const handleBack = () => {
    navigate(-1);
  };


  if (!petHealthBook) {
    return <div>Loading...</div>;
  }
  const {
    petImage,
    petName,
    petGender,
    petDob,
    ownerName,
    ownerPhoneNumber,
    treatmentId,
    performBy,
    visitDate,
    nextVisitDate,
    medicineId,
    createdAt,
    createdBy,
    updatedAt,
  } = petHealthBook;
  const treatmentIdFromMedicine = medicines.find((m) => m.medicineId === medicineId)?.treatmentId;
  const treatmentName = treatments.find(
    (t) => t.treatmentId.trim() === treatmentIdFromMedicine.trim()
  )?.treatmentName || "No Treatment Assigned";
  const medicineName = medicines.find((m) => m.medicineId === medicineId)?.medicineName || "No Medicine Assigned";
  const bookingAccount = bookings.find((b) => b.id === healthBookId);
  const ownerAccount = accountDetails[bookingAccount?.accountId] || {};
  const displayOwnerName = ownerAccount.accountName;
  const displayOwnerPhone = ownerAccount.accountPhoneNumber
  return (
    <div className="flex h-screen bg-dark-grey-100 overflow-x-hidden">
      <Sidebar ref={sidebarRef} />
      <div className="content overflow-y-auto">
        <Navbar sidebarRef={sidebarRef} />

        <div className="p-6 bg-white shadow-md rounded-md max-w-full">
          <h2 className="mb-4 text-xl font-bold text-left">Pet Health Book Detail</h2>

          <div className="flex flex-wrap">
            {/* Left Column */}
            <div className="w-full sm:w-1/3 bg-white shadow-md rounded-md p-6">
              <div className="flex flex-col items-center">
                <div className="w-[15rem] h-[15rem] rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  {petImage ? (
                    <img
                      src={petImage}
                      alt="Pet Preview"
                      className="rounded-full w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      className="w-[15rem] h-[15rem] text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5.121 17.804A9.003 9.003 0 0112 3v0a9.003 9.003 0 016.879 14.804M12 7v4m0 4h.01"
                      />
                    </svg>
                  )}
                </div>
                <div className="mt-4 text-sm font-bold">{petName || "Bull"}</div>
                <div className="mt-4 text-sm ">{petGender || "Male"}</div>
                <div className="mt-4 text-sm ">{formatDate(petDob) || "17/02/2023"}</div>
              </div>
              <div className="mt-4 flex items-center">
                <label className="text-base font-bold mb-2 mt-4 w-[12rem]">Owner:</label>
                <input
                  type="text"
                  className="w p-3 border rounded-md"
                  value={accountName}
                  disabled
                />
              </div>

              <div className="mt-4 flex items-center">
                <label className="text-base font-bold mb-2 mt-4 w-[12rem]">Owner's Phone Number:</label>
                <input
                  type="text"
                  className="w p-3 border rounded-md"
                  value={accountPhoneNumber}
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
                    value={treatmentName}
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
                    value={medicineName}
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
