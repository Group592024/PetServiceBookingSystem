import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";
import Swal from "sweetalert2";
import NavbarCustomer from "../../../components/navbar-customer/NavbarCustomer";

const PetHealthBookDetailCus = () => {
    const sidebarRef = useRef(null);
    const [pets, setPets] = useState([]);
    const [petImage, setPetImage] = useState("");
    const [petName, setPetName] = useState("");
    const [dateOfBirth, setdateOfBirth] = useState("");
    const navigate = useNavigate();
    const { healthBookId } = useParams();
    const [petHealthBook, setPetHealthBook] = useState(null);
    const [medicines, setMedicines] = useState([]);
    const [treatments, setTreatments] = useState([]);
    const [bookings, setBookings] = useState([]);
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };
    useEffect(() => {
        const fetchData = async () => {
              try {
                console.log("Fetching Pet Health Book Data...");
                const [healthBookRes, medicinesRes, treatmentsRes, bookingsRes, petsRes] = await Promise.all([
                  fetch(`http://localhost:5003/api/PetHealthBook/${healthBookId}`),
                  fetch(`http://localhost:5003/Medicines`),
                  fetch(`http://localhost:5003/api/Treatment`),
                  fetch(`http://localhost:5201/Bookings`),
                  fetch(`http://localhost:5010/api/pet`),
                ]);
        
                if (!healthBookRes.ok || !medicinesRes.ok || !treatmentsRes.ok || !bookingsRes.ok || !petsRes.ok) {
                  throw new Error("Failed to fetch some data.");
                }
        
                const [healthBookData, medicinesData, treatmentsData, bookingsData, petsData] = await Promise.all([
                  healthBookRes.json(),
                  medicinesRes.json(),
                  treatmentsRes.json(),
                  bookingsRes.json(),
                  petsRes.json(),
                ]);
        
                console.log("Pet Health Book Data:", healthBookData);
        
                setPetHealthBook(healthBookData.data || {});
                setMedicines(medicinesData.data || []);
                setTreatments(treatmentsData.data || []);
                setBookings(bookingsData.data || []);
                setPets(petsData.data || []);
                if (!healthBookData.data?.bookingId) return;
                const booking = bookingsData.data.find((b) => b.bookingId === healthBookData.data.bookingId);
                if (!booking) return;
                const pet = petsData.data.find((p) => p.accountId === booking.accountId);
                if (pet) {
                  setPetImage(pet.petImage);
                  setPetName(pet.petName);
                  setdateOfBirth(pet.dateOfBirth);
                }
        
              } catch (error) {
                console.error("Error fetching data:", error);
                Swal.fire("Error", "Failed to load data. Please try again later.", "error");
              }
            };


        fetchData();
    }, [healthBookId]);

    const handleBack = () => {
        navigate(-1);
    };
    if (!petHealthBook) {
        return <div>Loading...</div>;
    }
    const {
        performBy,
        visitDate,
        nextVisitDate,
    } = petHealthBook;
    const medicineIds = petHealthBook?.medicineIds || [];
    const selectedMedicines = medicines.filter((m) => medicineIds.includes(m.medicineId));
    const medicineNames = selectedMedicines.map((m) => m.medicineName).join(", ") || "No Medicines Assigned";


    const treatmentIds = [...new Set(selectedMedicines.map((m) => m.treatmentId))]; // Lấy danh sách treatmentId duy nhất
    const assignedTreatments = treatments.filter((t) => treatmentIds.includes(t.treatmentId));
    const treatmentNames = assignedTreatments.length > 0
        ? assignedTreatments.map((t) => t.treatmentName).join(", ")
        : "No Treatments Assigned";
    const bookingAccount = bookings.find((b) => b.id === healthBookId);
    return (
        <div className="flex h-screen bg-dark-grey-100 overflow-x-hidden">
            <div className="overflow-y-auto w-full">
                <NavbarCustomer />
                <div className="p-6 bg-white shadow-md rounded-md w-full">
                    <h2 className="mb-4 text-xl font-bold text-left">Health Book Detail</h2>
                    <div className="flex justify-center
 flex-wrap gap-8 w-full">
                        {/* Left Column */}
                        <div className="w-full sm:w-1/3 md:w-1/4 bg-white shadow-md rounded-md p-6 flex flex-col items-center">
                            <div className="flex flex-col items-center">
                                <img
                                    src={petImage ? `http://localhost:5010${petImage}` : '/Images/default-image.png'}
                                    alt="Pet Health Record"
                                    className="w-[300px] h-[300px] object-cover rounded-lg shadow-lg"
                                />

                                <div className="mt-4 text-sm font-bold">{petName}</div>
                                {/* <div className="mt-4 text-sm ">{petGender || "Male"}</div> */}
                                <div className="mt-4 text-sm ">{formatDate(dateOfBirth)}</div>
                            </div>
                        </div>
                        <div className="w-full sm:w-2/3 bg-white shadow-md rounded-md p-6">
                            <form>
                                <div className="mb-3">
                                    <label className="block text-sm  mb-1 font-bold">Treatment</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border rounded-md"
                                        value={treatmentNames}
                                        disabled
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="block text-sm  mb-1 font-bold">Performed By</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border rounded-md"
                                        value={performBy || ""}
                                        disabled
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="block text-sm  mb-1 font-bold">Visit Date</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border rounded-md"
                                        value={formatDate(visitDate)}
                                        disabled
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="block text-sm  mb-1 font-bold">Next Visit Date</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border rounded-md"
                                        value={formatDate(nextVisitDate)}
                                        disabled
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="block text-sm mb-1 font-bold">Medicine</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 border rounded-md"
                                        value={medicineNames}
                                        disabled
                                    />
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="bg-gray-600 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700"
                        >
                            Back
                        </button>
                    </div>
                </div>

            </div>

        </div>
    );
};
export default PetHealthBookDetailCus;
