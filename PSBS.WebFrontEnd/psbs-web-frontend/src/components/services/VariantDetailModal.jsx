import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { Box, Modal, TextField } from "@mui/material";

const VariantDetailModal = ({ id, open, handleClose }) => {
  const navigate = useNavigate();

  const sidebarRef = useRef(null);

  const [variant, setVariant] = useState({});
  const [selectedOption, setSelectedOption] = useState(variant.isDeleted);

  useEffect(() => {
    const fetchDataUpdate = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const data = await fetch(
          `http://localhost:5050/api/ServiceVariant/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        ).then((response) => response.json());

        console.log("day la data", data);
        setVariant(data.data);
        setSelectedOption(data.data.isDeleted);
      } catch (error) {
        console.error("Failed fetching api", error);
        Swal.fire(
          "Update Service Variant",
          "Failed to load the service variant data!",
          "error"
        );
      }
    };

    fetchDataUpdate();
  }, []);

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        data-testid="variant-detail-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "50%",
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <main>
            <div className="header">
              <div className="left flex justify-center w-full">
                <h1 className="text-3xl font-bold p-5">
                  Service Variant Detail
                </h1>
              </div>
            </div>

            <div className="p-10 bg-customLightPrimary rounded-lg ">
              <div className="p-10  bg-customLight rounded-3xl">
                <div>
                  <p className="font-semibold text-2xl ">Service Content:</p>
                  <TextField
                    type="text"
                    value={variant.serviceContent}
                    slotProps={{
                      input: {
                        readOnly: true,
                      },
                    }}
                    sx={{
                      borderRadius: "10px",
                      marginBottom: "20px",
                      marginTop: "20px",
                    }}
                    className=" rounded-3xl p-3 m-10 w-full"
                  />
                </div>
                <div>
                  <p className="font-semibold text-2xl ">Service Price:</p>
                  <TextField
                    type="text"
                    sx={{
                      borderRadius: "10px",
                      marginBottom: "20px",
                      marginTop: "20px",
                    }}
                    slotProps={{
                      input: {
                        readOnly: true,
                      },
                    }}
                    multiline
                    className="rounded-3xl p-3 m-5
                    w-full resize-none"
                    rows="7"
                    value={variant.servicePrice}
                  />
                </div>
                <div className="p-5 ">
                  <p className="font-semibold text-2xl ">
                    Service Variant Status:
                  </p>
                  <div>
                    <label>
                      <input
                        type="radio"
                        name="petTypeStatus"
                        value="false"
                        checked={selectedOption === false}
                      />
                      Active
                    </label>
                  </div>
                  <div>
                    <label>
                      <input
                        type="radio"
                        name="petTypeStatus"
                        value="true"
                        checked={selectedOption === true}
                      />
                      Inactive
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </Box>
      </Modal>
    </div>
  );
};

export default VariantDetailModal;
