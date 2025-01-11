import React, { useState, useEffect, useRef } from "react";
import Navbar from "../../../components/navbar/Navbar";
import Sidebar from "../../../components/sidebar/Sidebar";
import Datatable from "../../../components/RoomTypes/roomTypeSource"; 
import Swal from "sweetalert2";
import axios from 'axios';

const RoomTypeList = () => {
  const [roomTypes, setRoomTypes] = useState([]); 
  const [searchQuery, setSearchQuery] = useState("");
  const sidebarRef = useRef(null);
  const debouncedSearchQuery = useRef(null);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const response = await axios.get('http://localhost:5023/api/RoomType');
        console.log("API Response:", response.data);
        const roomTypeData = response.data?.data || []; 
        console.log('Fetched Room Types:', roomTypeData);
        setRoomTypes(roomTypeData);
      } catch (error) {
        console.error("Error fetching room types:", error);
        setRoomTypes([]); 
      }
    };
    fetchRoomTypes();
  }, []);
  
  
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (debouncedSearchQuery.current) {
      clearTimeout(debouncedSearchQuery.current);
    }
    debouncedSearchQuery.current = setTimeout(() => {
      setSearchQuery(value);
    }, 300);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault(); 
    console.log("Searching for:", searchQuery);
  };

  const filteredRoomTypes = roomTypes.filter((roomType) =>
    roomType.name && roomType.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDetail = (id) => {
    const roomType = roomTypes.find(r => r.roomTypeId === id);
    if (roomType) {
      Swal.fire({
        title: `Room Type Detail`,
        html: `
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <p><strong>Type Name:</strong> ${roomType.name}</p>
            <p><strong>Price Per Hour:</strong> ${roomType.pricePerHour}</p>
            <p><strong>Price Per Day:</strong> ${roomType.pricePerDay}</p>
            <p><strong>Description:</strong></p>
            <pre style="white-space: pre-wrap; word-wrap: break-word; max-height: 200px; overflow-y: auto;">${roomType.description}</pre>
            <p><strong>Status:</strong> <span style="color: ${roomType.isDeleted ? 'red' : 'green'}; font-weight: bold;">${roomType.isDeleted ? 'Inactive' : 'Active'}</span></p>
          </div>
        `,
        icon: "info",
        confirmButtonText: "Close",
      });
    }
  };
   
  const handleEdit = (id) => {
    const roomType = roomTypes.find(r => r.roomTypeId === id);
    if (roomType) {
      Swal.fire({
        title: `Edit Room Type`,
        html: `
          <div>
            <p><strong>Type Name:</strong></p>
            <input type="text" id="edit-name" class="swal2-input" value="${roomType.name}" />
          </div>
          <div>
            <p><strong>Price Per Hour:</strong></p>
            <input type="text" id="edit-pricePerHour" class="swal2-input" value="${roomType.pricePerHour}" />
          </div>
          <div>
            <p><strong>Price Per Day:</strong></p>
            <input type="text" id="edit-pricePerDay" class="swal2-input" value="${roomType.pricePerDay}" />
          </div>
          <div>
            <p><strong>Description:</strong></p>
            <textarea id="edit-description" class="swal2-input" style="width: 100%; height: 150px; border: 2px solid #ccc; border-radius: 4px; padding: 10px; box-sizing: border-box;">${roomType.description}</textarea>
          </div>
          <div>
            <strong>Status:</strong>
            <label>
              <input type="radio" id="edit-status-active" name="edit-status" value="false" ${!roomType.isDeleted ? "checked" : ""} />
              <span style="color: green;">Active</span>
            </label>
            <label>
              <input type="radio" id="edit-status-inactive" name="edit-status" value="true" ${roomType.isDeleted ? "checked" : ""} />
              <span style="color: red;">Inactive</span>
            </label>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Save Changes",
        preConfirm: () => {
          const name = document.getElementById('edit-name').value;
          const pricePerHour = document.getElementById('edit-pricePerHour').value;
          const pricePerDay = document.getElementById('edit-pricePerDay').value;
          const description = document.getElementById('edit-description').value;
          const isDeleted = document.querySelector('input[name="edit-status"]:checked').value === "true";
  
          if (!name.trim()) {
            Swal.showValidationMessage("Room type name cannot be empty!");
            return null;
          }

          const isDuplicateName = roomTypes.some((rt) => rt.name.toLowerCase() === name.toLowerCase());
          if (isDuplicateName) {
            Swal.showValidationMessage(`Room type name "${name}" already exists!`);
            return null;
          }
  
          if (!description.trim()) {
            Swal.showValidationMessage("Description cannot be empty!");
            return null;
          }
  
          if (!pricePerHour.trim()) {
            Swal.showValidationMessage("Price per hour cannot be empty!");
            return null;
          }
          const parsedPricePerHour = parseFloat(pricePerHour);
          if (isNaN(parsedPricePerHour) || parsedPricePerHour < 0) {
            Swal.showValidationMessage("Price per hour must be a non-negative number!");
            return null;
          }
  
          if (!pricePerDay.trim()) {
            Swal.showValidationMessage("Price per day cannot be empty!");
            return null;
          }
          const parsedPricePerDay = parseFloat(pricePerDay);
          if (isNaN(parsedPricePerDay) || parsedPricePerDay < 0) {
            Swal.showValidationMessage("Price per day must be a non-negative number!");
            return null;
          }
  
          if (parsedPricePerDay <= parsedPricePerHour) {
            Swal.showValidationMessage("Price per day must be greater than price per hour!");
            return null;
          }
  
          return {
            roomTypeId: id,
            name,
            pricePerHour: parsedPricePerHour,
            pricePerDay: parsedPricePerDay,
            description,
            isDeleted,
          };
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const formData = new FormData();
            formData.append("roomTypeId", result.value.roomTypeId);
            formData.append("name", result.value.name);
            formData.append("pricePerHour", result.value.pricePerHour);
            formData.append("pricePerDay", result.value.pricePerDay); 
            formData.append("description", result.value.description);
            formData.append("isDeleted", result.value.isDeleted);
  
            await axios.put(`http://localhost:5023/api/RoomType/${id}`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
  
            Swal.fire("Updated!", `Room Type "${result.value.name}" has been updated.`, "success");
  
            setRoomTypes(roomTypes.map(r =>
              r.roomTypeId === id ? { ...r, ...result.value } : r
            ));
          } catch (error) {
            Swal.fire("Error!", "There was an error updating the room type.", "error");
          }
        }
      });
    }
  };
  
  const handleDelete = (id) => {
    const roomType = roomTypes.find(r => r.roomTypeId === id);
    if (!roomType) {
      Swal.fire("Error!", "Room Type not found.", "error");
      return;
    }
    Swal.fire({
      title: `Are you sure you want to delete room type "${roomType.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const updatedRoomTypes = roomTypes.filter(r => r.roomTypeId !== id);
        setRoomTypes(updatedRoomTypes);
  
        try {
          const response = await axios.delete(`http://localhost:5023/api/RoomType/${id}`);
          const successMessage = response.data.message || `Room Type "${roomType.name}" has been deleted.`;
          Swal.fire("Deleted!", successMessage, "success").then(() => {
            window.location.reload();
          });
        } catch (error) {
          console.error("Error deleting room type:", error);
          const errorMessage = error.response?.data?.message || "There was an issue deleting the room type.";
         Swal.fire("Error!", errorMessage, "error").then(() => {
            window.location.reload(); 
         });
        }
      }
    });
  };  

  const handleAdd = () => {
    Swal.fire({
      title: "Add New Room Type",
      html: `
        <p for="add-name"><strong>Room Type Name:</strong></p>
        <input type="text" id="add-name" class="swal2-input" placeholder="Enter Room Type Name" /><br>
        <p for="add-pricePerHour"><strong>Price Per Hour:</strong></p>
        <input type="text" id="add-pricePerHour" class="swal2-input" placeholder="Enter Price Per Hour" /><br>
        <p for="add-pricePerDay"><strong>Price Per Day:</strong></p>
        <input type="text" id="add-pricePerDay" class="swal2-input" placeholder="Enter Price Per Day" /><br>
        <p for="add-description"><strong>Description:</strong></p>
        <textarea id="add-description" class="swal2-textarea" placeholder="Enter Description" style="width: 80%; height: 150px; border: 2px solid #ccc; border-radius: 4px; padding: 10px; box-sizing: border-box;"></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: "Add",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const name = document.getElementById("add-name").value;
        const description = document.getElementById("add-description").value;
        const pricePerHour = document.getElementById("add-pricePerHour").value;
        const pricePerDay = document.getElementById("add-pricePerDay").value;
  
        if (!name.trim()) {
          Swal.showValidationMessage("Room type name cannot be empty!");
          return null;
        }
  
        const isDuplicateName = roomTypes.some((rt) => rt.name.toLowerCase() === name.toLowerCase());
        if (isDuplicateName) {
          Swal.showValidationMessage(`Room type name "${name}" already exists!`);
          return null;
        }

        if (!description.trim()) {
          Swal.showValidationMessage("Description cannot be empty!");
          return null;
        }
  
        if (!pricePerHour.trim()) {
          Swal.showValidationMessage("Price per hour cannot be empty!");
          return null;
        }
        const parsedPricePerHour = parseFloat(pricePerHour);
        if (isNaN(parsedPricePerHour) || parsedPricePerHour < 0) {
          Swal.showValidationMessage("Price per hour must be a non-negative number!");
          return null;
        }
  
        if (!pricePerDay.trim()) {
          Swal.showValidationMessage("Price per day cannot be empty!");
          return null;
        }
        const parsedPricePerDay = parseFloat(pricePerDay);
        if (isNaN(parsedPricePerDay) || parsedPricePerDay < 0) {
          Swal.showValidationMessage("Price per day must be a non-negative number!");
          return null;
        }
  
        if (parsedPricePerDay <= parsedPricePerHour) {
          Swal.showValidationMessage("Price per day must be greater than price per hour!");
          return null;
        }
  
        return {
          name: name.trim(),
          description: description.trim(),
          isDeleted: false,
          pricePerHour: parsedPricePerHour, 
          pricePerDay: parsedPricePerDay,   
        };
      },
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        const formData = new FormData();
        formData.append("name", result.value.name);
        formData.append("description", result.value.description);
        formData.append("pricePerHour", result.value.pricePerHour);
        formData.append("pricePerDay", result.value.pricePerDay);
        formData.append("isDeleted", result.value.isDeleted);
  
        try {
          const response = await axios.post("http://localhost:5023/api/RoomType", formData);
  
          if (response.status === 200 || response.status === 201) {
            setRoomTypes((prevRoomTypes) => [...prevRoomTypes, response.data]);
            Swal.fire("Success!", `Room Type "${result.value.name}" has been added.`, "success").then(() => {
              window.location.reload();
            });
          } else {
            Swal.fire("Error!", "There was an issue adding the room type.", "error");
          }
        } catch (error) {
          console.error("Error adding room type:", error);
          if (error.response) {
            Swal.fire("Error!", `API Error: ${error.response.data.message || error.message}`, "error");
          } else {
            Swal.fire("Error!", "An unknown error occurred.", "error");
          }
        }
      }
    });
  };
  
  return (
    <div className="list">
      <Sidebar ref={sidebarRef} />
      <div className="listContainer content">
        <Navbar sidebarRef={sidebarRef} />
        <main className="p-3">
          <div className="flex justify-end items-center gap-4 mb-4">
            <form className="relative" onSubmit={handleFormSubmit}>
              <input
                type="search"
                id="search-dropdown"
                className="block w-64 p-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-l-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
                placeholder="Search Room Types..."
                aria-label="Search"
                value={searchQuery}
                onChange={handleSearch}
                required
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 p-2.5 text-sm font-medium text-white bg-blue-700 rounded-r-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300"
                  aria-label="search"
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
              <button
              type="button"
              onClick={handleAdd}
              className="flex items-center px-5 py-2.5 text-sm font-medium text-blue-700 border border-blue-700 rounded-lg hover:text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500"
            >
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New
            </button>
          </div>
          <Datatable
            roomTypes={filteredRoomTypes}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onDetail={handleDetail}
          />
        </main>
      </div>
    </div>
  );
};

export default RoomTypeList;
