import React, { useEffect, useState, useRef, useCallback } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { IconButton, TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";
import { Link } from "react-router-dom";
import { Box } from "@mui/material";
import moment from 'moment';
import { useNavigate } from "react-router-dom";
import NavbarCustomer from "../../../components/navbar-customer/NavbarCustomer";

const PetHealthBookListCus = () => {
  const [pets, setPets] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const navigate = useNavigate();
  const [treatments, setTreatments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [petName, setPetName] = useState("");
  const [accountPhoneNumber, setAccountPhoneNumber] = useState("");
  const sidebarRef = useRef(null);

  const userRole = localStorage.getItem("role");

  const fetchPetHealthBooks = useCallback(async () => {
    try {
      const [petsRes, medicinesRes, treatmentsRes, bookingsRes] = await Promise.all([
        fetch("http://localhost:5003/api/PetHealthBook"),
        fetch("http://localhost:5003/Medicines"),
        fetch("http://localhost:5003/api/Treatment"),
        fetch("http://localhost:5115/api/Booking"),
      ]);

      const [petsData, medicinesData, treatmentsData, bookingsData] = await Promise.all([
        petsRes.json(),
        medicinesRes.json(),
        treatmentsRes.json(),
        bookingsRes.json(),
      ]);

      // Log the fetched data
      console.log("Fetched Pet Data:", petsData);
      console.log("Fetched Medicines Data:", medicinesData);
      console.log("Fetched Treatments Data:", treatmentsData);
      console.log("Fetched Bookings Data:", bookingsData);

      const petsWithDetails = await Promise.all(petsData.data.map(async (pet) => {
        const booking = bookingsData.data.find((b) => b.bookingId === pet.bookingId);
        const accountId = booking ? booking.accountId : null;

       // const accountPhoneNumber = accountId ? await fetchAccountPhoneNumber(accountId) : "No Phone Number";
        const medicine = medicinesData.data.find((m) => m.medicineId === pet.medicineId);
        const treatment = treatmentsData.data.find((t) => t.treatmentId === medicine?.treatmentId);
        const treatmentName = treatment ? treatment.treatmentName : "No Treatment Assigned";
        const petName = pet.petName || "Temporary Pet Name";  // Gán tạm
        const breed = pet.breed || "Temporary Breed"; 
        return {
          ...pet,
          accountPhoneNumber,
          treatmentName,
          petName,  // Đảm bảo có giá trị petName tạm thời
          breed,  // Đảm bảo có giá trị breed tạm thời
        };
      }));

      setPets(petsWithDetails);
      setMedicines(medicinesData.data || []);
      setTreatments(treatmentsData.data || []);
      setBookings(bookingsData.data || []);

    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire("Error", "Failed to load data. Please try again later.", "error");
    }
  }, []);

//   const fetchAccountPhoneNumber = async (accountId) => {
//     try {
//       const accountResponse = await fetch(`http://localhost:5000/api/Account?AccountId=${accountId}`);
//       const accountData = await accountResponse.json();
//       console.log("Fetched Account Data:", accountData);
//       return accountData.accountPhoneNumber || "No Phone Number"; // Default if no phone number
//     } catch (error) {
//       console.error("Error fetching account phone number:", error);
//       return "No Phone Number"; // Default value if fetching phone number fails
//     }
//   };

  useEffect(() => {
    fetchPetHealthBooks();
  }, [fetchPetHealthBooks]);

//   const handleDelete = async (petId, petName, isDeleted) => {
//     Swal.fire({
//       title: "Are you sure?",
//       text: `You want to delete pet: ${petName}`,
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Yes, delete it!",
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         try {
//           const apiUrl = `http://localhost:5003/api/PetHealthBook/delete/${petId}`;
//           const response = await fetch(apiUrl, {
//             method: "DELETE",
//           });

//           if (response.ok) {
//             setPets((prev) => prev.filter((pet) => pet.healthBookId !== petId));
//             Swal.fire("Deleted!", `${petName} has been permanently deleted.`, "success");
//           } else {
//             const errorData = await response.json();
//             Swal.fire("Error!", errorData.message || "Failed to delete the pet.", "error");
//           }
//         } catch (error) {
//           console.error("Error deleting pet:", error);
//           Swal.fire("Error!", "An error occurred while deleting the pet.", "error");
//         }
//       }
//     });
//   };

  const filteredPets = pets.filter((pet) => {
    const query = searchQuery.toLowerCase();
    
    return (
      !searchQuery ||
      pet.petName.toLowerCase().includes(query) ||
      pet.accountPhoneNumber.includes(query) ||
      pet.breed.toLowerCase().includes(query) ||
      (pet.treatmentName && pet.treatmentName.toLowerCase().includes(query)) ||
      (pet.createAt && moment(pet.createAt).format("DD-MM-YYYY").includes(query)) ||
      (pet.performBy && pet.performBy.toLowerCase().includes(query))
    );
  });

//   const handleSubmit = async () => {
//     // if (!petName || !accountPhoneNumber) {
//     //   Swal.fire({ icon: "error", title: "Oops...", text: "Please fill in all required fields." });
//     //   return;
//     // }

//     // const phoneRegex = /^0\d{9}$/;
//     // if (!phoneRegex.test(accountPhoneNumber)) {
//     //   Swal.fire({ icon: "error", title: "Invalid Phone", text: "Please enter a valid phone number" });
//     //   return;
//     // }

//     const formData = new FormData();
//     formData.append("PetHealthBookDTO.petName", petName);
//     formData.append("PetHealthBookDTO.accountPhoneNumber", accountPhoneNumber);

//     try {
//       const response = await fetch("http://localhost:5003/api/PetHealthBook/addpet", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await response.json();
//       if (response.ok) {
//         Swal.fire("Success", "Pet added successfully!", "success");
//         setOpenDialog(false);
//         fetchPetHealthBooks();
//         setPetName("");
//         setAccountPhoneNumber("");
//       } else {
//         Swal.fire("Error", data.message || "Error adding pet", "error");
//       }
//     } catch (error) {
//       console.error("Error submitting form:", error);
//       Swal.fire("Error", "An error occurred while adding the pet.", "error");
//     }
//   };

  const columns = [
    { field: "treatmentName", headerName: "Treatment", flex: 1 },
    {
      field: "createAt",
      headerName: "Date",
      flex: 1,
      renderCell: (params) => moment(params.row.createAt).isValid() ? moment(params.row.createAt).format('DD-MM-YYYY') : "Invalid Date",
    },
    { field: "performBy", headerName: "PerForm By", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.5,
      sortable: false,
      renderCell: (params) => (
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          {/* <Link to={`/update/${params.row.healthBookId}`}>
            <IconButton color="primary"><EditIcon /></IconButton>
          </Link> */}
          <Link to={`/detail/${params.row.healthBookId}`}>
            <IconButton color="default"><VisibilityIcon /></IconButton>
          </Link>
          {/* <IconButton color="error" onClick={() => handleDelete(params.row.healthBookId, params.row.petName, params.row.isDeleted)}>
            <DeleteIcon />
          </IconButton> */}
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-screen bg-dark-grey-100">
      <div className="overflow-y-auto w-full">
        <NavbarCustomer />
        <main className="flex-1">
          <div className="p-4 bg-white shadow-md rounded-md h-full">
            <h2 className="mb-4 text-xl font-bold">Pet Health Book List</h2>
            <div className="flex justify-end mb-4">
            <form className="relative flex items-center mr-4">
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
              </form>
              {/* {userRole === "staff" && (
                <button
                type="button"
                onClick={() => navigate("/add")}
                className="ml-4 flex items-center px-5 py-2.5 text-sm font-medium text-blue-700 border border-blue-700 rounded-lg"
              >
                New
              </button>
              )} */}
            </div>

            <div className="h-96">
              <DataGrid
                rows={filteredPets.sort((a, b) => a.accountIsDeleted - b.accountIsDeleted).map((acc, index) => ({ ...acc, id: index + 1 }))}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
                pagination
                getRowId={(row) => row.healthBookId}
              />
            </div>
          </div>
        </main>
      </div>
      {/* <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add Pet</DialogTitle>
        <DialogContent>
          <TextField label="Pet Name" value={petName} onChange={(e) => setPetName(e.target.value)} fullWidth margin="normal" />
          <TextField label="Owner's Phone Number" value={accountPhoneNumber} onChange={(e) => setAccountPhoneNumber(e.target.value)} fullWidth margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="default">Cancel</Button>
          <Button onClick={handleSubmit} color="primary">Add</Button>
        </DialogActions>
      </Dialog> */}
    </div>
  );
};

export default PetHealthBookListCus;
