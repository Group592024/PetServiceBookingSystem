import React, { useState, useEffect } from "react";
import { Button, Stepper, Step, StepLabel } from "@mui/material";
import BookingStyleStep from "../../../components/Booking/add-form/BookingStyleStep";
import BookingInformationStep from "../../../components/Booking/add-form/BookingInformationStep";
import BookingRoomForm from "../../../components/Booking/add-form/BookingRoomForm";
import BookingServiceForm from "../../../components/Booking/add-form/BookingServiceForm";
import BookingConfirmStep from "../../../components/Booking/add-form/BookingConfirmStep";
import NavbarCustomer from "../../../components/navbar-customer/NavbarCustomer";
import jwtDecode from "jwt-decode";

const steps = ["Booking Type", "Booking Details", "Booking Information", "Confirm Booking"];

const AddBooking = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState("Room");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
    paymentMethod: "In Cash",
  });

  const [rooms, setRooms] = useState([
    { roomId: '', name: 'Deluxe Room', description: 'A spacious room with ocean view.' },
    { roomId: '', name: 'Standard Room', description: 'A comfortable room with city view.' }
  ]);
  
  const [services, setServices] = useState([
    { serviceId: '', name: 'Spa Service', description: 'A relaxing spa treatment.' },
    { serviceId: '', name: 'Room Cleaning', description: 'Cleaning of the room during your stay.' }
  ]);

  const [loading, setLoading] = useState(true);

  // Fetch user data
  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
  
      try {
        const decodedToken = jwtDecode(token); 
        const accountId = decodedToken.AccountId; 
  
        if (!accountId) {
          setLoading(false);
          return;
        }
  
        const response = await fetch(`http://localhost:5000/api/Account?AccountId=${accountId}`);
        
        if (!response.ok) throw new Error("Failed to fetch account data");
        
        const data = await response.json();
        
        if (data) {
          setFormData((prevData) => ({
            ...prevData,
            name: data.accountName || "",
            address: data.accountAddress || "",
            phone: data.accountPhoneNumber || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <BookingStyleStep selectedOption={selectedOption} handleOptionChange={handleOptionChange} />;
      case 1:
        return selectedOption === "Room" ? (
          <BookingRoomForm rooms={rooms} formData={formData} handleChange={handleChange} />
        ) : (
          <BookingServiceForm services={services} formData={formData} handleChange={handleChange} />
        );
      case 2:
        return <BookingInformationStep formData={formData} handleChange={handleChange} loading={loading} />;
      case 3:
        return <BookingConfirmStep
          formData={formData}
          selectedOption={selectedOption}
          servicesOrRooms={selectedOption === 'Room' ? rooms : services}
        />;
      default:
        return <div>Unknown Step</div>;
    }
  };

  return (
    <div>
      <NavbarCustomer />
      <div className="p-6 bg-gray-100 h-screen flex flex-col items-center">
        <h1 className="text-xl font-bold mb-4">New Booking</h1>
        <Stepper activeStep={activeStep} alternativeLabel className="w-full max-w-2xl">
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel>
                <span className={activeStep === index ? "text-green-500 font-semibold" : ""}>{label}</span>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg mt-6 p-6">
          {renderStepContent(activeStep)}
          <div className="flex justify-between mt-6">
            <Button onClick={handleBack} variant="contained" color="secondary" disabled={activeStep === 0}>
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
