import React, { useState, useContext, useEffect, useRef } from "react";
import { Button, Stepper, Step, StepLabel } from "@mui/material";
import jwtDecode from "jwt-decode";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Navbar from "../../../../components/navbar/Navbar";
import AdminBookingInformation from "../../../../components/Booking/add-form/AdminBookingInformation";
import BookingConfirmStep from "../../../../components/Booking/add-form/BookingConfirmStep";
import BookingRoomForm from "../../../../components/Booking/add-form/BookingRoomForm";
import BookingServiceForm from "../../../../components/Booking/add-form/BookingServiceForm";
import BookingStyleStep from "../../../../components/Booking/add-form/BookingStyleStep";
import { BookingContext } from "../../../../components/Booking/add-form/BookingContext";
import Swal from "sweetalert2";

const steps = [
  "Booking Type",
  "Booking Information",
  "Booking Details",
  "Confirm Booking",
];

const Admin_Add_Booking = () => {
  const sidebarRef = useRef(null);
  const {
    selectedOption,
    setSelectedOption,
    bookingData,
    setBookingData,
    formData,
    setFormData,
    loading,
    bookingRooms,
    setBookingRooms,
    voucherId,
    totalPrice,
    discountedPrice,
    finalDiscount,
    bookingServices,
    setbookingServices,
    bookingServicesDate,
    setbookingServicesDate,
  } = useContext(BookingContext);

  const getToken = () => {
    return sessionStorage.getItem('token');
};

  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      try {
        const decodedToken = jwtDecode(token);
        const accountId = decodedToken.AccountId;

        const response = await fetch(
          `http://localhost:5050/api/Account?AccountId=${accountId}`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch account data");

        const data = await response.json();

        if (data) {
          setFormData((prevData) => ({
            ...prevData,
            cusId: "",
            name: "",
            address: "",
            phone: "",
            note: " ",
            paymentMethod: "",
          }));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, [setFormData]);

  const [activeStep, setActiveStep] = useState(0);

  const handleNext = async () => {
    if (activeStep === 0 && !selectedOption) {
      alert("Please select a booking type before proceeding.");
      return;
    }

    if (activeStep === 1 && !formData.phone) {
        if(!formData.name ||!formData.address ||!formData.paymentMethod)
        alert("Please fill all input and select payment type before proceeding.");
        return;
    }
    if (activeStep === 2 && selectedOption === "Room") {
      if (bookingRooms.length === 0) {
        alert("Please add at least one booking room.");
        return;
      }

      // Validate each booking room
      for (const roomData of bookingRooms) {
        if (
          !roomData.room ||
          !roomData.pet ||
          !roomData.start ||
          !roomData.end
        ) {
          alert("Please fill in all fields for each booking room.");
          return;
        }

        const now = new Date();
        const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);
        const selectedStartDateTime = new Date(roomData.start);
        const selectedEndDateTime = new Date(roomData.end);

        console.log("Current Time:", now);
        console.log("Selected Start Date:", selectedStartDateTime);
        console.log("Selected End Date:", selectedEndDateTime);

        // Check if start date is at least 1 hour from now
        if (selectedStartDateTime < fiveMinutesLater) {
          Swal.fire(
                    "Failed!",
                    `Booking start time must be at least 5 minutes from now.`,
                    "error"
                  );
          return;
        }

        // Check if end time is after the start time
        if (selectedStartDateTime >= selectedEndDateTime) {
          Swal.fire(
            "Failed!",
            `Booking end time must be after the start time.`,
            "error"
          );
          return;
        }
      }
    }

    if (activeStep === 2 && selectedOption === "Service") {
      if (bookingServices.length === 0) {
        Swal.fire(
          "Failed!",
          `Please add at least one booking service`,
          "error"
        );
        return;
      }

      // Validate each booking service
      for (const serviceData of bookingServices) {
        if (
          !serviceData.service ||
          !serviceData.pet ||
          serviceData.price <= 0 ||
          !serviceData.serviceVariant
        ) {
          Swal.fire(
            "Failed!",
            `Please fill in all fields for each booking service`,
            "error"
          );
          return;
        }
      }

      // Check if booking date is selected and valid
      if (!bookingServicesDate) {
        Swal.fire(
          "Failed!",
          `Please select a booking date and time`,
          "error"
        );
        return;
      }
    }

    if (activeStep === steps.length - 1) {
      console.log("Submitting booking data...");
      let requestData = {};
      let apiUrl = "";
      let paymentTypeName = "";
      if (formData.paymentMethod) {
        const response = await fetch(
          `http://localhost:5050/api/PaymentType/${formData.paymentMethod}`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );
        const data = await response.json();
        if (data.flag) {
          paymentTypeName = data.data.paymentTypeName;
        }
      }

      if (selectedOption === "Room") {
        apiUrl = "http://localhost:5115/Bookings/room";
        requestData = {
          bookingRooms: bookingRooms, // All booking details
          customer: formData, // Include customer information
          selectedOption, // Room or Service
          voucherId: voucherId || "00000000-0000-0000-0000-000000000000",
          totalPrice,
          discountedPrice,
        };
      } else if (selectedOption === "Service") {
        apiUrl = "http://localhost:5115/Bookings/service";
        requestData = {
          services: bookingServices,
          customer: formData,
          selectedOption,
          voucherId: voucherId || "00000000-0000-0000-0000-000000000000",
          totalPrice,
          discountedPrice,
          bookingServicesDate,
        };
      } else {
        Swal.fire(
          "Failed!",
          `Invalid booking type selected`,
          "error"
        );
        return;
      }

      console.log("Request Payload:", JSON.stringify(requestData, null, 2)); // Log data before sending
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        const result = await response.json();
        console.log("API Response:", result);

        if (result.flag) {
          if (paymentTypeName === "VNPay") {
            const bookingCode = result.data;
            console.log("VNPay Request Data:", {
              Name: formData.name,
              Amount: discountedPrice,
              OrderType: "billpayment",
              OrderDescription: bookingCode.trim(),
            });

            console.log("BookingCode Response:", bookingCode);
            const vnpayUrl = `https://localhost:5201/Bookings/CreatePaymentUrl?moneyToPay=${Math.round(
              discountedPrice
            )}&description=${bookingCode.trim()}&returnUrl=https://localhost:5201/Vnpay/Callback/admin`;
            
            console.log("VNPay URL:", vnpayUrl);

            const vnpayResponse = await fetch(vnpayUrl, {
              method: "GET",
              headers: { "Content-Type": "application/json" },
            });

            const vnpayResult = await vnpayResponse.text();
            console.log("VNPay API Response:", vnpayResult);
            
            if (vnpayResult.startsWith("http")) {
              window.location.href = vnpayResult;
              return;
            } else {
              alert("VNPay payment failed!");
            }
          }
          window.location.href = "/admin/bookings";
        } else{
          Swal.fire("Failed!", result.message || "Could not create booking.", "error");
        }
      } catch (error) {
          Swal.fire("Error!", "Failed to confirm booking", "error");
      }
    } else {
      setActiveStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <BookingStyleStep
            selectedOption={selectedOption}
            handleOptionChange={(e) => setSelectedOption(e.target.value)}
          />
        );
      case 1:
        return (
          <AdminBookingInformation
            formData={formData}
            setFormData={setFormData}
            loading={loading}
          />
        );
      case 2:
        return selectedOption === "Room" ? (
          <BookingRoomForm />
        ) : (
          <BookingServiceForm />
        );

      case 3:
        return (
          <BookingConfirmStep
            formData={formData}
            selectedOption={selectedOption}
            bookingData={bookingData}
          />
        );
      default:
        return <div>Unknown Step</div>;
    }
  };

  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div className="listContainer content">
        <Navbar sidebarRef={sidebarRef} />
        <div className="p-6 bg-gray-100 h-screen flex flex-col items-center">
          <h1 className="text-xl font-bold mb-4">Admin New Booking</h1>
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            className="w-full max-w-2xl"
          >
            {steps.map((label, index) => (
              <Step key={index}>
                <StepLabel>
                  <span
                    className={
                      activeStep === index ? "text-green-500 font-semibold" : ""
                    }
                  >
                    {label}
                  </span>
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg mt-6 p-6">
            {renderStepContent(activeStep)}
            <div className="flex justify-between mt-6">
              <Button
                onClick={handleBack}
                variant="contained"
                color="secondary"
                disabled={activeStep === 0}
              >
                Back
              </Button>
              <Button onClick={handleNext} variant="contained" color="primary">
                {activeStep === steps.length - 1 ? "Finish" : "Next"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin_Add_Booking;
