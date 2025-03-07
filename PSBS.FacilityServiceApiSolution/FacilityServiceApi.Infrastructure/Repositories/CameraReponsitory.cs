using FacilityServiceApi.Application.Interfaces;
using FacilityServiceApi.Domain.Entities;
using FacilityServiceApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using PSPS.SharedLibrary.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace FacilityServiceApi.Infrastructure.Repositories
{
    public class CameraReponsitory(FacilityServiceDbContext context) : ICamera
    {
        public async Task<Response> CreateAsync(Camera entity)
        {
            try
            {
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




        public async Task<Response> DeleteAsync(Camera entity)
        {
            try
            {
                var camera = await context.Camera.FindAsync(entity.cameraId);
                if (camera == null) return new Response(false, "Camera not found");

                camera.isDeleted = true;
                context.Update(camera);
                await context.SaveChangesAsync();

                return new Response(true, "Camera deleted successfully") { Data = camera };
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

        public Task<Response> UpdateAsync(Camera entity)
        {
            throw new NotImplementedException();
        }
    }
}
