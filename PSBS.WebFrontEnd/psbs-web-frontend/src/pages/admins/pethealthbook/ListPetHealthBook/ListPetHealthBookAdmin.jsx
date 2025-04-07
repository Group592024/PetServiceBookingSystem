import React, { useEffect, useState, useRef, useCallback } from "react";
import { IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Swal from "sweetalert2";
import { Link, useParams } from "react-router-dom";
import Navbar from "../../../../components/navbar/Navbar";
import Sidebar from "../../../../components/sidebar/Sidebar";
import moment from "moment";

const PetHealthBookListAdmin = () => {
    const { petId: routePetId, accountId: routeAccountId } = useParams();
    const [userPets, setUserPets] = useState([]);
    const [petHealthBooks, setPetHealthBooks] = useState([]);
    const [bookingServiceItemToPetMap, setBookingServiceItemToPetMap] = useState({});
    const [medicines, setMedicines] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const token = sessionStorage.getItem("token");
    const sidebarRef = useRef(null);
    const [sortBy, setSortBy] = useState("nextVisitDate");
    const [sortOrder, setSortOrder] = useState("asc");

    const fetchPetHealthBooks = useCallback(async () => {
        try {
            const accountId = routeAccountId;
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
    }, [routeAccountId]);

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
            new Date(8640000000000000);

        const earliestDateB = petBNextVisitDates.length > 0 ?
            new Date(Math.min(...petBNextVisitDates)) :
            new Date(8640000000000000);

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
        <div className="min-h-screen flex flex-col">
            <Sidebar ref={sidebarRef} />
            <div className="content flex-1 overflow-hidden">
                <Navbar sidebarRef={sidebarRef} />
                <main className="flex-1 overflow-y-auto">
                    <div className="listContainer">
                        <div className="flex-1 overflow-auto p-6">
                            <div className="max-w-7xl mx-auto">
                                <header className="mb-8">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Pet Health Book List</h1>
                                            <p className="text-gray-600">View and manage health book for all pets</p>
                                        </div>

                                        {/* Sort button moved to the right */}
                                        <div className="flex items-center">
                                            <button
                                                onClick={toggleSortOrder}
                                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                                            >
                                                <span>Sort by Next Visit</span>
                                                {sortOrder === "asc" ? (
                                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path>
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"></path>
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {!routePetId && (
                                        <div className="mt-4">
                                            <div className="relative max-w-md">
                                                <input
                                                    type="search"
                                                    placeholder="Search pets by name..."
                                                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                                <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
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
                                                                                                            : `${daysUntilNextVisit} day${daysUntilNextVisit !== 1 ? 's' : ''} left`}
                                                                                                    </span>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="md:col-span-1 pl-7">
                                                                                            <div className="text-sm font-medium text-gray-500">Status</div>
                                                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                                                                                                {status}
                                                                                            </span>
                                                                                        </div>
                                                                                        <div className="md:col-span-1 flex justify-end">
                                                                                            <Link
                                                                                                to={`/pethealthbook/detail/${health.healthBookId}`}
                                                                                                className="inline-flex items-center justify-center p-2 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                                                                                            >
                                                                                                <VisibilityIcon fontSize="small" />
                                                                                                <span className="ml-1 text-sm">View</span>
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
                                            <p className="text-gray-500">No pets match your search criteria or no pets are available for this account.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PetHealthBookListAdmin;
