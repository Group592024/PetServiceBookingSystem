import React, { useEffect, useState, useRef, useCallback } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";
import Sidebar from "../../../components/sidebar/Sidebar";
import Navbar from "../../../components/navbar/Navbar";
import { Link } from "react-router-dom";
import { Box } from "@mui/material";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const PetHealthBookList = () => {
  const [pets, setPets] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const [treatments, setTreatments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [petName, setPetName] = useState("");
  const [accountPhoneNumber, setAccountPhoneNumber] = useState("");
  const sidebarRef = useRef(null);

  const fetchPetHealthBooks = useCallback(async () => {
    try {
      const token = sessionStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const [
        petHealthBooksRes,
        medicinesRes,
        treatmentsRes,
        bookingsRes,
        bookingServiceItemsRes,
        petDataRes,
        petBreedRes,
      ] = await Promise.all([
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
        fetch("http://localhost:5050/api/Treatment", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("http://localhost:5050/Bookings", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(
          "http://localhost:5050/api/BookingServiceItems/GetBookingServiceList",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        ),
        fetch("http://localhost:5050/api/pet", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("http://localhost:5050/api/petBreed", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const [
        petHealthBooksData,
        medicinesData,
        treatmentsData,
        bookingsData,
        bookingServiceItemsData,
        petsData,
        petBreedsData,
      ] = await Promise.all([
        petHealthBooksRes.json(),
        medicinesRes.json(),
        treatmentsRes.json(),
        bookingsRes.json(),
        bookingServiceItemsRes.json(),
        petDataRes.json(),
        petBreedRes.json(),
      ]);

      const petsWithDetails = await Promise.all(
        petHealthBooksData.data.map(async (pet) => {
          const bookingServiceItem = bookingServiceItemsData.data.find(
            (b) => b.bookingServiceItemId === pet.bookingServiceItemId
          );

          const booking = bookingServiceItem
            ? bookingsData.data.find(
              (bk) => bk.bookingId === bookingServiceItem.bookingId
            )
            : null;

          const accountId = booking ? booking.accountId : null;
          const accountPhoneNumber = accountId
            ? await fetchAccountPhoneNumber(accountId)
            : "No Phone Number";

          const medicines = medicinesData.data.filter((m) =>
            pet.medicineIds.includes(m.medicineId)
          );

          const medicineNames =
            medicines.length > 0
              ? medicines.map((m) => m.medicineName).join(", ")
              : "No Medicines Assigned";

          const treatmentNames =
            [
              ...new Set(
                medicines
                  .map((m) => {
                    const treatment = treatmentsData.data.find(
                      (t) => t.treatmentId === m.treatmentId
                    );
                    return treatment ? treatment.treatmentName : null;
                  })
                  .filter(Boolean)
              ),
            ].join(", ") || "No Treatments Assigned";

          const matchedPet = bookingServiceItem
            ? petsData.data.find((p) => p.petId === bookingServiceItem.petId)
            : null;

          const breed =
            matchedPet && matchedPet.petBreedId
              ? petBreedsData.data.find(
                (b) => b.petBreedId === matchedPet.petBreedId
              )?.petBreedName || "Unknown Breed"
              : "Unknown Breed";

          return {
            ...pet,
            bookingServiceItemId: pet.bookingServiceItemId,
            accountPhoneNumber,
            medicineNames,
            treatmentNames,
            petName: matchedPet ? matchedPet.petName : "Unknown Pet",
            breed,
          };
        })
      );

      setPets(petsWithDetails);
      console.log(petsWithDetails);
      setMedicines(medicinesData.data || []);
      setTreatments(treatmentsData.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire(
        "Error",
        "Failed to load data. Please try again later.",
        "error"
      );
    }
  }, []);

  const fetchAccountPhoneNumber = async (accountId) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5050/api/Account?AccountId=${accountId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      return data.accountPhoneNumber || "No Phone Number";
    } catch (error) {
      console.error("Error fetching account phone number:", error);
      return "No Phone Number";
    }
  };
  useEffect(() => {
    fetchPetHealthBooks();
  }, [fetchPetHealthBooks]);

  const handleDelete = async (petId, petName) => {
    const token = sessionStorage.getItem("token");
    Swal.fire({
      title: "Are you sure?",
      text: `You want to delete pet: ${petName}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `http://localhost:5050/api/PetHealthBook/delete/${petId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            setPets((prev) => prev.filter((pet) => pet.healthBookId !== petId));
            Swal.fire(
              "Deleted!",
              `${petName} has been permanently deleted.`,
              "success"
            );
          } else {
            const errorData = await response.json();
            Swal.fire(
              "Error!",
              errorData.message || "Failed to delete the pet.",
              "error"
            );
          }
        } catch (error) {
          console.error("Error deleting pet:", error);
          Swal.fire(
            "Error!",
            "An error occurred while deleting the pet.",
            "error"
          );
        }
      }
    });
  };

  const handleSubmit = async () => {
    if (!petName || !accountPhoneNumber) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please fill in all required fields.",
      });
      return;
    }

    const token = sessionStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:5050/api/PetHealthBook/addpet",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            petName,
            accountPhoneNumber,
          }),
        }
      );

      if (response.ok) {
        Swal.fire("Success", "Pet added successfully!", "success");
        setOpenDialog(false);
        fetchPetHealthBooks();
      } else {
        const errorData = await response.json();
        Swal.fire("Error", errorData.message || "Error adding pet", "error");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      Swal.fire("Error", "An error occurred while adding the pet.", "error");
    }
  };
  const filteredPets = pets.filter((pet) => {
    const query = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      pet.petName.toLowerCase().includes(query) ||
      pet.accountPhoneNumber.includes(query) ||
      pet.breed.toLowerCase().includes(query) ||
      (pet.treatmentName && pet.treatmentName.toLowerCase().includes(query)) ||
      (pet.createAt &&
        moment(pet.createAt).format("DD-MM-YYYY").includes(query)) ||
      (pet.performBy && pet.performBy.toLowerCase().includes(query))
    );
  });

  const columns = [
    {
      field: "serialNumber",
      headerName: "S.No",
      flex: 0.5,
      sortable: true,
      renderCell: (params) => <span>{params.row.id}</span>,
      sortComparator: (v1, v2) => v1 - v2,
    },
    { field: "petName", headerName: "Pet Name", flex: 1 },
    { field: "accountPhoneNumber", headerName: "Owner's Phone", flex: 1 },
    { field: "breed", headerName: "Breed", flex: 1 },
    { field: "treatmentNames", headerName: "Treatment", flex: 1 },
    {
      field: "visitDate",
      headerName: "Date",
      flex: 1,
      renderCell: (params) =>
        moment(params.row.visitDate).isValid()
          ? moment(params.row.visitDate).format("DD-MM-YYYY")
          : "Invalid Date",
    },
    { field: "performBy", headerName: "PerForm By", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.5,
      sortable: false,
      renderCell: (params) => (
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <Link to={`/update/${params.row.healthBookId}`}>
            <IconButton color="primary">
              <EditIcon />
            </IconButton>
          </Link>
          <Link to={`/pethealthbook/detail/${params.row.healthBookId}`}>
            <IconButton color="default">
              <VisibilityIcon />
            </IconButton>
          </Link>
        </div>
      ),
    },
  ];
  return (
    <div className="flex h-screen bg-dark-grey-100">
      <Sidebar ref={sidebarRef} />
      <div className="content h-full">
        <Navbar sidebarRef={sidebarRef} />
        <main className="flex-1">
          <div className="listContainer">

            <div className="datatable">
              <div className="datatableTitle">
                Health Book List
              </div>
              <DataGrid
                rows={filteredPets
                  .sort((a, b) => a.accountIsDeleted - b.accountIsDeleted)
                  .map((acc, index) => ({ ...acc, id: index + 1 }))}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 15, 20]}
                disableSelectionOnClick
                pagination
                paginationMode="client"
                getRowId={(row) => row.healthBookId}
              />
            </div>

          </div>
        </main>
      </div>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add Pet</DialogTitle>
        <DialogContent>
          <TextField
            label="Pet Name"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Owner's Phone Number"
            value={accountPhoneNumber}
            onChange={(e) => setAccountPhoneNumber(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="default">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PetHealthBookList;
