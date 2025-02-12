import React, { useState, useContext, useEffect } from "react";
import { Button, Stepper, Step, StepLabel } from "@mui/material";
import BookingStyleStep from "../../../components/Booking/add-form/BookingStyleStep";
import BookingInformationStep from "../../../components/Booking/add-form/BookingInformationStep";
import BookingRoomForm from "../../../components/Booking/add-form/BookingRoomForm";
import BookingServiceForm from "../../../components/Booking/add-form/BookingServiceForm";
import BookingConfirmStep from "../../../components/Booking/add-form/BookingConfirmStep";
import NavbarCustomer from "../../../components/navbar-customer/NavbarCustomer";
import { BookingContext } from "../../../components/Booking/add-form/BookingContext";
import jwtDecode from "jwt-decode";

const steps = [
  "Booking Type",
  "Booking Details",
  "Booking Information",
  "Confirm Booking",
];

const AddBooking = () => {
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

  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem("token");
      // if (!token) {
      //   setLoading(false);
      //   return;
      // }

      try {
        const decodedToken = jwtDecode(token);
        const accountId = decodedToken.AccountId;

        // if (!accountId) {
        //   setLoading(false);
        //   return;
        // }

        const response = await fetch(
          `http://localhost:5000/api/Account?AccountId=${accountId}`
        );

        if (!response.ok) throw new Error("Failed to fetch account data");

        const data = await response.json();

        if (data) {
          setFormData((prevData) => ({
            ...prevData,
            cusId: accountId || "",
            name: data.accountName || "",
            address: data.accountAddress || "",
            phone: data.accountPhoneNumber || "",
            note: "",
            paymentMethod: "In Cash",
          }));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        // setLoading(false);
      }
    };

    fetchData();
  }, [setFormData]);

  const [activeStep, setActiveStep] = useState(0);

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      console.log("Preparing to send booking data to API...");

      let requestData = {};
      let apiUrl = "";
      let paymentTypeName = "";
      if (formData.paymentMethod) {
        const response = await fetch(`http://localhost:5115/api/PaymentType/${formData.paymentMethod}`);
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
        alert("Invalid booking type selected.");
        return;
      }

      console.log("Request Payload:", JSON.stringify(requestData, null, 2)); // Log data before sending

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
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
              "OrderType": "billpayment",
              OrderDescription: bookingCode.trim(),
            });

            console.log("BookingCode Response:", bookingCode);
            const vnpayResponse = await fetch("http://localhost:5115/Bookings/VNPay", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                Name: formData.name,
                Amount: discountedPrice,
                OrderType: "other",
                OrderDescription: bookingCode.trim(),
              }),
            });
                        
            const vnpayResult = await vnpayResponse.json();
            console.log("VNPay API Response:", vnpayResult.data);

            if (vnpayResult.flag && vnpayResult.data) {
              // window.location.href = vnpayResult.data;
              return;
            } else {
              alert("VNPay payment failed!");
            }
          }
          alert("Booking confirmed successfully!");
          // window.location.href = "/bookings"; 
        } else {
          throw new Error(result.message || "Failed to submit booking");
        }
      } catch (error) {
        console.error("Error submitting booking:", error);
        alert("Failed to confirm booking.");
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
        return selectedOption === "Room" ? (
          <BookingRoomForm />
        ) : (
          <BookingServiceForm />
        );
      case 2:
        return (
          <BookingInformationStep
            formData={formData}
            setFormData={setFormData}
            loading={loading}
          />
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
      <NavbarCustomer />
      <div className="p-6 bg-gray-100 h-screen flex flex-col items-center">
        <h1 className="text-xl font-bold mb-4">New Booking</h1>
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
  );
};

export default AddBooking;
