using FacilityServiceApi.Application.DTO;
using FacilityServiceApi.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FacilityServiceApi.Application.DTOs.Conversions
{
    public static class CameraConversion
    {
        public static Camera ToEntity(CameraDTO camera)
        {
            return new Camera()
            {
                cameraId = camera.cameraId,
                cameraType = camera.cameraType,
                cameraCode = camera.cameraCode,
                cameraStatus = camera.cameraStatus,
                rtspUrl = camera.rtspUrl,
                cameraAddress = camera.cameraAddress,
                isDeleted = camera.isDeleted
            };
        }

        public static (CameraDTO?, IEnumerable<CameraDTO>?) FromEntity(Camera? camera, IEnumerable<Camera>? cameras)
        {
            if (camera is not null && cameras is null)
            {
                var singleCamera = new CameraDTO
                (
                     camera.cameraId,
                    camera.cameraType,
                    camera.cameraCode,
                    camera.cameraStatus,
                    camera.rtspUrl,
                    camera.cameraAddress,
                    camera.isDeleted);


                return (singleCamera, null);
            }

            if (cameras is null && camera is not null)
            {
                var _cameras = cameras.Select(p => new CameraDTO
                (p.cameraId,
                    p.cameraType,
                    p.cameraCode,
                    p.cameraStatus,
                    p.rtspUrl,
                    p.cameraAddress,
                    p.isDeleted)

                ).ToList();

                return (null, _cameras);
            }

            return (null, null);
        }
    }
}
