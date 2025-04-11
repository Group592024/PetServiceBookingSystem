using FacilityServiceApi.Application.DTOs;
using FacilityServiceApi.Domain.Entities;
using PSPS.SharedLibrary.Interface;
using PSPS.SharedLibrary.Responses;

namespace FacilityServiceApi.Application.Interfaces
{
    public interface ICamera : IGenericInterface<Camera>
    {
    Task<Response> AssignCamera(AssignCameraDTO cameraDTO);
    }
}
