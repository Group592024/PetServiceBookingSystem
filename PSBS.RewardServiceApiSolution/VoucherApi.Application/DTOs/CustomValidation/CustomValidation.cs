using System;
using System.ComponentModel.DataAnnotations;

namespace VoucherApi.Application.DTOs.CustomValidation
{
    // Custom validation for VoucherStartDate to ensure it's at least 1 day ahead
    public class CustomDateValidationAttribute : ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value is DateTime date)
            {
                if (date <= DateTime.UtcNow.AddDays(1))
                {
                    return new ValidationResult("VoucherStartDate must be at least one day ahead of the current date.");
                }
            }

            return ValidationResult.Success;
        }
    }


    public class CompareDatesAttribute : ValidationAttribute
    {
        private readonly string _startDatePropertyName;

        public CompareDatesAttribute(string startDatePropertyName)
        {
            _startDatePropertyName = startDatePropertyName;
        }

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            var startDateProperty = validationContext.ObjectType.GetProperty(_startDatePropertyName);
            if (startDateProperty == null)
            {
                return new ValidationResult($"Property '{_startDatePropertyName}' not found.");
            }

            var startDateValue = startDateProperty.GetValue(validationContext.ObjectInstance);
            if (startDateValue is DateTime startDate && value is DateTime endDate)
            {
                if (endDate <= startDate)
                {
                    return new ValidationResult("VoucherEndDate must be later than VoucherStartDate.");
                }
            }

            return ValidationResult.Success;
        }
    }
}

