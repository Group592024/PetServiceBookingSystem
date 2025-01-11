

namespace PSPS.SharedLibrary.Responses
{
    public record Response(bool Flag = false, string Message = null!)
    {
        public object? Data { get; init; } // Data property to hold the users or other objects
    };
}
