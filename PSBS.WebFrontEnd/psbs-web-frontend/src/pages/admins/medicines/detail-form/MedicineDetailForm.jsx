import React, { useState, useRef, useEffect } from "react";
import { TextField, Autocomplete, Button } from "@mui/material";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

function MedicineDetailForm() {
  const sidebarRef = useRef(null);
  const { medicineId } = useParams(); // Extract medicineId from the URL
  const [medicine, setMedicine] = useState({
    medicineName: "",
    treatmentFor: "",
    medicineImage: "",
    isDeleted: false,
  });
  const [loading, setLoading] = useState(true);
  const [treatmentOptions, setTreatmentOptions] = useState([]);
  const navigate = useNavigate();
  
  const getToken = () => {
    return sessionStorage.getItem('token');
  };

  useEffect(() => {
    const fetchMedicineDetail = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5050/Medicines/${medicineId}`, {
            headers: {
              Authorization: `Bearer ${getToken()}`
            }
          }
        );

        if (response.data.flag) {
          setMedicine(response.data.data);
        } else {
          toast.error(response.data.message || "Medicine not found");
        }
      } catch (error) {
        console.error("Error fetching medicine details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicineDetail();
  }, [medicineId]);

  const handleBackToList = () => {
    navigate("/medicines");
  };

  if (loading) {
    return <div class="flex items-center justify-center h-svh">
    <div role="status">
      <svg
        aria-hidden="true"
        class="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-purple-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span class="sr-only">Loading...</span>
    </div>
  </div>;
  }

  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div className="content">
        <Navbar sidebarRef={sidebarRef} />
        <div className="flex justify-center items-center min-h-screen bg-dark-grey-100 p-4">
          <div className="flex w-full sm:w-96 bg-white rounded-lg shadow-lg p-6">
            {/* Form Card */}
            <div className="w-full flex flex-col justify-between">
              <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
                Medicine Detail
              </h2>
              <form>
                {/* Medicine Name TextField */}
                <div className="mb-4">
                  <TextField
                    label="Medicine Name"
                    variant="outlined"
                    fullWidth
                    value={medicine.medicineName}
                    InputProps={{
                      readOnly: true,
                    }}
                    className="bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Treatment For Autocomplete */}
                <div className="mb-4">
                  <TextField
                    label="Treatment Name"
                    variant="outlined"
                    fullWidth
                    value={medicine.treatmentName}
                    InputProps={{
                      readOnly: true,
                    }}
                    className="bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Status */}
                <div className="mb-4">
                  <TextField
                    label="Treatment Status"
                    variant="outlined"
                    fullWidth
                    value={medicine.medicineStatus ? "Inactive" : "Active"}
                    InputProps={{
                      readOnly: true,
                    }}
                    className="bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>


                {/* Display Image */}
                {medicine.medicineImage && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                      Medicine Image
                    </h3>
                    <img
                      src={`http://localhost:5003${medicine.medicineImage}`}
                      alt="Medicine"
                      className="w-full h-64 object-contain rounded-lg shadow-lg"
                    />
                  </div>
                )}

                {/* Back Button */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleBackToList}
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition ease-in-out duration-200"
                  >
                    Back to List
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
}

export default MedicineDetailForm;
