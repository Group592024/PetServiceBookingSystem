import React from "react";
import { Stepper, Step, StepLabel } from "@mui/material";
import { Receipt, DomainVerification, OtherHouses, Logout, Cancel } from "@mui/icons-material";

const steps = [
  { label: "Pending", icon: <Receipt /> },
  { label: "Confirmed", icon: <DomainVerification /> },
  { label: "Checked in", icon: <OtherHouses /> },
  { label: "Checked out", icon: <Logout /> },
  { label: "Cancelled", icon: <Cancel /> },
];

const statusToStep = {
  "Pending": 0,
  "Confirmed": 1,
  "Checked in": 2,
  "Checked out": 3,
  "Cancelled": 4,
};

const CustomStepIcon = ({ active, completed, icon }) => {
  return (
    <div
      className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300
        ${completed || active
          ? "bg-gradient-to-tr from-green-500 to-green-400 text-white shadow-lg scale-105"
          : "bg-gray-100 text-green-600 border-gray-300"
        }`}
    >
      {steps[Number(icon) - 1].icon}
    </div>
  );
};

const BookingRoomStatus = ({ bookingStatus }) => {
  const activeStep = statusToStep[bookingStatus] || 0;
  const filteredSteps =
    bookingStatus === "Cancelled" ? steps : steps.filter((s) => s.label !== "Cancelled");

  return (
    <div className="p-6 bg-white shadow-xl rounded-2xl mb-10">
      <Stepper activeStep={activeStep} alternativeLabel>
        {filteredSteps.map((step, index) => (
          <Step key={index}>
            <StepLabel StepIconComponent={(props) => <CustomStepIcon {...props} />}>
              <p className="text-xs text-gray-700 font-semibold mt-3 tracking-wide">{step.label}</p>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </div>
  );
};

export default BookingRoomStatus;
