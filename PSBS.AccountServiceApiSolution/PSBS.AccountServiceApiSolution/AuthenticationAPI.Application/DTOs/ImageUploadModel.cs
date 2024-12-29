using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PSPS.Application.DTOs
{
    public record ImageUploadModel
    (IFormFile ImageFile);
        
}
