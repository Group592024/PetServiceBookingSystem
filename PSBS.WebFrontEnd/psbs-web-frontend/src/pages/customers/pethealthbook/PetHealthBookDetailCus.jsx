import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import NavbarCustomer from "../../../components/navbar-customer/NavbarCustomer";

const PetHealthBookDetailCus = () => {
  const sidebarRef = useRef(null);
  const token = sessionStorage.getItem("token");

  const navigate = useNavigate();
  const { healthBookId } = useParams();

  // State để lưu trữ dữ liệu
  const [petHealthBook, setPetHealthBook] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [bookingServiceItems, setBookingServiceItems] = useState([]);
  const [pets, setPets] = useState([]);

  // Thông tin pet hiển thị
  const [petImage, setPetImage] = useState("");
  const [petName, setPetName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  // Hàm format ngày
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

        // Chuyển đổi dữ liệu sang JSON
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

        // Lưu vào state
        setPetHealthBook(healthBookData.data || {});
        setMedicines(medicinesData.data || []);
        setTreatments(treatmentsData.data || []);
        setBookingServiceItems(bookingServiceItemsData.data || []);
        setPets(petsData.data || []);

        // Xử lý dữ liệu Pet từ BookingServiceItemId
        const currentHealthBook = healthBookData.data;
        if (!currentHealthBook?.bookingServiceItemId) return;

        const matchedServiceItem = (bookingServiceItemsData.data || []).find(
          (item) =>
            item.bookingServiceItemId === currentHealthBook.bookingServiceItemId
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
      }
    };

    fetchData();
  }, [healthBookId]);

  const handleBack = () => {
    navigate(-1);
  };

  // Nếu chưa load xong data
  if (!petHealthBook) {
    return <div>Loading...</div>;
  }

  // Tách dữ liệu từ petHealthBook
  const { performBy, visitDate, nextVisitDate, medicineIds } = petHealthBook;

  // Xác định danh sách medicine
  const selectedMedicines = medicines.filter((m) =>
    (medicineIds || []).includes(m.medicineId)
  );
  const medicineNames =
    selectedMedicines.map((m) => m.medicineName).join(", ") || "No Medicines Assigned";

  // Xác định danh sách treatment
  const treatmentIds = [
    ...new Set(selectedMedicines.map((m) => m.treatmentId).filter(Boolean)),
  ];
  const assignedTreatments = treatments.filter((t) =>
    treatmentIds.includes(t.treatmentId)
  );
  const treatmentNames =
    assignedTreatments.map((t) => t.treatmentName).join(", ") || "No Treatments Assigned";

  return (
    <div className="flex h-screen bg-dark-grey-100 overflow-x-hidden">
      <div className="overflow-y-auto w-full">
        <NavbarCustomer />
        <div className="p-6 bg-white shadow-md rounded-md w-full">
          <h2 className="mb-4 text-xl font-bold text-left">Health Book Detail</h2>
          <div className="flex justify-center flex-wrap gap-8 w-full">
            <div className="w-full sm:w-1/3 md:w-1/4 bg-white shadow-md rounded-md p-6 flex flex-col items-center">
              <div className="flex flex-col items-center">
                <img
                  src={
                    petImage ? `http://localhost:5050/pet-service${petImage}` : "/Images/default-image.png"
                  }
                  alt="Pet Health Record"
                  className="w-[300px] h-[300px] object-cover rounded-lg shadow-lg transition-transform duration-300 hover:scale-110"
                />
                <div className="mt-4 text-sm font-bold">{petName}</div>
                <div className="mt-4 text-sm ">{formatDate(dateOfBirth)}</div>
              </div>
            </div>
            <div className="w-full sm:w-2/3 bg-white shadow-md rounded-md p-6">
              <form>
                <div className="mb-3">
                  <label className="block text-sm mb-1 font-bold">Treatment</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-md"
                    value={treatmentNames}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm mb-1 font-bold">Performed By</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-md"
                    value={performBy || ""}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm mb-1 font-bold">Visit Date</label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-md"
                    value={formatDate(visitDate)}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm mb-1 font-bold">Next Visit Date</label>
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
