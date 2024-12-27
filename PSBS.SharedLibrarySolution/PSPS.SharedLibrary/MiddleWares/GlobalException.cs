using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PSPS.SharedLibrary.PSBSLogs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace PSPS.SharedLibrary.MiddleWares
{
    public class GlobalException(RequestDelegate next)
    {
        public async Task InvokeAsync(HttpContext context)
        {
            string message = "sorry, internal server error occured. Kindly try again";
            int statusCode = (int)HttpStatusCode.InternalServerError;
            string title = "Error";
            try
            {
                await next(context);

                // check if Exception is Too Many Request // 429 status code
                if (context.Response.StatusCode == StatusCodes.Status429TooManyRequests)
                {
                    title = "Warning";
                    message = "Too many requests made";
                    statusCode = (int)HttpStatusCode.TooManyRequests;
                    await ModifyHeader(context, title, message, statusCode);
                }
                //If response is UnAuthorized // 401 status code
                if (context.Response.StatusCode == StatusCodes.Status401Unauthorized)
                {
                    title = "Alert";
                    message = "You are not authorized to access";
                    statusCode = (int)HttpStatusCode.Unauthorized;
                    await ModifyHeader(context, title, message, statusCode);
                }
                // If Response is Forbidden // 403 status code
                if (context.Response.StatusCode == StatusCodes.Status403Forbidden)
                {
                    title = "Out of Access";
                    message = "You are not allowed to access";
                    statusCode = (int)HttpStatusCode.Forbidden;
                    await ModifyHeader(context, title, message, statusCode);
                }
                // if none do the default
                await ModifyHeader(context, title, message, statusCode);
            }
            catch (Exception ex)
            {
                // Log Orginal Exception 
                LogExceptions.LogException(ex);
                // check if exception is time out
                if (ex is TaskCanceledException || ex is TimeoutException)
                {
                    title = "Out of time";
                    message = "Request timeout... try again";
                    statusCode = StatusCodes.Status408RequestTimeout;
                }
            }
        }

        private async Task ModifyHeader(HttpContext context, string title, string message, int statusCode)
        {
            // display scary-free message to client
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new ProblemDetails()
            {
                Detail = message,
                Status = statusCode,
                Title = title
            }), CancellationToken.None);
            return;
        }
    }
}
