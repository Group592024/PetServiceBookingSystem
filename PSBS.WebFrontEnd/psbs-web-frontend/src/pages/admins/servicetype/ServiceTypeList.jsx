import React, { useState, useEffect, useRef } from "react";
import Navbar from "../../../components/navbar/Navbar";
import Sidebar from "../../../components/sidebar/Sidebar";
import Datatable from "../../../components/ServiceTypes/serviceTypeSource"; 
import Swal from "sweetalert2";
import axios from 'axios';

const ServiceTypeList = () => {
  const [serviceTypes, setServiceTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const sidebarRef = useRef(null);
  const debouncedSearchQuery = useRef(null);

  useEffect(() => {
    const fetchServiceTypes = async () => {
      try {
        const response = await axios.get('http://localhost:5023/api/ServiceType');
        const serviceData = Array.isArray(response.data) ? response.data : response.data.data || [];
        setServiceTypes(serviceData.map(s => ({
          ...s,
          createAt: s.createAt || new Date().toISOString(),
          updateAt: s.updateAt || new Date().toISOString(),
        })));
      } catch (error) {
        console.error("Error fetching service types:", error);
        setServiceTypes([]);
      }
    };
    fetchServiceTypes();
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

  const filteredServiceTypes = serviceTypes.filter((serviceType) =>
    serviceType.typeName && serviceType.typeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDetail = (id) => {
    const serviceType = serviceTypes.find(s => s.serviceTypeId === id);
    if (serviceType) {
      Swal.fire({
        title: `Service Type Detail`,
        html: `
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <p><strong>Type Name:</strong> ${serviceType.typeName}</p>
            <p><strong>Description:</strong></p>
            <pre style="white-space: pre-wrap; word-wrap: break-word; max-height: 200px; overflow-y: auto;">${serviceType.description}</pre>
            <p><strong>Created At:</strong> ${new Date(serviceType.createAt).toLocaleString()}</p>
            <p><strong>Updated At:</strong> ${new Date(serviceType.updateAt).toLocaleString()}</p>
            <p><strong>Status:</strong> <span style="color: ${serviceType.isDeleted ? 'red' : 'green'}; font-weight: bold;">${serviceType.isDeleted ? 'Inactive' : 'Active'}</span></p>
          </div>
        `,
        icon: "info",
        confirmButtonText: "Close",
      });
    }
  };
   
  const handleEdit = (id) => {
    const serviceType = serviceTypes.find(s => s.serviceTypeId === id);
    if (serviceType) {
      Swal.fire({
        title: `Edit Service Type`,
        html: `
          <div>
            <p><strong>Type Name:</strong></p>
            <input type="text" id="edit-name" class="swal2-input" value="${serviceType.typeName}" />
          </div>
          <div>
            <p><strong>Description:</strong></p>
            <textarea id="edit-description" class="swal2-input" style="width: 100%; height: 150px; border: 2px solid #ccc; border-radius: 4px; padding: 10px; box-sizing: border-box;">${serviceType.description}</textarea>
          </div>
          <div>
            <strong>Status:</strong>
            <label>
              <input type="radio" id="edit-status-active" name="edit-status" value="false" ${!serviceType.isDeleted ? "checked" : ""} />
              <span style="color: green;">Active</span>
            </label>
            <label>
              <input type="radio" id="edit-status-inactive" name="edit-status" value="true" ${serviceType.isDeleted ? "checked" : ""} />
              <span style="color: red;">Inactive</span>
            </label>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Save Changes",
        preConfirm: () => {
          const name = document.getElementById('edit-name').value;
          const description = document.getElementById('edit-description').value;
          const isDeleted = document.querySelector('input[name="edit-status"]:checked').value === "true";
  
          if (!name.trim()) {
            Swal.showValidationMessage("Service type name cannot be empty!");
            return null;
          }
  
          if (!description.trim()) {
            Swal.showValidationMessage("Description cannot be empty!");
            return null;
          }
  
          const isDuplicate = serviceTypes.some((service) =>
            service.serviceTypeId !== id && service.typeName.toLowerCase() === name.trim().toLowerCase()
          );
          if (isDuplicate) {
            Swal.showValidationMessage(`Service type name "${name.trim()}" already exists!`);
            return null;
          }
  
          return {
            serviceTypeId: id,
            typeName: name,
            description,
            isDeleted,
            createAt: serviceType.createAt,
            updateAt: new Date().toISOString(),
          };
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const formData = new FormData();
            formData.append("serviceTypeId", result.value.serviceTypeId);
            formData.append("typeName", result.value.typeName);
            formData.append("description", result.value.description);
            formData.append("isDeleted", result.value.isDeleted);
            formData.append("createAt", result.value.createAt);
            formData.append("updateAt", result.value.updateAt); 
  
            await axios.put(`http://localhost:5023/api/ServiceType/${id}`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
  
            Swal.fire("Updated!", `Service Type "${result.value.typeName}" has been updated.`, "success");
  
            setServiceTypes(serviceTypes.map(s =>
              s.serviceTypeId === id ? { ...s, ...result.value } : s
            ));
          } catch (error) {
            Swal.fire("Error!", "There was an error updating the service type.", "error");
          }
        }
      });
    }
  };

  const handleDelete = (id) => {
    const serviceType = serviceTypes.find(s => s.serviceTypeId === id);
    if (!serviceType) {
      Swal.fire("Error!", "Service Type not found.", "error");
      return;
    }  
    Swal.fire({
      title: `Are you sure you want to delete service type "${serviceType.typeName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const updatedServiceTypes = serviceTypes.filter(s => s.serviceTypeId !== id);
        setServiceTypes(updatedServiceTypes);
  
        try {
          const response = await axios.delete(`http://localhost:5023/api/ServiceType/${id}`);
          const successMessage = response.data.message || `Service Type "${serviceType.typeName}" has been deleted.`;
          Swal.fire("Deleted!", successMessage, "success").then(() => {
            window.location.reload(); 
          });
        } catch (error) {
          console.error("Error deleting service type:", error);
          const errorMessage = error.response?.data?.message || "There was an issue deleting the service type.";
          Swal.fire("Error!", errorMessage, "error").then(() => {
            window.location.reload(); 
          });
        }
      }
    });
  };
  
  const handleAdd = () => {
    Swal.fire({
      title: "Add New Service Type",
      html: `
        <input type="text" id="add-name" class="swal2-input" placeholder="Service Type Name" />
        <textarea id="add-description" class="swal2-textarea" placeholder="Description"></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: "Add",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const name = document.getElementById("add-name").value;
        const description = document.getElementById("add-description").value;
  
        if (!name.trim()) {
          Swal.showValidationMessage("Service type name cannot be empty!");
          return null;
        }
  
        const isDuplicate = serviceTypes.some((service) => service.typeName.toLowerCase() === name.trim().toLowerCase());
        if (isDuplicate) {
          Swal.showValidationMessage(`Service type name "${name.trim()}" already exists!`);
          return null;
        }
  
        if (!description.trim()) {
          Swal.showValidationMessage("Description cannot be empty!");
          return null;
        }
  
        return {
          typeName: name.trim(),
          description: description.trim(),
          isDeleted: false,
        };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const formData = new FormData();
        formData.append("typeName", result.value.typeName);
        formData.append("description", result.value.description);
        formData.append("isDeleted", result.value.isDeleted);
  
        try {
          const response = await axios.post("http://localhost:5023/api/ServiceType", formData);         
          if (response.status === 200 || response.status === 201) {
            setServiceTypes((prevServiceTypes) => [...prevServiceTypes, response.data]);
            Swal.fire("Success!", `Service Type "${result.value.typeName}" has been added.`, "success").then(() => {
              window.location.reload();
            });
          } else {
            Swal.fire("Error!", "There was an issue adding the service type.", "error");
          }
        } catch (error) {
          console.error("Error adding service type:", error);
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
                placeholder="Search Service Types..."
                aria-label="Search service types"
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
            serviceTypes={filteredServiceTypes}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDetail={handleDetail}
          />
        </main>
      </div>
    </div>
  );
};

export default ServiceTypeList;
