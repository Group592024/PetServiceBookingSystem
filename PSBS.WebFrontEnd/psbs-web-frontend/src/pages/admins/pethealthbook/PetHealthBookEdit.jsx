import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";

const PetHealthBookEdit = () => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
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
  const [bookingServiceItems, setBookingServiceItems] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingCode, setBookingCode] = useState([]);
  const [medicines, setMedicines] = useState([]);

  const [petName, setPetName] = useState("");
  const [bookingServices, setBookingServices] = useState([]);
  const [pets, setPets] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        };

        const [
          healthBookResponse,
          bookingsResponse,
          medicinesResponse,
          treatmentsResponse,
          petsResponse,
          bookingServiceResponse,
        ] = await Promise.all([
          fetch(`http://localhost:5050/api/PetHealthBook/${healthBookId}`, { headers }),
          fetch("http://localhost:5050/Bookings", { headers }),
          fetch("http://localhost:5050/Medicines", { headers }),
          fetch("http://localhost:5050/api/Treatment", { headers }),
          fetch("http://localhost:5050/api/pet", { headers }),
          fetch("http://localhost:5050/api/BookingServiceItems/GetBookingServiceList", { headers }),
        ]);

        if (
          !healthBookResponse.ok ||
          !bookingsResponse.ok ||
          !medicinesResponse.ok ||
          !treatmentsResponse.ok ||
          !petsResponse.ok ||
          !bookingServiceResponse.ok
        ) {
          throw new Error("Failed to fetch data from server.");
        }

        const [
          healthBookData,
          bookingsData,
          medicinesData,
          treatmentsData,
          petsData,
          bookingServiceData,
        ] = await Promise.all([
          healthBookResponse.json(),
          bookingsResponse.json(),
          medicinesResponse.json(),
          treatmentsResponse.json(),
          petsResponse.json(),
          bookingServiceResponse.json(),
        ]);

        setBookingServiceItems(bookingServiceData.data || []);
        const healthBook = healthBookData.data || {};
        const selectedBookingService = bookingServiceData.data.find(
          (item) => item.bookingServiceItemId === healthBookData.data.bookingServiceItemId
        );
        if (!selectedBookingService) {
          console.log("Error bookingServiceItemId!");
          return;
        }
        const bookingId = selectedBookingService.bookingId;
        const selectedBooking = bookingsData.data.find((booking) => booking.bookingId === bookingId);
        if (selectedBooking) {
          setBookingCode(selectedBooking.bookingCode);
        }

        const selectedPet = petsData.data.find((pet) => pet.petId === selectedBookingService.petId);
        if (selectedPet) {
          setPetName(selectedPet.petName);
        }

        setVisitDetails((prev) => ({
          ...prev,
          healthBookId: healthBook.healthBookId || "",
          bookingId: healthBook.bookingId || "",
          performBy: healthBook.performBy || "",
          visitDate: healthBook.visitDate ? new Date(healthBook.visitDate) : null,
          nextVisitDate: healthBook.nextVisitDate ? new Date(healthBook.nextVisitDate) : null,
          medicineIds: healthBook.medicineIds || [],
          medicineName: healthBook.medicineName || "",
          isDeleted: healthBook.isDeleted || false,
          createdAt: healthBook.createdAt || "",
          bookingServiceItemId: selectedBookingService.bookingServiceItemId || "",
          bookingCode: selectedBooking ? selectedBooking.bookingCode : "N/A",
          petId: selectedPet ? selectedPet.petId : "",
          petName: selectedPet ? selectedPet.petName : "Unknown",
        }));

        setBookings([selectedBooking]);
        setTreatments(treatmentsData.data || []);
        setMedicines(medicinesData.data || []);
        setPets(petsData.data || []);
        setBookingServices(bookingServiceData.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire("Error", "Failed to load data. Please try again later.", "error");
      }
    };

    fetchData();
  }, [healthBookId]);
  useEffect(() => {
    if (visitDetails.medicineIds.length > 0 && medicines.length > 0) {
      const firstMedicine = medicines.find(med => med.medicineId === visitDetails.medicineIds[0]);
      if (firstMedicine) {
        setVisitDetails((prev) => ({ ...prev, treatmentId: firstMedicine.treatmentId }));
      }
    }
  }, [visitDetails.medicineIds, medicines]);
  useEffect(() => {
    if (visitDetails.treatmentId) {
      const relatedMedicines = medicines.filter(medicine =>
        medicine.treatmentId === visitDetails.treatmentId
      );
      setFilteredMedicines(relatedMedicines);
    } else {
      setFilteredMedicines([]);
    }
  }, [visitDetails.treatmentId, medicines]);
  useEffect(() => {
    if (visitDetails.medicineId && medicines.length > 0) {
      const selectedMedicine = medicines.find((med) => med.medicineId === visitDetails.medicineId);
      if (selectedMedicine) {
        setVisitDetails((prev) => ({ ...prev, medicineName: selectedMedicine.medicineName }));
      }
    }
  }, [visitDetails.medicineId, medicines]);
  const validateForm = () => {
    if (!visitDetails.bookingServiceItemId || !visitDetails.performBy) {
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
      bookingServiceItemId: visitDetails.bookingServiceItemId,
      medicineId: visitDetails.medicineId,
      visitDate: visitDetails.visitDate ? visitDetails.visitDate.toISOString() : null,
      nextVisitDate: visitDetails.nextVisitDate ? visitDetails.nextVisitDate.toISOString() : null,
      performBy: visitDetails.performBy,
      isDeleted: visitDetails.isDeleted,
      createdAt: visitDetails.createdAt,
      updatedAt: new Date().toISOString(),
    };

    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`http://localhost:5050/api/PetHealthBook/${healthBookId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Thêm token vào headers
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        Swal.fire("Error", errorData.message || "Failed to update data", "error");
        return;
      }

      Swal.fire("Success", "Pet health book updated successfully!", "success");
      navigate(-1);
    } catch (error) {
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
          <h2 className="mb-4 text-xl font-bold">Edit Health Book</h2>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Booking Code</label>
            <input
              type="text"
              className="w-full p-3 border rounded-md bg-gray-200 cursor-not-allowed"
              value={visitDetails.bookingCode || ""}
              disabled
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Pet Name</label>
            <input
              type="text"
              className="w-full p-3 border rounded-md bg-gray-200 cursor-not-allowed"
              value={visitDetails.petName || ""}
              disabled
            />
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
              disabled
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Next Visit Date</label>
            <DatePicker
              selected={visitDetails.nextVisitDate}
              onChange={(date) => setVisitDetails({ ...visitDetails, nextVisitDate: date })}
              dateFormat="dd/MM/yyyy"
              className="w-full p-3 border rounded-md"
              minDate={new Date()}
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Treatment</label>
            <select
              className="w-full p-3 border rounded-md mb-3"
              value={visitDetails.treatmentId || ""}
              onChange={(e) => {
                console.log("Selected Treatment ID:", e.target.value);
                setVisitDetails((prev) => ({ ...prev, treatmentId: e.target.value }));
              }}
            >
              <option value="">Select Treatment</option>
              {treatments.length > 0 ? (
                treatments.map((treatment) => (
                  <option key={treatment.treatmentId} value={treatment.treatmentId}>
                    {treatment.treatmentName}
                  </option>
                ))
              ) : (
                <option disabled>No treatments available</option>
              )}
            </select>
            <div className="border p-3 rounded-md max-h-40 overflow-y-auto">
              {filteredMedicines.map(medicine => (
                <label key={medicine.medicineId} className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    value={medicine.medicineId}
                    className="w-4 h-4"
                    checked={visitDetails.medicineIds.includes(medicine.medicineId)}
                    onChange={(e) => {
                      const selectedMedicineId = e.target.value;
                      setVisitDetails((prev) => {
                        const updatedMedicineIds = prev.medicineIds.includes(selectedMedicineId)
                          ? prev.medicineIds.filter(id => id !== selectedMedicineId)
                          : [...prev.medicineIds, selectedMedicineId];
                        return { ...prev, medicineIds: updatedMedicineIds };
                      });
                    }}
                  />
                  <span className="text-sm">{medicine.medicineName}</span>
                </label>
              ))}
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