import React, { useEffect, useState, useCallback } from "react";
import { IconButton, TextField } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import NavbarCustomer from "../../../components/navbar-customer/NavbarCustomer";
import moment from "moment";

const PetHealthBookListCus = () => {
  const [pets, setPets] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPetHealthBooks = useCallback(async () => {
    try {
      const [petsRes, medicinesRes, treatmentsRes, bookingsRes] = await Promise.all([
        fetch("http://localhost:5003/api/PetHealthBook"),
        fetch("http://localhost:5003/Medicines"),
        fetch("http://localhost:5003/api/Treatment"),
        fetch("http://localhost:5115/api/Booking"),
      ]);

      const [petsData, medicinesData, bookingsData] = await Promise.all([
        petsRes.json(),
        medicinesRes.json(),
        bookingsRes.json(),
      ]);
      console.log(petsData);
      const petsWithDetails = await Promise.all(petsData.data.map(async (pet) => {
        const booking = bookingsData.data.find((b) => b.bookingId === pet.bookingId);
        const medicine = medicinesData.data.find((m) => m.medicineId === pet.medicineId);
        const performBy = pet ? pet.performBy : "Unknown";
        const createdAt = pet ? pet.createdAt : "Unknown";
        const medicineName = medicine ? medicine.medicineName : "No Medicine";

        return {
          ...pet,
          createdAt,
          medicineName,
          performBy,
        };
      }));

      setPets(petsWithDetails);



      setPets(petsWithDetails);
      setMedicines(medicinesData.data || []);

    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire("Error", "Failed to load data. Please try again later.", "error");
    }
  }, []);

  useEffect(() => {
    fetchPetHealthBooks();
  }, [fetchPetHealthBooks]);

  const filteredPets = pets.filter((pet) => {
    const query = searchQuery.toLowerCase();
    const isValidDate = moment(searchQuery, "DD/MM/YYYY", true).isValid();
    const petDate = moment(pet.createdAt).format("DD/MM/YYYY").toLowerCase(); 
  
    return (
      !searchQuery ||
      (pet.performBy && pet.performBy.toLowerCase().includes(query)) ||
      (pet.medicineName && pet.medicineName.toLowerCase().includes(query)) ||
      (isValidDate && petDate.includes(query)) 
    );
  });
  


  const formatDate = (dateString) => {
    if (!dateString) return "";
    return moment(dateString).format("DD-MM-YYYY");
  };

  return (
    <div className="flex h-screen bg-dark-grey-100">
      <div className="w-full">
        <NavbarCustomer />
        <main className="flex-1 p-4">
          <h2 className="mb-4 text-xl font-bold">Pet Health Book List</h2>
          <div className="flex gap-8">
            {/* Left Column - Pet Information */}
            <div className="w-1/3 items-center justify-center flex rounded-md p-6">
              {filteredPets.length > 0 && (
                <div className="w-[600px] h-[600px] bg-white shadow-md rounded-md p-6">
                  <div className="flex flex-col items-center">
                    <div className="w-[300px] h-[300px] bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mb-4">
                      {filteredPets[0].petImage ? (
                        <img src={filteredPets[0].petImage} alt={filteredPets[0].petName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-500">No Image</span>
                      )}
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-semibold">Bull {filteredPets[0].petName}</h3>
                      <p className="text-md text-gray-600">17/02/2024 {formatDate(filteredPets[0].petDob)}</p>
                    </div>
                  </div>
                </div>

              )}
            </div>


            {/* Right Column - Pet Health Book List */}
            <form className="w-full sm:w-2/3 bg-white shadow-md rounded-md p-6">
              {/* Search Form */}
              <div className="relative flex items-center justify-end mb-4">
                <input
                  type="search"
                  id="search-dropdown"
                  className="block w-64 p-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-l-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
                  placeholder="Search Accounts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search accounts"
                  required
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 p-2.5 text-sm font-medium text-white bg-blue-700 rounded-r-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  aria-label="Search"
                >
                  <svg
                    className="w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35M10.5 16.5a6 6 0 100-12 6 6 0 000 12z"
                    />
                  </svg>
                </button>
              </div>

              {/* Pet Health Book List */}
              <div className="w-full space-y-6">
                {filteredPets.map((pet) => (
                  <div key={pet.healthBookId} className="flex justify-between items-center bg-gray-600 shadow-md rounded-md p-4">
                    <div className="text-sm text-white truncate w-1/4">{pet.medicineName}</div>
                    <div className="text-sm text-white truncate w-1/4">{pet.performBy}</div>
                    <div className="text-sm text-white truncate w-1/4">
                      {moment(pet.createdAt).format("DD/MM/YYYY")}
                    </div>
                    <div className="flex items-center">
                      <Link to={`/detailcus/${pet.healthBookId}`}>
                        <IconButton
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            border: '2px solid black',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            color: 'black',
                          }}
                        >
                          !
                        </IconButton>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </form>


          </div>
        </main>
      </div >
    </div >
  );
};

export default PetHealthBookListCus;
