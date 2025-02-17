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
    medicineId: [],
    visitDate: null,
    nextVisitDate: null,
    performBy: "",
    createdAt: "",
    updatedAt: "",
    isDeleted: false,
  });

  const [bookings, setBookings] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [bookingCode, setbookingCode] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsResponse, medicinesResponse] = await Promise.all([
          fetch("https://localhost:5201/api/Booking"),
          fetch("http://localhost:5003/Medicines"),
          fetch("http://localhost:5003/Pet")
        ]);

        if (!bookingsResponse.ok || !medicinesResponse.ok) {
          throw new Error("Failed to fetch data from server.");
        }

        const [bookingsData, medicinesData] = await Promise.all([
          bookingsResponse.json(),
          medicinesResponse.json()
        ]);

        if (bookingsData && bookingsData.data && Array.isArray(bookingsData.data)) {
          const bookingCodeData = bookingsData.data.map((booking) => booking.bookingCode);
          
          setbookingCode(bookingCodeData);
          setBookings(bookingsData.data);
          console.log("Bookings data:", bookingsData.data);
        } else {
          console.error("Bookings data is not in the expected format:", bookingsData);

          Swal.fire("Error", "Invalid data format for bookings.", "error");
        }

        setMedicines(medicinesData.data || medicinesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire("Error", "Failed to load data. Please try again later.", "error");
      }
    };

    fetchData();
  }, []);

  const generateGuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  const currentDate = new Date().toISOString();
  const handleCreate = async () => {
    if (!visitDetails.bookingId || !visitDetails.medicineId.length || !visitDetails.visitDate || !visitDetails.performBy) {
      Swal.fire("Error", "Please fill all required fields", "error");
      return;
    }
  
    const newVisitDetails = {
      bookingId: visitDetails.bookingId,
      medicineIds: visitDetails.medicineId,
      visitDate: visitDetails.visitDate ? visitDetails.visitDate.toISOString() : null,
      nextVisitDate: visitDetails.nextVisitDate ? visitDetails.nextVisitDate.toISOString() : null,
      performBy: visitDetails.performBy,
      createdAt: currentDate, 
      updatedAt: currentDate,
      isDeleted: visitDetails.isDeleted || false,
    };
  
    // Log dữ liệu trước khi gửi lên API
    console.log("Data sent to API:", newVisitDetails);
  
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
        console.error("Error response from API:", errorData);
        Swal.fire("Error", errorData.message || "Failed to create data", "error");
      } else {
        const result = await response.json();
        
        // Log dữ liệu nhận từ API sau khi tạo thành công
        console.log("Response from API:", result);
  
        Swal.fire({
          title: "Success",
          text: "Pet health book created successfully!",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/pethealthbook");
        });
      }
    } catch (error) {
      console.error("Error sending data:", error);
      Swal.fire("Error", "Failed to create data. Please try again later.", "error");
    }
  };
  
  

  const handleBack = () => {
    navigate(-1);
  };

  const handleMedicineChange = (e) => {
    const { value, checked } = e.target;
    setVisitDetails((prevState) => {
      const newMedicineId = checked
        ? [...prevState.medicineId, value]
        : prevState.medicineId.filter((id) => id !== value);
      return { ...prevState, medicineId: newMedicineId };
    });
  };

  return (
    <div className="flex h-screen bg-dark-grey-100">
      <Sidebar ref={sidebarRef} />
      <div className="content h-full">
        <Navbar sidebarRef={sidebarRef} />
        <main className="p-4 bg-white shadow-md rounded-md h-full">
          <h2 className="mb-4 text-xl font-bold">Create Pet Health Book</h2>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Booking Code</label>
            <select
              className="w-full p-3 border rounded-md"
              value={visitDetails.bookingId}
              onChange={(e) => setVisitDetails({ ...visitDetails, bookingId: e.target.value })}
            >
              <option value="">Select a Booking</option>
              {bookings.map((item, index) => (
                <option key={index} value={item.bookingId}>
                  {item.bookingCode}
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
            <div className="space-y-2">
              {medicines.map((medicine) => (
                <div key={medicine.medicineId} className="flex items-center">
                  <input
                    type="checkbox"
                    value={medicine.medicineId}
                    checked={visitDetails.medicineId.includes(medicine.medicineId)}
                    onChange={handleMedicineChange}
                    className="mr-2"
                  />
                  <label>{medicine.medicineName}</label>
                </div>
              ))}
            </div>
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
