using System.Net.Mime;
using Microsoft.AspNetCore.Mvc;

namespace Takt.API.Middleware;

internal sealed class ExceptionHandlingMiddleware(
    RequestDelegate next,
    ILogger<ExceptionHandlingMiddleware> logger,
    IHostEnvironment environment)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        // Client disconnected mid-request — not a server fault, don't log it as an error.
        catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
        {
            logger.LogDebug("Request {Path} was cancelled by the client.", context.Request.Path);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception while processing {Path}.", context.Request.Path);

            // The response is already partially on the wire — nothing safe to do.
            if (context.Response.HasStarted)
            {
                return;
            }

            var problem = new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "An unexpected error occurred.",
            };

            // Correlates the client's error response with this request's server logs.
            problem.Extensions["traceId"] = context.TraceIdentifier;

            if (environment.IsDevelopment())
            {
                problem.Detail = ex.ToString();
            }

            context.Response.Clear();
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = MediaTypeNames.Application.ProblemJson;
            await context.Response.WriteAsJsonAsync(problem);
        }
    }
}
