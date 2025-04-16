import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import NavbarCustomer from "../../../components/navbar-customer/NavbarCustomer";

const PetHealthBookDetailCus = () => {
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();
  const { healthBookId } = useParams();
  const [petHealthBook, setPetHealthBook] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [bookingServiceItems, setBookingServiceItems] = useState([]);
  const [pets, setPets] = useState([]);
  const [petImage, setPetImage] = useState("");
  const [petName, setPetName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(true);

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
        setLoading(true);
        console.log("Fetching Pet Health Book Data...");
        const token = sessionStorage.getItem("token");
        const [
          healthBookRes,
          medicinesRes,
          treatmentsRes,
          bookingServiceItemsRes,
          petsRes,
        ] = await Promise.all([
          fetch(`http://localhost:5050/api/PetHealthBook/${healthBookId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`http://localhost:5050/Medicines`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`http://localhost:5050/api/Treatment`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`http://localhost:5050/api/BookingServiceItems/GetBookingServiceList`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`http://localhost:5050/api/pet`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (
          !healthBookRes.ok ||
          !medicinesRes.ok ||
          !treatmentsRes.ok ||
          !bookingServiceItemsRes.ok ||
          !petsRes.ok
        ) {
          throw new Error("Failed to fetch some data.");
        }

        const [
          healthBookData,
          medicinesData,
          treatmentsData,
          bookingServiceItemsData,
          petsData,
        ] = await Promise.all([
          healthBookRes.json(),
          medicinesRes.json(),
          treatmentsRes.json(),
          bookingServiceItemsRes.json(),
          petsRes.json(),
        ]);

        console.log("Pet Health Book Data:", healthBookData);
        setPetHealthBook(healthBookData.data || {});
        setMedicines(medicinesData.data || []);
        setTreatments(treatmentsData.data || []);
        setBookingServiceItems(bookingServiceItemsData.data || []);
        setPets(petsData.data || []);

        const currentHealthBook = healthBookData.data;
        if (!currentHealthBook?.bookingServiceItemId) return;

        const matchedServiceItem = (bookingServiceItemsData.data || []).find(
          (item) => item.bookingServiceItemId === currentHealthBook.bookingServiceItemId
        );
        if (!matchedServiceItem?.petId) return;

        const matchedPet = (petsData.data || []).find(
          (p) => p.petId === matchedServiceItem.petId
        );
        if (matchedPet) {
          setPetImage(matchedPet.petImage || "");
          setPetName(matchedPet.petName || "No Name");
          setDateOfBirth(matchedPet.dateOfBirth || "");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire("Error", "Failed to load data. Please try again later.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [healthBookId]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="w-full">
          <NavbarCustomer />
          <div className="flex items-center justify-center h-[calc(100vh-64px)]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-lg text-gray-700">Loading health record...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!petHealthBook) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="w-full">
          <NavbarCustomer />
          <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)]">
            <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Record Not Found</h3>
            <p className="text-gray-500 mb-6">The health record you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { performBy, visitDate, nextVisitDate, medicineIds } = petHealthBook;
  const selectedMedicines = medicines.filter((m) => (medicineIds || []).includes(m.medicineId));
  const medicineNames = selectedMedicines.map((m) => m.medicineName).join(", ") || "No Medicines Assigned";
  const treatmentIds = [...new Set(selectedMedicines.map((m) => m.treatmentId).filter(Boolean))];
  const assignedTreatments = treatments.filter((t) => treatmentIds.includes(t.treatmentId));
  const treatmentNames = assignedTreatments.map((t) => t.treatmentName).join(", ") || "No Treatments Assigned";

  // Calculate if next visit is in the past
  const isVisitPast = new Date(nextVisitDate) < new Date();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavbarCustomer />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Pet Health Book Details</h1>
              <button
                onClick={handleBack}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Back
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="md:flex">
                {/* Pet Information Section */}
                <div className="md:w-1/3 bg-gray-50 p-6">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4 w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <img
                        src={petImage ? `http://localhost:5050/pet-service${petImage}` : "/Images/default-image.png"}
                        alt={petName || "Pet"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">{petName}</h2>
                    <p className="text-sm text-gray-500 mb-4">Born: {formatDate(dateOfBirth)}</p>
                    <div className="w-full mt-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Health Status</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Next Visit:</span>
                          <span className={`text-sm font-medium ${isVisitPast ? 'text-red-600' : 'text-green-600'}`}>
                            {formatDate(nextVisitDate)}
                          </span>
                        </div>
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${isVisitPast ? 'bg-red-500' : 'bg-green-500'}`}
                              style={{ width: isVisitPast ? '100%' : '50%' }}
                            ></div>
                          </div>
                          <div className="mt-1 text-xs text-center text-gray-500">
                            {isVisitPast ? 'Visit overdue' : 'Upcoming visit'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Health Record Details Section */}
                <div className="md:w-2/3 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Health Record Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Treatment</label>
                        <div className="p-3 bg-gray-50 rounded-md border border-gray-200 min-h-[42px]">
                          {treatmentNames}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Performed By</label>
                        <div className="p-3 bg-gray-50 rounded-md border border-gray-200 min-h-[42px]">
                          {performBy || "Not specified"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Visit Date</label>
                        <div className="p-3 bg-gray-50 rounded-md border border-gray-200 min-h-[42px]">
                          {formatDate(visitDate)}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Next Visit Date</label>
                        <div className={`p-3 rounded-md border min-h-[42px] ${isVisitPast
                          ? 'bg-red-50 border-red-200 text-red-700'
                          : 'bg-green-50 border-green-200 text-green-700'
                          }`}>
                          {formatDate(nextVisitDate)}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Medicines</label>
                        <div className="p-3 bg-gray-50 rounded-md border border-gray-200 min-h-[42px]">
                          {medicineNames}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <div className={`p-3 rounded-md border min-h-[42px] ${isVisitPast
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                          }`}>
                          {isVisitPast ? 'Completed' : 'Pending'}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Medicine Details Section */}
                  {selectedMedicines.length > 0 && (
                    <div className="mt-8">
                      <h4 className="text-md font-medium text-gray-700 mb-3">Medicine Details</h4>
                      <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Medicine Name
                              </th>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Treatment
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedMedicines.map((medicine) => {
                              const treatment = treatments.find(t => t.treatmentId === medicine.treatmentId);
                              return (
                                <tr key={medicine.medicineId}>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                    {medicine.medicineName}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {treatment?.treatmentName || 'N/A'}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PetHealthBookDetailCus;
