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
  const [bookingCodeError, setBookingCodeError] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [bookingCode, setbookingCode] = useState([]);
  const [pets, setPets] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [selectedPet, setSelectedPet] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsResponse, medicinesResponse, treatmentsResponse] = await Promise.all([
          fetch("http://localhost:5201/Bookings"),
          fetch("http://localhost:5003/Medicines"),
          fetch("http://localhost:5003/api/Treatment"),
          fetch("http://localhost:5010/api/pet"),
          fetch("http://localhost:5023/api/BookingServiceItems/GetBookingServiceList"),
        ]);
        if (!bookingsResponse.ok) throw new Error("Failed to fetch bookings.");
        if (!medicinesResponse.ok) throw new Error("Failed to fetch medicines.");
        if (!treatmentsResponse.ok) throw new Error("Failed to fetch treatments.");
        const [bookingsData, medicinesData, treatmentsData] = await Promise.all([
          bookingsResponse.json(),
          medicinesResponse.json(),
          treatmentsResponse.json(),
        ]);
        console.log("Treatments API response:", treatmentsData);
        if (treatmentsData && Array.isArray(treatmentsData)) {
          setTreatments(treatmentsData);
        } else if (treatmentsData && treatmentsData.data && Array.isArray(treatmentsData.data)) {
          setTreatments(treatmentsData.data);
        } else {
          console.error("Invalid format for treatments data:", treatmentsData);
          Swal.fire("Error", "Invalid treatment data format.", "error");
        }
        setBookings(bookingsData.data || bookingsData);
        setMedicines(medicinesData.data || medicinesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire("Error", "Failed to load data. Please try again later.", "error");
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    const fetchPetsByBooking = async () => {
      if (!visitDetails.bookingId) return;
      const selectedBooking = bookings.find(
        (booking) => booking.bookingCode === visitDetails.bookingId
      );
      if (!selectedBooking) {
        setPets([]);
        return;
      }
      try {
        const response = await fetch("http://localhost:5023/api/BookingServiceItems/GetBookingServiceList");
        if (!response.ok) throw new Error("Failed to fetch booking service items.");
        const data = await response.json();
        console.log("Booking Service Items API response:", data);
        if (!data.data || !Array.isArray(data.data)) {
          console.error("Invalid data format:", data);
          return;
        }
        const petIds = data.data
          .filter(item => item.bookingId === selectedBooking.bookingId)
          .map(item => item.petId);
        if (petIds.length === 0) {
          setPets([]);
          return;
        }
        const petResponses = await Promise.all(
          petIds.map(petId => fetch(`http://localhost:5010/api/pet/${petId}`)));
        const petDetails = await Promise.all(petResponses.map(res => res.json()));
        console.log("Pet details from API:", petDetails);
        const formattedPets = petDetails.map(pet => ({
          petId: pet.data.petId,
          petName: pet.data.petName || "No Name",
        }));
        setPets(formattedPets);
      } catch (error) {
        console.error("Error fetching pets:", error);
        setPets([]);
      }
    };
    fetchPetsByBooking();
  }, [visitDetails.bookingId, bookings]);
  const generateGuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  const handleBookingCodeChange = (e) => {
    const inputCode = e.target.value;
    setVisitDetails({ ...visitDetails, bookingId: inputCode });
    const selectedBooking = bookings.find((booking) => booking.bookingCode === inputCode);
    if (!selectedBooking) {
      setBookingCodeError("Incorrect Booking Code. Please check again!");
    } else {
      setBookingCodeError("");
    }
  };
  const currentDate = new Date().toISOString();
  const handleCreate = async () => {
    const selectedBooking = bookings.find(
      (booking) => booking.bookingCode === visitDetails.bookingId
    );
    if (!selectedBooking) {
      Swal.fire("Error", "Invalid Booking Code. Please check again.", "error");
      return;
    }
    try {
      const response = await fetch("http://localhost:5023/api/BookingServiceItems/GetBookingServiceList");
      if (!response.ok) throw new Error("Failed to fetch booking service items.");
      const bookingServiceData = await response.json();
      console.log("Booking Service Items API response:", bookingServiceData);
      const matchingServiceItem = bookingServiceData.data.find(
        item => item.bookingId === selectedBooking.bookingId && item.petId === selectedPet
      );
      
      if (!matchingServiceItem) {
        Swal.fire("Error", "No matching Booking Service Item found.", "error");
        return;
      }
      if (!visitDetails.medicineId.length || !visitDetails.visitDate || !visitDetails.performBy) {
        Swal.fire("Error", "Please fill all required fields", "error");
        return;
      }
      const newVisitDetails = {
        bookingId: selectedBooking.bookingId,
        bookingServiceItemId: matchingServiceItem.bookingServiceItemId,
        medicineIds: visitDetails.medicineId,
        visitDate: visitDetails.visitDate ? visitDetails.visitDate.toISOString() : null,
        nextVisitDate: visitDetails.nextVisitDate ? visitDetails.nextVisitDate.toISOString() : null,
        performBy: visitDetails.performBy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: visitDetails.isDeleted || false,
      };
      console.log("Data sent to API:", newVisitDetails);
      const createResponse = await fetch("http://localhost:5003/api/PetHealthBook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVisitDetails),
      });
      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        console.error("Error response from API:", errorData);
        Swal.fire("Error", errorData.message || "Failed to create data", "error");
      } else {
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
      console.error("Error creating health book:", error);
      Swal.fire("Error", "Failed to create data. Please try again later.", "error");
    }
  };


  const [filteredMedicines, setFilteredMedicines] = useState([]);
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
          <h2 className="mb-4 text-xl font-bold">Create Health Book</h2>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Booking Code</label>
            <input
              type="text"
              className="w-full p-3 border rounded-md"
              value={visitDetails.bookingId}
              onChange={handleBookingCodeChange}
              placeholder="Enter Booking Code"
            />
            {bookingCodeError && <p className="text-red-500 text-sm mt-1">{bookingCodeError}</p>}
          </div>

          {pets.length > 0 && (
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Pets</label>
              <select
                className="w-full p-3 border rounded-md"
                value={selectedPet}
                onChange={(e) => setSelectedPet(e.target.value)}
              >
                <option value="">Select Pet</option>
                {pets.map((pet) => (
                  <option key={pet.petId} value={pet.petId}>
                    {pet.petName}
                  </option>
                ))}
              </select>
            </div>
          )}
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
            <label className="block text-sm font-medium mb-1">Treatment</label>
            <select
              className="w-full p-3 border rounded-md"
              value={visitDetails.treatmentId}
              onChange={(e) => setVisitDetails({ ...visitDetails, treatmentId: e.target.value })}
            >
              <option value="">Select Treatment</option>
              {treatments.map((treatment) => (
                <option key={treatment.treatmentId} value={treatment.treatmentId}>
                  {treatment.treatmentName || treatment.name}
                </option>
              ))}
            </select>
          </div>

          {visitDetails.treatmentId && (
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Medicine</label>
              <div className="space-y-2">
                {filteredMedicines.length > 0 ? (
                  filteredMedicines.map((medicine) => (
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
                  ))
                ) : (
                  <p>No medicines available for the selected treatment.</p>
                )}
              </div>
            </div>
          )}
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