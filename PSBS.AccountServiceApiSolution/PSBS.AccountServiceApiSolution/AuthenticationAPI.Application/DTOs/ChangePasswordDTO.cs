using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PSPS.Application.DTOs
{
    public record ChangePasswordDTO
    (
    [Required] string CurrentPassword,
    [Required] string NewPassword,
    [Required] string ConfirmPassword
    );
}
