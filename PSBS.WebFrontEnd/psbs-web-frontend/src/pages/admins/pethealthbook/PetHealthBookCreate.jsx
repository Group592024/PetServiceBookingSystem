import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";

const PetHealthBookCreate = () => {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  const [visitDetails, setVisitDetails] = useState({
    healthBookId: "",
    bookingId: "",
    medicineId: "",
    visitDate: null,
    nextVisitDate: null,
    performBy: "",
    medicineName: "",
    createdAt: "",
    updatedAt: "",
    isDeleted: false,
  });

  const [bookings, setBookings] = useState([]);
  const [bookingTypes, setBookingTypes] = useState([]);
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsResponse, medicinesResponse, typesResponse] = await Promise.all([
          fetch("http://localhost:5115/api/Booking"),
          fetch("http://localhost:5003/Medicines"),
          fetch("http://localhost:5115/api/BookingType"),
        ]);

        if (!bookingsResponse.ok || !medicinesResponse.ok || !typesResponse.ok) {
          throw new Error("Failed to fetch data from server.");
        }

        const [bookingsData, medicinesData, typesData] = await Promise.all([ 
          bookingsResponse.json(),
          medicinesResponse.json(),
          typesResponse.json(),
        ]);
        console.log("Visit Details before submission:", visitDetails);
        console.log("Fetched Bookings:", bookingsData);
        console.log("Fetched Medicines:", medicinesData);
        console.log("Fetched Booking Types:", typesData);

        setBookings(bookingsData);
        setMedicines(medicinesData.data || medicinesData);
        setBookingTypes(typesData.data || typesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire("Error", "Failed to load data. Please try again later.", "error");
      }
    };

    fetchData();
  }, []);

  const generateGuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

 const handleCreate = async () => {
    console.log("Visit Details before submission:", visitDetails);
  
    if (!visitDetails.bookingId || !visitDetails.medicineId || !visitDetails.visitDate || !visitDetails.performBy) {
      Swal.fire("Error", "Please fill all required fields", "error");
      return;
    }
  
    const newVisitDetails = {
      healthBookId: generateGuid(),  
      bookingId: visitDetails.bookingId,  
      medicineId: visitDetails.medicineId,  
      visitDate: visitDetails.visitDate ? visitDetails.visitDate.toISOString() : null,  
      nextVisitDate: visitDetails.nextVisitDate ? visitDetails.nextVisitDate.toISOString() : null,  
      performBy: visitDetails.performBy, 
      createdAt: new Date().toISOString(),  
      updatedAt: new Date().toISOString(), 
      isDeleted: visitDetails.isDeleted || false,  
    };
  
    console.log("Data to be sent to the API (Correct Order):", newVisitDetails);
  
    try {
      const response = await fetch("http://localhost:5003/api/PetHealthBook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newVisitDetails),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error:", errorData); 
        Swal.fire("Error", errorData.message || "Failed to create data", "error");
      } else {
        console.log("API Response:", await response.json());
        Swal.fire("Success", "Pet health book created successfully!", "success");
      }
    } catch (error) {
      console.error("Error sending data:", error);
      Swal.fire("Error", "Failed to create data. Please try again later.", "error");
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
          <h2 className="mb-4 text-xl font-bold">Create Pet Health Book</h2>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Booking Type</label>
            <select
              className="w-full p-3 border rounded-md"
              value={visitDetails.bookingId}
              onChange={(e) => setVisitDetails({ ...visitDetails, bookingId: e.target.value })}
            >
              <option value="">Select a Booking Type</option>
              {bookingTypes.map((type) => (
                <option key={type.bookingTypeId} value={type.bookingTypeId}>
                  {type.bookingTypeName}
                </option>
              ))}
            </select>
          </div>

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
            <select
              className="w-full p-3 border rounded-md"
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
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleCreate}
              className="bg-teal-600 text-white font-bold py-2 px-4 rounded-md hover:bg-cyan-700"
            >
              Create
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

export default PetHealthBookCreate;
