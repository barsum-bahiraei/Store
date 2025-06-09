using StoreBackend.Helpers;
using StoreBackend.Models;

namespace StoreBackend.Middlewares;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger, IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "errrrror");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            object response;
            if (_env.IsDevelopment())
            {
                response = ResponseHelper.Error(500, ex.Message, null);
            }
            else
            {
                response = ResponseHelper.Error(500, "Internal Server Error In Production", null);
            }

            await context.Response.WriteAsJsonAsync(response);
        }
    }
}
