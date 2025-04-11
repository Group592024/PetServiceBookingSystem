using FacilityServiceApi.Application.DTOs;
using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.Responses;
using System.Linq.Expressions;
namespace FacilityServiceApi.Infrastructure.Repositories
{
    public class CameraReponsitory(FacilityServiceDbContext context) : ICamera
    {
        public async Task<Response> CreateAsync(Camera entity)
        {
            try
            {
                var exists = await context.Camera
           .AnyAsync(c => c.cameraCode == entity.cameraCode && !c.isDeleted);

                if (exists)
                    return new Response(false, "Camera Name already exists");
                context.Camera.Add(entity);
                await context.SaveChangesAsync();

                return new Response(true, "Camera created successfully")
                {
                    Data = entity
                };
            }
            catch (DbUpdateException dbEx)
            {
                return new Response(false, $"Database Error: {dbEx.InnerException?.Message}");
            }
            catch (Exception ex)
            {
                return new Response(false, $"General Error: {ex.Message}");
            }
        }


        public async Task<Response> UpdateAsync(Camera entity)
        {
            try
            {
                var existingCamera = await context.Camera.FindAsync(entity.cameraId);
                if (existingCamera == null)
                    return new Response(false, "Camera not found");
                var duplicate = await context.Camera
            .AnyAsync(c => c.cameraCode == entity.cameraCode && c.cameraId != entity.cameraId && !c.isDeleted);

                if (duplicate)
                    return new Response(false, "Camera Name already exists for another camera");

                existingCamera.cameraType = entity.cameraType;
                existingCamera.cameraCode = entity.cameraCode;
                existingCamera.cameraStatus = entity.cameraStatus;
                existingCamera.rtspUrl = entity.rtspUrl;
                existingCamera.cameraAddress = entity.cameraAddress;
                existingCamera.isDeleted = entity.isDeleted;

                context.Camera.Update(existingCamera);
                await context.SaveChangesAsync();

                return new Response(true, "Camera updated successfully") { Data = existingCamera };
            }
            catch (DbUpdateException dbEx)
            {
                return new Response(false, $"Database Error: {dbEx.InnerException?.Message}");
            }
            catch (Exception ex)
            {
                return new Response(false, $"General Error: {ex.Message}");
            }
        }

        public async Task<Response> DeleteAsync(Camera entity)
        {
            try
            {
                var camera = await context.Camera.FindAsync(entity.cameraId);
                if (camera == null)
                    return new Response(false, "Camera not found");

                if (!camera.isDeleted)
                {
                    camera.isDeleted = true;
                    context.Camera.Update(camera);
                    await context.SaveChangesAsync();
                    return new Response(true, "Camera soft-deleted successfully") { Data = camera };
                }
                else
                {
                    context.Camera.Remove(camera);
                    await context.SaveChangesAsync();
                    return new Response(true, "Camera hard-deleted successfully") { Data = camera };
                }
            }
            catch (Exception ex)
            {
                return new Response(false, $"Error deleting camera: {ex.Message}");
            }
        }





        public async Task<IEnumerable<Camera>> GetAllAsync()
        {
            return await context.Camera.ToListAsync();

        }

        public async Task<Camera?> GetByAsync(Expression<Func<Camera, bool>> predicate)
        {
            return await context.Camera.FirstOrDefaultAsync(predicate);
        }


        public async Task<Camera> GetByIdAsync(Guid id)
        {
            return await context.Camera.FirstOrDefaultAsync(c => c.cameraId == id);
        }

        public async Task<Response> AssignCamera(AssignCameraDTO cameraDTO)
        {
            try
            {
                var roomHistory = await context.RoomHistories.FindAsync(cameraDTO.reoomHistoryId);
                var camera = await context.Camera.FindAsync(cameraDTO.cameraId);
                if (camera == null)
                {
                    return new Response(false, "The camera does not exist");
                }
                if (roomHistory == null)
                {
                    return new Response(false, "The room history does not exist");
                }
                if (roomHistory.cameraId is not null)
                {
                    var existCam = await context.Camera.FindAsync(roomHistory.cameraId);
                    existCam!.cameraStatus = "Free";

                }
                roomHistory.cameraId = cameraDTO.cameraId;
                context.RoomHistories.Update(roomHistory);
                camera.cameraStatus = "InUse";

                await context.SaveChangesAsync();
                return new Response(true, "Assign The Camera to This successfully");
            }
            catch (Exception ex) {
            return new Response(false, ex.Message);
            }
        }
    }
}
