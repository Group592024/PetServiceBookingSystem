import React, { useEffect, useState, useCallback } from "react";
import { IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Swal from "sweetalert2";
import { useNavigate, Link, useParams } from "react-router-dom";
import NavbarCustomer from "../../../components/navbar-customer/NavbarCustomer";
import moment from "moment";

const PetHealthBookListCus = () => {
  const { petId: routePetId } = useParams();
  const [userPets, setUserPets] = useState([]);
  const navigate = useNavigate();
  const [petHealthBooks, setPetHealthBooks] = useState([]);
  const [bookingServiceItemToPetMap, setBookingServiceItemToPetMap] = useState({});
  const [medicines, setMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
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
          headers,
        }),
        fetch("http://localhost:5050/Medicines", {
          method: "GET",
          headers,
        }),
        fetch("http://localhost:5050/api/BookingServiceItems/GetBookingServiceList", {
          method: "GET",
          headers,
        }),
        fetch("http://localhost:5050/api/pet", {
          method: "GET",
          headers,
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

  const handleBack = () => {
    navigate(-1);
  };

  const filteredUserPets = userPets.filter((pet) => {
    if (routePetId) {
      return pet.petId.toString() === routePetId;
    }
    const query = searchQuery.toLowerCase();
    return !searchQuery || pet.petName.toLowerCase().includes(query);
  });

  // Sort pets based on their next visit date
  const sortedUserPets = [...filteredUserPets].sort((petA, petB) => {
    const petAHealthRecords = petHealthBooks.filter(
      (health) => bookingServiceItemToPetMap[health.bookingServiceItemId] === petA.petId
    );
    const petBHealthRecords = petHealthBooks.filter(
      (health) => bookingServiceItemToPetMap[health.bookingServiceItemId] === petB.petId
    );

    const petANextVisitDates = petAHealthRecords.map(record => new Date(record.nextVisitDate));
    const petBNextVisitDates = petBHealthRecords.map(record => new Date(record.nextVisitDate));

    const earliestDateA = petANextVisitDates.length > 0 ?
      new Date(Math.min(...petANextVisitDates)) :
      new Date(8640000000000000); // Far future date if no records

    const earliestDateB = petBNextVisitDates.length > 0 ?
      new Date(Math.min(...petBNextVisitDates)) :
      new Date(8640000000000000); // Far future date if no records

    return sortOrder === "asc"
      ? earliestDateA - earliestDateB
      : earliestDateB - earliestDateA;
  });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

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
    <div className="min-h-screen bg-gray-50">
      <NavbarCustomer />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">My Pet Health Book List</h1>
                <p className="text-sm sm:text-base text-gray-600">View health records for all your pets</p>
              </div>

              <div className="flex items-center gap-3 mt-4 sm:mt-0">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  <span>Back</span>
                </button>
              </div>
            </div>
          </header>
          <div className="grid gap-8">
            {sortedUserPets.length > 0 ? (
              sortedUserPets.map((pet) => {
                const petHealthRecords = petHealthBooks.filter(
                  (health) => bookingServiceItemToPetMap[health.bookingServiceItemId] === pet.petId
                );

                // Sort health records by next visit date
                const sortedHealthRecords = [...petHealthRecords].sort((a, b) => {
                  return sortOrder === "asc"
                    ? new Date(a.nextVisitDate) - new Date(b.nextVisitDate)
                    : new Date(b.nextVisitDate) - new Date(a.nextVisitDate);
                });

                return (
                  <div key={pet.petId} className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row gap-8">
                        {/* Pet Information Section */}
                        <div className="md:w-1/3 flex flex-col items-center">
                          <div className="mb-4 w-full max-w-[250px] aspect-square overflow-hidden rounded-lg shadow-lg">
                            {pet.petImage ? (
                              <img
                                src={`http://localhost:5050/pet-service${pet.petImage}`}
                                alt={pet.petName || "Pet Image"}
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                                No Image Available
                              </div>
                            )}
                          </div>
                          <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-800">{pet.petName}</h3>
                            <p className="text-sm text-gray-600 mt-1">Born: {formatDate(pet.dateOfBirth)}</p>
                          </div>
                        </div>

                        {/* Health Records Section */}
                        <div className="md:w-2/3">
                          <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h4 className="text-lg font-semibold text-gray-700">Health Records</h4>
                            <span className="text-sm text-gray-500">
                              {sortedHealthRecords.length} {sortedHealthRecords.length === 1 ? 'record' : 'records'}
                            </span>
                          </div>

                          {sortedHealthRecords.length > 0 ? (
                            <div className="space-y-3">
                              {sortedHealthRecords.map((health) => {
                                const medicineIds = Array.isArray(health.medicineIds) ? health.medicineIds : [];
                                const relevantMedicines = medicines.filter((m) => medicineIds.includes(m.medicineId));
                                const medicineNames = relevantMedicines.length > 0
                                  ? relevantMedicines.map((m) => m.medicineName).join(", ")
                                  : "No Medicine";

                                const isDone = moment(health.nextVisitDate).isSameOrBefore(moment(), "day");
                                const status = isDone ? "Done" : "Pending";
                                const statusColor = isDone ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800";

                                // Calculate days until next visit
                                const daysUntilNextVisit = moment(health.nextVisitDate).diff(moment(), 'days');
                                let urgencyIndicator = "";

                                if (!isDone) {
                                  if (daysUntilNextVisit <= 3) {
                                    urgencyIndicator = "border-l-4 border-red-500";
                                  } else if (daysUntilNextVisit <= 7) {
                                    urgencyIndicator = "border-l-4 border-orange-400";
                                  }
                                }

                                return (
                                  <div
                                    key={health.healthBookId}
                                    className={`bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow ${urgencyIndicator}`}
                                  >
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                      <div className="md:col-span-1">
                                        <div className="text-sm font-medium text-gray-500">Medicine</div>
                                        <div className="text-gray-900">{medicineNames}</div>
                                      </div>
                                      <div className="md:col-span-1">
                                        <div className="text-sm font-medium text-gray-500">Performed By</div>
                                        <div className="text-gray-900">{health.performBy}</div>
                                      </div>
                                      <div className="md:col-span-1">
                                        <div className="text-sm font-medium text-gray-500">Visit Date</div>
                                        <div className="text-gray-900">
                                          {moment(health.visitDate).format("DD/MM/YYYY")}
                                        </div>
                                      </div>
                                      <div className="md:col-span-1">
                                        <div className="text-sm font-medium text-gray-500">Next Visit</div>
                                        <div className="text-gray-900">
                                          {moment(health.nextVisitDate).format("DD/MM/YYYY")}
                                          {!isDone && daysUntilNextVisit <= 7 && (
                                            <span className={`ml-2 text-xs font-medium ${daysUntilNextVisit <= 3 ? 'text-red-600' : 'text-orange-500'}`}>
                                              {daysUntilNextVisit <= 0
                                                ? 'Tomorrow!'
                                                : `${daysUntilNextVisit} day${daysUntilNextVisit !== 1 ? 's' : ''}`}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="md:col-span-1 flex justify-between items-center">
                                        <div>
                                          <div className="text-sm font-medium text-gray-500">Status</div>
                                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                                            {status}
                                          </span>
                                        </div>
                                        <Link
                                          to={`/detailcus/${health.healthBookId}`}
                                          className="inline-flex items-center justify-center p-2 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                                        >
                                          <VisibilityIcon fontSize="small" />
                                          <span className="sr-only">View details</span>
                                        </Link>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                              <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                              </svg>
                              <p>No Health Records Available</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl shadow-md">
                <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Pets Found</h3>
                <p className="text-gray-500">No pets match your search criteria or no pets are available for your account.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PetHealthBookListCus;
