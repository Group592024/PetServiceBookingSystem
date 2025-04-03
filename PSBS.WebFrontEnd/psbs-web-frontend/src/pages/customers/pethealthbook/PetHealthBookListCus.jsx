import React, { useEffect, useState, useCallback } from "react";
import { IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Swal from "sweetalert2";
import { Link, useParams } from "react-router-dom";
import NavbarCustomer from "../../../components/navbar-customer/NavbarCustomer";
import moment from "moment";

const PetHealthBookListCus = () => {
  const { petId: routePetId } = useParams();
  const [userPets, setUserPets] = useState([]);
  const [petHealthBooks, setPetHealthBooks] = useState([]);
  const [bookingServiceItemToPetMap, setBookingServiceItemToPetMap] = useState({});
  const [medicines, setMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const token = sessionStorage.getItem("token");

  const fetchPetHealthBooks = useCallback(async () => {
    try {
      const accountId = sessionStorage.getItem("accountId");
      const token = sessionStorage.getItem("token");
      if (!accountId) throw new Error("No accountId found in sessionStorage");
      if (!token) throw new Error("No token found in sessionStorage");

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      const [petHealthRes, medicinesRes, bookingServiceItemsRes, petsRes] = await Promise.all([
        fetch("http://localhost:5050/api/PetHealthBook", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("http://localhost:5050/Medicines", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("http://localhost:5050/api/BookingServiceItems/GetBookingServiceList", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("http://localhost:5050/api/pet", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (!petHealthRes.ok) throw new Error(`Failed to fetch PetHealthBook: ${petHealthRes.status}`);
      if (!medicinesRes.ok) throw new Error(`Failed to fetch Medicines: ${medicinesRes.status}`);
      if (!bookingServiceItemsRes.ok) throw new Error(`Failed to fetch BookingServiceItems: ${bookingServiceItemsRes.status}`);
      if (!petsRes.ok) throw new Error(`Failed to fetch Pet: ${petsRes.status}`);

      const petHealthData = await petHealthRes.json();
      const medicinesData = await medicinesRes.json();
      const bookingServiceItemsData = await bookingServiceItemsRes.json();
      const petsData = await petsRes.json();

      const petHealthArray = Array.isArray(petHealthData.data) ? petHealthData.data : [];
      const medicinesArray = Array.isArray(medicinesData.data) ? medicinesData.data : [];
      const petsArray = Array.isArray(petsData.data) ? petsData.data : [];
      const bookingServiceItemsArray = Array.isArray(bookingServiceItemsData.data)
        ? bookingServiceItemsData.data
        : [];
      const filteredUserPets = petsArray.filter((pet) => pet.accountId === accountId);
      setUserPets(filteredUserPets);
      setPetHealthBooks(petHealthArray);
      setMedicines(medicinesArray);
      const mapping = {};
      bookingServiceItemsArray.forEach((item) => {
        if (item.bookingServiceItemId && item.petId) {
          mapping[item.bookingServiceItemId] = item.petId;
        }
      });
      setBookingServiceItemToPetMap(mapping);
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  }, []);


  useEffect(() => {
    fetchPetHealthBooks();
  }, [fetchPetHealthBooks]);

  const filteredUserPets = userPets.filter((pet) => {
    if (routePetId) {
      return pet.petId.toString() === routePetId;
    }
    const query = searchQuery.toLowerCase();
    return !searchQuery || pet.petName.toLowerCase().includes(query);
  });

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    if (!isNaN(dateString)) {
      return moment.unix(dateString).format("DD/MM/YYYY");
    }
    const date = moment(dateString, moment.ISO_8601, true);
    if (date.isValid()) return date.format("DD/MM/YYYY");
    const altDate = moment(dateString, "YYYY-MM-DD", true);
    return altDate.isValid() ? altDate.format("DD/MM/YYYY") : "Invalid Date";
  };

  return (
    <div className="flex h-screen bg-white">
      <div className="w-full">
        <NavbarCustomer />
        <main className="flex-1 p-4">
          <h2 className="mb-4 text-xl font-bold">Health Book List</h2>
          {!routePetId && (
            <div className="mb-4">
              <input
                type="search"
                placeholder="Search Pets..."
                className="p-2 border border-gray-300 rounded"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          <div className="flex flex-col gap-6">
            {filteredUserPets.length > 0 ? (
              filteredUserPets.map((pet) => {
                const petHealthRecords = petHealthBooks.filter(
                  (health) => bookingServiceItemToPetMap[health.bookingServiceItemId] === pet.petId
                );
                return (
                  <form
                    key={pet.petId}
                    className="flex gap-8 bg-white shadow-md rounded-md p-6"
                  >
                    <div className="w-1/3 flex flex-col items-center">
                    <div className="flex flex-col items-center">
                        {pet.petImage ? (
                          <img
                          src={`http://localhost:5050/pet-service${pet.petImage}`}
                          alt={pet.petName || "Pet Image"}
                          className="w-[300px] h-[300px] object-cover rounded-lg shadow-lg transition-transform duration-300 hover:scale-110"
                        />
                        
                        ) : (
                          <span className="text-gray-500">No Image</span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold">{pet.petName}</h3>
                      <p className="text-sm text-gray-600">{formatDate(pet.dateOfBirth)}</p>
                    </div>
                    <div className="w-2/3 flex flex-col gap-2">
                      {petHealthRecords.length > 0 ? (
                        petHealthRecords.map((health) => {
                          const medicineIds = Array.isArray(health.medicineIds) ? health.medicineIds : [];
                          const relevantMedicines = medicines.filter((m) => medicineIds.includes(m.medicineId));
                          const medicineNames =
                            relevantMedicines.length > 0
                              ? relevantMedicines.map((m) => m.medicineName).join(", ")
                              : "No Medicine";
                          const isDone = moment(health.nextVisitDate).isSameOrBefore(moment(), "day");
                          const status = isDone ? "Done" : "Pending";
                          const statusColor = isDone ? "text-green-500" : "text-red-500";

                          return (
                            <div
                              key={health.healthBookId}
                              className="flex justify-between items-center bg-gray-600 shadow-md rounded-md p-4"
                            >
                              <div className="text-sm text-white truncate w-1/5">{medicineNames}</div>
                              <div className="text-sm text-white truncate w-1/5">{health.performBy}</div>
                              <div className="text-sm text-white truncate w-1/5">
                                {moment(health.nextVisitDate).format("DD/MM/YYYY")}
                              </div>
                              <div className={`text-sm font-semibold w-1/5 ${statusColor}`}>{status}</div>
                              <div className="flex items-center">
                                <Link to={`/detailcus/${health.healthBookId}`}>
                                  <IconButton
                                    sx={{
                                      width: 24,
                                      height: 24,
                                      borderRadius: "50%",
                                      border: "2px solid black",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "12px",
                                      fontWeight: "bold",
                                      color: "black",
                                    }}
                                  >
                                    !
                                  </IconButton>
                                </Link>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-gray-600">No Health Book Records</p>
                      )}
                    </div>

                  </form>
                );
              })
            ) : (
              <p className="text-gray-500">No Pets Found</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PetHealthBookListCus;
