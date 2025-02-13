import React from "react";
import { Stepper, Step, StepLabel } from "@mui/material";
import { Receipt, DomainVerification, DirectionsRun, FactCheck, Cancel } from "@mui/icons-material";

const steps = [
  { label: "Pending", icon: <Receipt /> },
  { label: "Confirmed", icon: <DomainVerification /> },
  { label: "Processing", icon: <DirectionsRun /> },
  { label: "Completed", icon: <FactCheck /> },
  { label: "Cancelled", icon: <Cancel /> },
];

// Mapping status names to step indexes
const statusToStep = {
  "Pending": 0,
  "Confirmed": 1,
  "Processing": 2,
  "Completed": 3,
  "Cancelled": 4
};

const CustomStepIcon = (props) => {
  const { active, completed, icon } = props;
  return (
    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
      completed || active ? "bg-green-500 text-white" : "bg-white text-green-500"
    } border-green-500`}>
      {steps[Number(icon) - 1].icon}
    </div>
  );
};

const BookingServiceStatus = ({ bookingStatus }) => {
  // Get the active step index from the statusToStep mapping
  const activeStep = statusToStep[bookingStatus] || 0; // Default to 0 if status not found

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg mb-6">
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepLabel StepIconComponent={(props) => <CustomStepIcon {...props} />}>
              <div className="text-center">
                <p className="text-sm font-semibold">{step.label}</p>
              </div>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </div>
  );
};

export default BookingServiceStatus;
