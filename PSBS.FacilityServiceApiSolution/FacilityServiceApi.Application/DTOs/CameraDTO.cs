using FacilityServiceApi.Domain.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FacilityServiceApi.Application.DTOs
{
    public record CameraDTO
    (
        Guid cameraId,
        string cameraType,
        string cameraCode,
        string cameraStatus,
        string rtspUrl,
        string cameraAddress,
        bool isDeleted
        );


}
