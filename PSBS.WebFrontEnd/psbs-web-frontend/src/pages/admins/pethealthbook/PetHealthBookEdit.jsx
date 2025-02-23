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
    medicineIds: [],
    medicineName: "",
    isDeleted: false,
    createdAt: "",
  });

  const [bookings, setBookings] = useState([]);
  const [bookingCode, setbookingCode] = useState([]);
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthBookResponse, bookingsResponse, medicinesResponse] = await Promise.all([
          fetch(`http://localhost:5003/api/PetHealthBook/${healthBookId}`),
          fetch("http://localhost:5201/Bookings"),
          fetch("http://localhost:5003/Medicines"),
        ]);
    
        if (!healthBookResponse.ok || !bookingsResponse.ok || !medicinesResponse.ok) {
          throw new Error("Failed to fetch data from server.");
        }
    
        // ⚠️ THÊM `.json()` ĐỂ CHUYỂN RESPONSE THÀNH DỮ LIỆU JSON
        const healthBookData = await healthBookResponse.json();
        const bookingsData = await bookingsResponse.json();
        const medicinesData = await medicinesResponse.json();
    
        console.log("Bookings API Response (parsed):", bookingsData);
    
        const healthBook = healthBookData.data || {};
        setVisitDetails({
          healthBookId: healthBook.healthBookId || "",
          bookingId: healthBook.bookingId || "",
          performBy: healthBook.performBy || "",
          visitDate: healthBook.visitDate ? new Date(healthBook.visitDate) : null,
          nextVisitDate: healthBook.nextVisitDate ? new Date(healthBook.nextVisitDate) : null,
          medicineIds: healthBook.medicineIds || [],
          medicineName: healthBook.medicineName || "",
          isDeleted: healthBook.isDeleted || false,
          createdAt: healthBook.createdAt || "",
        });
    
        // Kiểm tra bookingsData có phải là object chứa mảng không
        if (Array.isArray(bookingsData.data)) {
          setBookings(bookingsData.data);
          setbookingCode(bookingsData.data.map(b => b.bookingCode));
        } else {
          console.error("bookingsData.data is not an array:", bookingsData);
          setBookings([]); // Tránh lỗi .map()
          setbookingCode([]);
        }
    
        setMedicines(medicinesData.data || medicinesData);
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
      ...visitDetails,
      healthBookId: visitDetails.healthBookId,
      bookingId: visitDetails.bookingId,
      medicineId: visitDetails.medicineId,
      visitDate: visitDetails.visitDate ? visitDetails.visitDate.toISOString() : null,
      nextVisitDate: visitDetails.nextVisitDate ? visitDetails.nextVisitDate.toISOString() : null,
      performBy: visitDetails.performBy,
      isDeleted: visitDetails.isDeleted,
      createdAt: visitDetails.createdAt,
      updatedAt: new Date().toISOString(),
    };
    console.log("Form Data to be sent:", formData);

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
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Booking Code</label>
            <select
              className="w-full p-3 border rounded-md"
              value={visitDetails.bookingId}
              onChange={(e) => setVisitDetails({ ...visitDetails, bookingId: e.target.value })}
            >
              <option value="">Select a Booking Code</option>
              {bookings.length > 0 ? (
                bookings.map((item) => (
                  <option key={item.bookingId} value={item.bookingId}>
                    {item.bookingCode || `Booking ${item.bookingId}`}
                  </option>
                ))
              ) : (
                <option disabled>Loading bookings...</option>
              )}
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
            <div className="border p-3 rounded-md max-h-40 overflow-y-auto">
              {medicines.length > 0 ? (
                medicines.map((medicine) => (
                  <label key={medicine.medicineId} className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      value={medicine.medicineId}
                      checked={visitDetails.medicineIds.includes(medicine.medicineId)}
                      onChange={(e) => {
                        const selectedValues = e.target.checked
                          ? [...visitDetails.medicineIds, medicine.medicineId]
                          : visitDetails.medicineIds.filter((id) => id !== medicine.medicineId);

                        setVisitDetails({ ...visitDetails, medicineIds: selectedValues });
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{medicine.medicineName}</span>
                  </label>
                ))
              ) : (
                <p className="text-gray-500">No medicines available</p>
              )}
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
