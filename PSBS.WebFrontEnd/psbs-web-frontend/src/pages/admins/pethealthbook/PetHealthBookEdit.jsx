import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";

const PetHealthBookEdit = () => {
  const navigate = useNavigate();
  const { healthBookId } = useParams();
  const sidebarRef = useRef(null);

  const [visitDetails, setVisitDetails] = useState({
    bookingId: "",
    performBy: "",
    visitDate: null,
    nextVisitDate: null,
    medicineId: "",
    medicineName: "",
    isDeleted: false,
    createdAt: "",
  });

  const [bookings, setBookings] = useState([]);
  const [bookingTypes, setBookingTypes] = useState([]);
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthBookResponse, bookingsResponse, medicinesResponse, typesResponse] = await Promise.all([
          fetch(`http://localhost:5003/api/PetHealthBook/${healthBookId}`),
          fetch("http://localhost:5115/api/Booking"),
          fetch("http://localhost:5003/Medicines"),
          fetch("http://localhost:5115/api/BookingType"),
        ]);

        if (!healthBookResponse.ok || !bookingsResponse.ok || !medicinesResponse.ok || !typesResponse.ok) {
          throw new Error("Failed to fetch data from server.");
        }

        const [healthBookData, bookingsData, medicinesData, typesData] = await Promise.all([
          healthBookResponse.json(),
          bookingsResponse.json(),
          medicinesResponse.json(),
          typesResponse.json(),
        ]);

        const healthBook = healthBookData.data || {};
        setVisitDetails({
          healthBookId: healthBook.healthBookId || "", // Thêm healthBookId vào
          bookingId: healthBook.bookingId || "",
          performBy: healthBook.performBy || "",
          visitDate: healthBook.visitDate ? new Date(healthBook.visitDate) : null,
          nextVisitDate: healthBook.nextVisitDate ? new Date(healthBook.nextVisitDate) : null,
          medicineId: healthBook.medicineId || "",
          medicineName: healthBook.medicineName || "",
          isDeleted: healthBook.isDeleted || false,
          createdAt: healthBook.createdAt || "",
        });

        setBookings(bookingsData);
        setMedicines(medicinesData.data || medicinesData);
        setBookingTypes(typesData.data || typesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire("Error", "Failed to load data. Please try again later.", "error");
      }
    };

    fetchData();
  }, [healthBookId]);

  useEffect(() => {
    if (visitDetails.medicineId && medicines.length > 0) {
      const selectedMedicine = medicines.find((med) => med.medicineId === visitDetails.medicineId);
      if (selectedMedicine) {
        setVisitDetails((prev) => ({ ...prev, medicineName: selectedMedicine.medicineName }));
      }
    }
  }, [visitDetails.medicineId, medicines]);

  const validateForm = () => {
    if (!visitDetails.bookingId || !visitDetails.performBy) {
      Swal.fire("Error", "Please fill in all required fields.", "error");
      return false;
    }
    return true;
  };

  const handleEdit = async () => {
    if (!validateForm()) return;

    const formData = {
      healthBookId: visitDetails.healthBookId, // Bổ sung healthBookId
      bookingId: visitDetails.bookingId,
      medicineId: visitDetails.medicineId,
      visitDate: visitDetails.visitDate ? visitDetails.visitDate.toISOString() : null,
      nextVisitDate: visitDetails.nextVisitDate ? visitDetails.nextVisitDate.toISOString() : null,
      performBy: visitDetails.performBy,
      isDeleted: visitDetails.isDeleted,
      createdAt: visitDetails.createdAt,
      updatedAt: new Date().toISOString(),
    };
    console.log("Form Data to be sent:", formData); // Log the form data here

    try {
      const response = await fetch(`http://localhost:5003/api/PetHealthBook/${healthBookId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      console.log("Payload ID:", formData.healthBookId, formData.bookingId, formData.medicineId);

      if (!response.ok) {
        const errorData = await response.json(); // Xem chi tiết phản hồi lỗi
        console.error("Error response from API:", errorData); // Log lỗi
        Swal.fire("Error", errorData.message || "Failed to update data", "error");
        return;
      }

      Swal.fire("Success", "Pet health book updated successfully!", "success");
      navigate(-1);
    } catch (error) {
      console.error("Error updating data:", error);
      Swal.fire("Error", "Failed to update data. Please try again later.", "error");
    }

  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex h-screen bg-dark-grey-100">
      <Sidebar ref={sidebarRef} />
      <div className="content h-full">
        <Navbar sidebarRef={sidebarRef} />
        <main className="p-4 bg-white shadow-md rounded-md h-full">
          <h2 className="mb-4 text-xl font-bold">Edit Pet Health Book</h2>
          {/* <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Booking Type</label>
            <div className="relative w-full">
             
              <select
                className="w-full p-3 pr-10 border rounded-md appearance-none"
                value={visitDetails.bookingId}
                onChange={(e) => setVisitDetails({ ...visitDetails, bookingId: e.target.value })}
              >
                <option value="">Select a Medicine</option>
                {bookingTypes.map((type) => (
                  <option key={type.bookingTypeId} value={type.bookingTypeId}>
                    {type.bookingTypeName}
                  </option>
                ))}
              </select>
              
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-black-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div> */}
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Perform by</label>
            <input
              type="text"
              className="w-full p-3 border rounded-md"
              value={visitDetails.performBy}
              onChange={(e) => setVisitDetails({ ...visitDetails, performBy: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Visit Date</label>
            <DatePicker
              selected={visitDetails.visitDate}
              onChange={(date) => setVisitDetails({ ...visitDetails, visitDate: date })}
              dateFormat="dd/MM/yyyy"
              className="w-full p-3 border rounded-md"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Next Visit Date</label>
            <DatePicker
              selected={visitDetails.nextVisitDate}
              onChange={(date) => setVisitDetails({ ...visitDetails, nextVisitDate: date })}
              dateFormat="dd/MM/yyyy"
              className="w-full p-3 border rounded-md"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Medicine</label>
            <div className="relative w-full">
              {/* Dropdown */}
              <select
                className="w-full p-3 pr-10 border rounded-md appearance-none"
                value={visitDetails.medicineId}
                onChange={(e) => setVisitDetails({ ...visitDetails, medicineId: e.target.value })}
              >
                <option value="">Select a Medicine</option>
                {medicines.map((medicine) => (
                  <option key={medicine.medicineId} value={medicine.medicineId}>
                    {medicine.medicineName}
                  </option>
                ))}
              </select>
              {/* Icon dropdown */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-black-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleEdit}
              className="bg-teal-600 text-white font-bold py-2 px-4 rounded-md hover:bg-cyan-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="bg-gray-600 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700"
            >
              Back
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PetHealthBookEdit;
