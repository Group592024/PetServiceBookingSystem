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

  useEffect(() => {
    const fetchMedicineDetail = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5003/Medicines/${medicineId}`
        );

        if (response.data.flag) {
          setMedicine(response.data.data);
          toast.success(
            response.data.message || "Medicine data fetched successfully!"
          );
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
    return <div>Loading...</div>;
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
