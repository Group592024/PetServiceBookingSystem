

namespace PSBS.HealthCareApi.Application.DTOs
{
    public record ApiResponse<T>(
     bool Flag,
     string Message,
     T Data
 );
}
