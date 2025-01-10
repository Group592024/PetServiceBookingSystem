import React, { useState, useEffect, useRef } from "react";
import Navbar from "../../../components/navbar/Navbar";
import Sidebar from "../../../components/sidebar/Sidebar";
import Datatable from "../../../components/Treatments/treatmentSource";
import axios from "axios";
import Swal from "sweetalert2";

const TreatmentList = () => {
  const [treatments, setTreatments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const sidebarRef = useRef(null);
  const debouncedSearchQuery = useRef(null);
  
  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        const response = await axios.get('http://localhost:5143/api/Treatment');
        console.log("API Response:", response.data); 
        const treatmentData = Array.isArray(response.data) ? response.data : response.data.data || [];
        setTreatments(treatmentData);
        console.log("Treatments set:", treatmentData);
      } catch (error) {
        console.error("Error fetching treatments:", error);
        setTreatments([]); 
      }
    };
    fetchTreatments();
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

  const filteredTreatments = treatments.filter((treatment) =>
    treatment.treatmentName && treatment.treatmentName.toLowerCase().includes(searchQuery.toLowerCase())
  ); 

  const handleDetail = (id) => {
    console.log("Detail ID:", id);
    console.log("Treatments:", treatments);
    if (Array.isArray(treatments)) {
      const treatment = treatments.find(t => t.treatmentId === id);
      console.log("Found Treatment:", treatment); 
      if (treatment) {
        const treatmentIndex = treatments.findIndex(t => t.treatmentId === treatment.treatmentId);
        Swal.fire({
          title: `Treatment Detail - ${treatmentIndex + 1}`,
          html: `
            <p><strong>Treatment Name:</strong> ${treatment.treatmentName}</p>
            <p><strong>Status:</strong> <span style="color: ${treatment.isDeleted ? 'red' : 'green'}; font-weight: bold;">${treatment.isDeleted ? 'Inactive' : 'Active'}</span></p>
          `,
          icon: "info",
          confirmButtonText: "Close",
        });
      } else {
        console.error("Treatment not found for ID:", id);
      }
    }
  };
  
  const handleEdit = (id) => {
    if (Array.isArray(treatments)) {
      const treatment = treatments.find(t => t.treatmentId === id); 
      if (treatment) {
        const treatmentIndex = treatments.findIndex(t => t.treatmentId === id) + 1; 
        Swal.fire({
          title: `Edit Treatment - ${treatmentIndex}`,
          html: `
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
              <p style="margin-bottom: 0;"><strong>Treatment Name:</strong></p><br>
              <input type="text" id="edit-name" class="swal2-input" placeholder="Treatment Name" value="${treatment.treatmentName}" style="flex: 1;">  
            </div>
            <div style="margin-bottom: 10px;">
              <strong>Status:</strong>
              <label style="margin-right: 20px;">
                <input type="radio" id="edit-status-active" name="edit-status" value="false" ${!treatment.isDeleted ? "checked" : ""}>
                <span style="color: green;">Active</span>
              </label>
              <label>
                <input type="radio" id="edit-status-inactive" name="edit-status" value="true" ${treatment.isDeleted ? "checked" : ""}>
                <span style="color: red;">Inactive</span>
              </label>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: "Save Changes",
          cancelButtonText: "Cancel",
          preConfirm: () => {
            const name = document.getElementById('edit-name').value.trim();
            const isDeleted = document.querySelector('input[name="edit-status"]:checked').value === "true"; 
  
            if (!name) {
              Swal.showValidationMessage("Treatment name cannot be empty!");
              return null;
            }
  
            const isDuplicate = treatments.some(t => 
              t.treatmentId !== id && t.treatmentName.toLowerCase() === name.toLowerCase()
            );
            if (isDuplicate) {
              Swal.showValidationMessage(`Treatment name "${name}" already exists!`);
              return null;
            }
  
            return { treatmentId: id, treatmentName: name, isDeleted }; 
          },
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              const formData = new FormData();
              formData.append("treatmentId", id); 
              formData.append("treatmentName", result.value.treatmentName);
              formData.append("isDeleted", result.value.isDeleted);
  
              await axios.put(`http://localhost:5143/api/Treatment/${id}`, formData, {
                headers: {
                  'Content-Type': 'multipart/form-data'
                }
              });
              Swal.fire("Updated!", `Treatment "${result.value.treatmentName}" has been updated.`, "success");
              setTreatments(treatments.map(t => t.treatmentId === id ? { ...t, treatmentName: result.value.treatmentName, isDeleted: result.value.isDeleted } : t)); 
            } catch (error) {
              console.error("Error updating treatment:", error);
              Swal.fire("Error!", "There was an error updating the treatment.", "error");
            }
          }
        });
      }
    }
  };  
  
  const handleDelete = (id) => {
    const treatment = treatments.find(t => t.treatmentId === id);
    if (!treatment) {
      Swal.fire("Error!", "Treatment not found.", "error");
      return;
    } 
  
    Swal.fire({
      title: `Are you sure you want to delete treatment "${treatment.treatmentName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const updatedTreatments = treatments.filter((t) => t.treatmentId !== id);
        setTreatments(updatedTreatments);
  
        try {
          const response = await axios.delete(`http://localhost:5143/api/Treatment/${id}`);
          const successMessage = response.data.message || `Treatment "${treatment.treatmentName}" has been deleted.`;
          Swal.fire("Deleted!", successMessage, "success").then(() => {
            window.location.reload(); 
          });
        } catch (error) {
          console.error("Error deleting treatment:", error);
          const errorMessage = error.response?.data?.message || "There was an issue deleting the treatment.";
          Swal.fire("Error!", errorMessage, "error").then(() => {
            window.location.reload(); 
          });
        }
      }
    });
  };
  ;

  const handleAdd = () => {
    Swal.fire({
      title: "Add New Treatment",
      html: `
        <input type="text" id="add-name" class="swal2-input" placeholder="Treatment Name" />
      `,
      showCancelButton: true,
      confirmButtonText: "Add",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const treatmentName = document.getElementById("add-name").value.trim();
  
        if (!treatmentName) {
          Swal.showValidationMessage("Treatment name cannot be empty!");
          return null;
        }
  
        const isDuplicate = treatments.some((treatment) =>
          treatment.treatmentName.toLowerCase() === treatmentName.toLowerCase()
        );
        if (isDuplicate) {
          Swal.showValidationMessage(`Treatment name "${treatmentName}" already exists!`);
          return null;
        }
  
        return {
          treatmentName: treatmentName,
          isDeleted: false,
        };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const newTreatment = result.value;
  
        try {
          console.log("Data being sent to API:", newTreatment);
          const response = await axios.post("http://localhost:5143/api/Treatment", newTreatment, {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
          });
        
          if (response.status === 200 || response.status === 201) {
            setTreatments((prevTreatments) => [...prevTreatments, response.data]);
            Swal.fire("Success!", `Treatment "${newTreatment.treatmentName}" has been added.`, "success").then(() => {
              window.location.reload();
            });
          } else {
            Swal.fire("Error!", "There was an issue adding the treatment.", "error");
          }
        } catch (error) {
          console.error("Error adding treatment:", error.response?.data || error.message);
          Swal.fire(
            "Error!",
            error.response?.data?.message || "An unknown error occurred.",
            "error"
          );
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
                placeholder="Search Treatments..."
                aria-label="Search treatments"
                value={searchQuery}
                onChange={handleSearch}
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
          <Datatable treatments={filteredTreatments} onDetail={handleDetail} onEdit={handleEdit} onDelete={handleDelete} />
        </main>
      </div>
    </div>
  );
};

export default TreatmentList;
