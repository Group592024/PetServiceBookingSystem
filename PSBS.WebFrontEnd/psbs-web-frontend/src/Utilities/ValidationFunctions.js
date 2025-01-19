// validation.js
export const validateNonNegativeInteger = (value) => {
    return parseInt(value) >= 1; // Returns true if valid (>= 0), false otherwise
  };
  
  export const validateVoucherDiscount = (value) => {
    const intValue = parseInt(value);
    return intValue >= 1 && intValue <= 100; // Returns true if valid (0 <= value <= 100)
  };
  
  export const validateVoucherStartDate = (value) => {
    const today = new Date();
    const selectedDate = new Date(value);
    return selectedDate >= today.setDate(today.getDate() + 1); // Returns true if valid (>= tomorrow)
  };
  
  export const validateVoucherEndDate = (value, data) => {
    const startDate = new Date(data.voucherStartDate);
    const endDate = new Date(value);
    return endDate > startDate; // Returns true if end date is after start date
  };
  