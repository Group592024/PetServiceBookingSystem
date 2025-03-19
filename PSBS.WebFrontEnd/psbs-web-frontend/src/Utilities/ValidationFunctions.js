// validation.js
export const validateNonNegativeInteger = (value) => {
    return parseInt(value) >= 1; // Returns true if valid (>= 0), false otherwise
  };
  
  export const validateVoucherDiscount = (value) => {
    const intValue = parseInt(value);
    return intValue >= 1 && intValue <= 100; // Returns true if valid (0 <= value <= 100)
  };
  
  export const validateVoucherStartDate = (value) => {
    const selectedDate = new Date(value);
    return !isNaN(selectedDate.getTime()); // Returns true if valid date, false otherwise
  };
  
  export const validateVoucherEndDate = (value, data) => {
    const startDate = new Date(data.voucherStartDate);
    const endDate = new Date(value);
    return endDate > startDate; // Returns true if end date is after start date
  };
  