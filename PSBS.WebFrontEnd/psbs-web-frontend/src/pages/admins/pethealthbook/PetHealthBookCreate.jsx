import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";
import jwtDecode from "jwt-decode";

const PetHealthBookCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = sessionStorage.getItem("token");
  const sidebarRef = useRef(null);
  const bookingCodeFromUrl = searchParams.get("bookingCode");
  const petIdsFromUrl = searchParams.get("petIds");

  const [visitDetails, setVisitDetails] = useState({
    healthBookId: "",
    bookingId: "",
    medicineId: [],
    visitDate: new Date(),
    nextVisitDate: null,
    performBy: "",
    createdAt: "",
    updatedAt: "",
    isDeleted: false,
  });
  const [bookings, setBookings] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [pets, setPets] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [selectedPet, setSelectedPet] = useState("");
  const [filteredMedicines, setFilteredMedicines] = useState([]);

  useEffect(() => {
    if (bookingCodeFromUrl) {
      setVisitDetails((prevState) => ({
        ...prevState,
        bookingId: bookingCodeFromUrl,
      }));
    }
  }, [bookingCodeFromUrl]);

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const nameClaim = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
        if (nameClaim) {
          setVisitDetails((prevState) => ({
            ...prevState,
            performBy: nameClaim,
          }));
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, [token]);

  useEffect(() => {
    const accountName = sessionStorage.getItem("accountName");
    if (accountName) {
      setVisitDetails((prevState) => ({
        ...prevState,
        performBy: accountName,
      }));
    }
  }, []);

  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        const response = await fetch("http://localhost:5050/api/Treatment", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch treatments");
        const data = await response.json();
        setTreatments(data.data || []);
      } catch (error) {
        console.error("Error fetching treatments:", error);
      }
    };

    fetchTreatments();
  }, [token]);
  useEffect(() => {
    fetch("http://localhost:5050/Bookings", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setBookings(data.data || []))
      .catch((error) => console.error("Error fetching bookings:", error));
  }, [token]);

  useEffect(() => {
    if (bookingCodeFromUrl) {
      setVisitDetails((prevState) => ({
        ...prevState,
        bookingId: bookingCodeFromUrl,

      }));
      console.log("Pet details from API:", bookingCodeFromUrl);
    }
  }, [bookingCodeFromUrl]);
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await fetch("http://localhost:5050/Medicines", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch medicines");
        const data = await response.json();
        setMedicines(data.data || []);
      } catch (error) {
        console.error("Error fetching medicines:", error);
      }
    };

    fetchMedicines();
  }, [token]);

  useEffect(() => {
    const fetchPetsFromQuery = async () => {
      if (!petIdsFromUrl) return;
      const petIdArray = petIdsFromUrl.split(",").filter((id) => id);
      try {
        const petResponses = await Promise.all(
          petIdArray.map((petId) =>
            fetch(`http://localhost:5050/api/pet/${petId}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            })
          )
        );
        const petDetails = await Promise.all(petResponses.map((res) => res.json()));
        console.log("Pet details from API:", petDetails);
        const formattedPets = petDetails.map((pet) => ({
          petId: pet.data.petId,
          petName: pet.data.petName || "No Name",
        }));
        setPets(formattedPets);
        if (formattedPets.length === 1) {
          setSelectedPet(formattedPets[0].petId);
        }
      } catch (error) {
        console.error("Error fetching pets:", error);
        setPets([]);
      }
    };

    fetchPetsFromQuery();
  }, [petIdsFromUrl, token]);

  const handleCreate = async () => {
    try {
      // Fetch bookings to validate the bookingCode
      const bookingsResponse = await fetch("http://localhost:5050/Bookings", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!bookingsResponse.ok) throw new Error("Failed to fetch bookings.");
      const bookingsData = await bookingsResponse.json();
      const bookingsList = bookingsData.data || [];

      // Find the bookingId that matches the provided bookingCode
      const matchingBooking = bookingsList.find(
        (booking) => booking.bookingCode === visitDetails.bookingId
      );

      if (!matchingBooking) {
        Swal.fire(
          "Error",
          `No matching Booking found for Booking Code: ${visitDetails.bookingId}`,
          "error"
        );
        return;
      }

      // Fetch booking service items to validate the bookingServiceItemId
      const serviceResponse = await fetch(
        "http://localhost:5050/api/BookingServiceItems/GetBookingServiceList",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!serviceResponse.ok) throw new Error("Failed to fetch booking service items.");
      const bookingServiceData = await serviceResponse.json();

      // Find the matching booking service item
      const matchingServiceItem = bookingServiceData.data.find(
        (item) => item.bookingId === matchingBooking.bookingId && item.petId === selectedPet
      );

      if (!matchingServiceItem) {
        Swal.fire(
          "Error",
          `No matching Booking Service Item found for Booking ID: ${matchingBooking.bookingId} and Pet ID: ${selectedPet}`,
          "error"
        );
        return;
      }

      // Validate required fields
      if (!visitDetails.medicineId.length || !visitDetails.visitDate || !visitDetails.performBy) {
        Swal.fire("Error", "Please fill all required fields", "error");
        return;
      }

      // Prepare data for creation with timezone adjustment for nextVisitDate
      let nextVisitDateISOString = null;
      if (visitDetails.nextVisitDate) {
        // Create a date string that preserves the local date
        const nextVisitDate = new Date(visitDetails.nextVisitDate);
        const year = nextVisitDate.getFullYear();
        const month = nextVisitDate.getMonth();
        const day = nextVisitDate.getDate();

        // Create a new date at noon to avoid timezone issues
        const adjustedDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
        nextVisitDateISOString = adjustedDate.toISOString();
      }

      const newVisitDetails = {
        bookingId: matchingBooking.bookingId,
        bookingServiceItemId: matchingServiceItem.bookingServiceItemId,
        medicineIds: visitDetails.medicineId,
        visitDate: visitDetails.visitDate ? new Date(visitDetails.visitDate).toISOString() : null,
        nextVisitDate: nextVisitDateISOString,
        performBy: visitDetails.performBy || sessionStorage.getItem("accountName"),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: visitDetails.isDeleted || false,
      };

      console.log("Data sent to API:", newVisitDetails);

      // Send the create request
      const createResponse = await fetch("http://localhost:5050/api/PetHealthBook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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

  useEffect(() => {
    if (visitDetails.treatmentId) {
      const relatedMedicines = medicines.filter(
        (medicine) => medicine.treatmentId === visitDetails.treatmentId
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
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <main className="p-4 bg-white shadow-md rounded-md h-full">
          <h2 className="mb-4 text-xl font-bold">Create Health Book</h2>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Booking Code</label>
            <input
              type="text"
              className="w-full p-3 border rounded-md"
              value={visitDetails.bookingId}
              placeholder="Enter Booking Code"
              disabled
            />
          </div>
          {pets.length > 0 && (
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Pet</label>
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
              onChange={(e) =>
                setVisitDetails({ ...visitDetails, performBy: e.target.value })
              }
              disabled
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Visit Date</label>
            <DatePicker
              selected={visitDetails.visitDate}
              onChange={(date) =>
                setVisitDetails({ ...visitDetails, visitDate: date })
              }
              dateFormat="dd/MM/yyyy"
              className="w-full p-3 border rounded-md"
              disabled
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Next Visit Date</label>
            <DatePicker
              selected={visitDetails.nextVisitDate}
              onChange={(date) =>
                setVisitDetails({ ...visitDetails, nextVisitDate: date })
              }
              dateFormat="dd/MM/yyyy"
              className="w-full p-3 border rounded-md"
              minDate={new Date()}
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Treatment</label>
            <select
              className="w-full p-3 border rounded-md"
              value={visitDetails.treatmentId}
              onChange={(e) =>
                setVisitDetails({ ...visitDetails, treatmentId: e.target.value })
              }
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
                        checked={visitDetails.medicineId.includes(
                          medicine.medicineId
                        )}
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
